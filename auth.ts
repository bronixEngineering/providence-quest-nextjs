/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Twitter from "next-auth/providers/twitter";
import Discord from "next-auth/providers/discord";
import { supabaseAdmin } from "@/lib/supabase";

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: true,
  session: { strategy: "jwt" },
  providers: [
    Google,
    Twitter({
      clientId: process.env.AUTH_TWITTER_ID,
      clientSecret: process.env.AUTH_TWITTER_SECRET,
    }),
    Discord({
      clientId: process.env.AUTH_DISCORD_ID!,
      clientSecret: process.env.AUTH_DISCORD_SECRET!,
    }),
    {
      id: "epic",
      name: "Epic Games",
      type: "oauth",
      authorization: {
        url: "https://www.epicgames.com/id/authorize",
        params: {
          scope: "basic_profile",
          response_type: "code",
        },
      },
      token: "https://api.epicgames.dev/epic/oauth/v1/token",
      userinfo: "https://api.epicgames.dev/epic/oauth/v1/userinfo",
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.preferred_username || profile.name,
          email: profile.email,
          image: null, // Epic doesn't provide profile images via OAuth
        };
      },
      clientId: process.env.AUTH_EPIC_ID,
      clientSecret: process.env.AUTH_EPIC_SECRET,
    },
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      console.log('🔑 JWT Callback Debug:', {
        hasAccount: !!account,
        provider: account?.provider,
        hasAccessToken: !!account?.access_token,
        accessTokenPreview: account?.access_token?.slice(0, 20) + '...',
        tokenKeys: Object.keys(token || {})
      });

      // Store Twitter access token if available
      if (account?.provider === "twitter" && account.access_token) {
        (token as any).twitterAccessToken = account.access_token;
        console.log('🔑 JWT - Twitter access token stored successfully');
        console.log('🔑 JWT - Token keys after storing:', Object.keys(token));
      } else if (account?.provider === "twitter") {
        console.log('❌ JWT - Twitter login but no access token found');
        console.log('❌ JWT - Account object:', account);
      }

      // When linking a social provider while already logged in, keep current identity
      if (
        account &&
        ["discord", "twitter"].includes(account.provider) &&
        token?.email
      ) {
        return token;
      }
      // Populate token on initial login
      if (user) {
        token.email = (user as any).email ?? token.email;
        token.name = (user as any).name ?? token.name;
        token.picture = (user as any).image ?? (token as any).picture;
        token.sub = (user as any).id ?? token.sub;
        if (account?.provider) {
          (token as any).authProvider = account.provider;
        }
      }
      // Ensure stable app user id on the token
      if (!(token as any).appUserId && (token as any).email) {
        const { data: prof } = await supabaseAdmin
          .from("profiles")
          .select("user_id")
          .eq("email", (token as any).email)
          .single();
        if (prof?.user_id) {
          (token as any).appUserId = prof.user_id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      console.log('🔑 Session Callback Debug:', {
        tokenKeys: Object.keys(token || {}),
        hasTwitterToken: !!(token as any).twitterAccessToken,
        twitterTokenPreview: (token as any).twitterAccessToken?.slice(0, 20) + '...'
      });

      if (!session.user) session.user = {} as any;
      (session.user as any).email = (token as any).email;
      (session.user as any).name = (token as any).name;
      (session.user as any).image = (token as any).picture;
      (session as any).authProvider = (token as any).authProvider;
      (session.user as any).appUserId = (token as any).appUserId;
      (session.user as any).twitterAccessToken = (token as any).twitterAccessToken;
      
      console.log('🔑 Session Callback - Final session keys:', Object.keys(session.user));
      
      return session;
    },
    async signIn({ user, account, profile }) {
      try {
        console.log("🔐 NextAuth SignIn Callback - FULL DEBUG:", {
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
          accountProvider: account?.provider,
          profileEmail: profile?.email,
        });

        if (account?.provider === "google" && user.email) {
          console.log(
            "🔍 NextAuth - Checking for existing profile with email:",
            user.email
          );

          // Check if profile already exists by email (primary identifier)
          const { data: existingProfile, error: fetchError } =
            await supabaseAdmin
              .from("profiles")
              .select("*")
              .eq("email", user.email)
              .single();

          console.log("📊 NextAuth - Profile check result:", {
            existingProfile: existingProfile,
            fetchError: fetchError,
            errorCode: fetchError?.code,
            errorMessage: fetchError?.message,
          });

          // PGRST116 = no rows returned (profile doesn't exist)
          if (fetchError && fetchError.code !== "PGRST116") {
            console.error(
              "❌ NextAuth - Unexpected error checking profile:",
              fetchError
            );
            return true; // Continue with sign in even if DB error
          }

          if (!existingProfile) {
            console.log(
              "🆕 NextAuth - No profile found, creating new one for email:",
              user.email
            );

            const profileData = {
              user_id: user.id || `email_${user.email?.replace(/[@.]/g, "_")}`, // Fallback if user.id is null
              email: user.email,
              name: user.name,
              avatar_url: user.image,
            };

            console.log("📝 NextAuth - Profile data to insert:", profileData);

            // Use upsert to handle race conditions (conflict on email)
            const { data: newProfile, error: createError } = await supabaseAdmin
              .from("profiles")
              .upsert([profileData], {
                onConflict: "email",
                ignoreDuplicates: false,
              })
              .select("*")
              .single();

            console.log("📊 NextAuth - Profile creation result:", {
              newProfile: newProfile,
              createError: createError,
              errorCode: createError?.code,
              errorMessage: createError?.message,
            });

            if (createError) {
              console.error(
                "❌ NextAuth - Failed to create profile:",
                createError
              );
              // Check if it's a duplicate key error
              if (createError.code === "23505") {
                console.log(
                  "⚠️ NextAuth - Profile already exists (duplicate key), continuing..."
                );
              }
            } else {
              console.log(
                "✅ NextAuth - Profile created/updated successfully:",
                newProfile?.id
              );
            }
          } else {
            console.log(
              "✅ NextAuth - Profile already exists:",
              existingProfile.id,
              "for email:",
              existingProfile.email,
              "- skipping update"
            );
          }
        }

        // Handle social verification for Twitter/Discord/Epic (tie to current user)
        if (
          account?.provider === "twitter" ||
          account?.provider === "discord" ||
          account?.provider === "epic"
        ) {
          console.log('🔑 SignIn - Account debug:', {
            provider: account.provider,
            hasAccessToken: !!account.access_token,
            accessTokenPreview: account.access_token?.slice(0, 20) + '...',
            accountKeys: Object.keys(account)
          });
          try {
            // Pull current app session (Google) to get stable user_id
            const current = await auth();
            const ownerUserId = (current as any)?.user?.appUserId || null;
            const ownerEmail =
              current?.user?.email ||
              (user as any)?.email ||
              (profile as any)?.email ||
              null;
            if (!ownerEmail) {
              console.log(
                `⚠️ NextAuth - Missing email for ${account.provider} verification; skipping DB write`
              );
              return "/bounty";
            }

            // Get the real platform user ID from the account object
            const platformUserId =
              account.provider === "discord"
                ? (account as any).providerAccountId // Discord's real user ID
                : user.id; // For Twitter/Epic, use user.id

            // Get the correct platform username
            let platformUsername = user.name || ownerEmail;
            if (account.provider === "twitter") {
              // Twitter v2 API puts the username under profile.data.username
              platformUsername =
                (profile as any)?.data?.username || 
                (account as any).screen_name || 
                user.name || 
                ownerEmail;
            } else if (account.provider === "epic") {
              // Epic uses preferred_username or name
              platformUsername = user.name || ownerEmail;
            }

                         console.log(
               `🎯 NextAuth - Verifying ${account.provider} account for existing user:`,
               {
                 ownerEmail,
                 ownerUserId,
                 platformUserId,
                 platformUsername,
                 userFromProvider: user.id,
                 accountProviderAccountId: (account as any).providerAccountId,
                 accountScreenName: (account as any).screen_name,
                 profileDataUsername: (profile as any)?.data?.username,
               }
             );

            // Update or create social connection
            const { data: socialConnection, error: socialError } =
              await supabaseAdmin
                .from("user_social_connections")
                .upsert(
                  [
                    {
                      user_email: ownerEmail,
                      user_id: ownerUserId,
                      platform: account.provider,
                      platform_user_id: platformUserId, // Use the real platform user ID
                      platform_username: platformUsername, // Use the correct platform username
                      platform_data: {
                        image: user.image,
                        email: ownerEmail,
                        connectedAt: new Date().toISOString(),
                      },
                      is_verified: true,
                      verified_at: new Date().toISOString(),
                    },
                  ],
                  {
                    onConflict: ownerUserId
                      ? "user_id,platform"
                      : "user_email,platform",
                    ignoreDuplicates: false,
                  }
                )
                .select("*")
                .single();

            if (socialError) {
              console.log(
                `❌ NextAuth - Failed to create ${account.provider} connection:`,
                socialError
              );
            } else {
              console.log(
                `✅ NextAuth - ${account.provider} connection created:`,
                socialConnection
              );

              // Check and complete social quest
              const { data: socialQuest, error: questError } =
                await supabaseAdmin
                  .from("quest_definitions")
                  .select("*")
                  .eq("type", "social")
                  .eq("category", `${account.provider}_link`)
                  .eq("is_active", true)
                  .single();

              if (socialQuest && !questError) {
                // Check if already completed (allow 0 rows without error)
                const { data: existingCompletion, error: existingErr } =
                  await supabaseAdmin
                    .from("user_quest_completions")
                    .select("id")
                    .eq(
                      ownerUserId ? "user_id" : "user_email",
                      ownerUserId || ownerEmail
                    )
                    .eq("quest_id", socialQuest.id)
                    .maybeSingle();

                if (!existingCompletion) {
                  // Complete the quest
                  const { error: completionError } = await supabaseAdmin
                    .from("user_quest_completions")
                    .insert([
                      {
                        user_email: ownerEmail,
                        user_id: ownerUserId,
                        quest_id: socialQuest.id,
                        xp_earned: socialQuest.xp_reward,
                        tokens_earned: socialQuest.token_reward,
                        special_reward_earned: socialQuest.special_reward,
                        completion_data: {
                          platform: account.provider,
                          platform_username: user.name,
                          connected_at: new Date().toISOString(),
                        },
                      },
                    ]);

                  if (!completionError) {
                    console.log(
                      `🎉 NextAuth - ${account.provider} social quest completed!`
                    );
                  }
                }
              }
            }
          } catch (error) {
            console.error(
              `❌ NextAuth - Social quest processing error for ${account?.provider}:`,
              error
            );
          }
          // Prevent provider from becoming the active session – bounce back to bounty
          return "/bounty";
        } else {
          console.log(
            "⚠️ NextAuth - Skipping profile creation - missing required data:",
            {
              provider: account?.provider,
              hasUserId: !!user.id,
              hasEmail: !!user.email,
            }
          );
        }

        return true;
      } catch (error) {
        console.error("❌ NextAuth SignIn Callback Error:", error);
        return true; // Continue with sign in even if error
      }
    },
  },
});
