/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Twitter from "next-auth/providers/twitter";
import Discord from "next-auth/providers/discord";
import { supabaseAdmin } from "@/lib/supabase";

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/bounty",
  },
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
      checks: ["pkce", "state"],
      authorization: {
        url: "https://www.epicgames.com/id/authorize",
        params: {
          response_type: "code",
          scope: "openid basic_profile",
          client_id: process.env.EPIC_CLIENT_ID, // Explicit client_id parameter
        },
      },
      token: {
        url: "https://api.epicgames.dev/epic/oauth/v2/token",
        async request({
          params,
          checks,
          provider,
        }: {
          params: any;
          checks: any;
          provider: any;
        }) {
          const response = await fetch(provider.token.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Basic ${btoa(
                `${process.env.EPIC_CLIENT_ID}:${process.env.EPIC_CLIENT_SECRET}`
              )}`,
            },
            body: new URLSearchParams({
              grant_type: "authorization_code",
              code: String(params.code || ""),
              redirect_uri: String(params.redirect_uri || provider.callbackUrl),
              code_verifier: String((checks as any)?.code_verifier || ""),
            }),
          });

          const tokens = await response.json();
          if (!response.ok) {
            throw new Error(`Token exchange failed: ${JSON.stringify(tokens)}`);
          }
          return { tokens };
        },
      },
      userinfo: {
        url: "https://api.epicgames.dev/epic/oauth/v2/userInfo",
        async request({ tokens, provider }: { tokens: any; provider: any }) {
          const response = await fetch(provider.userinfo.url, {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
            },
          });
          const profile = await response.json();
          if (!response.ok) {
            throw new Error(
              `UserInfo request failed: ${JSON.stringify(profile)}`
            );
          }
          return profile;
        },
      },
      clientId: process.env.EPIC_CLIENT_ID,
      clientSecret: process.env.EPIC_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name:
            profile.preferred_username || profile.name || profile.display_name,
          email: profile.email,
          image: null,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, account, user }) {
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
      if (!session.user) session.user = {} as any;
      (session.user as any).email = (token as any).email;
      (session.user as any).name = (token as any).name;
      (session.user as any).image = (token as any).picture;
      (session as any).authProvider = (token as any).authProvider;
      (session.user as any).appUserId = (token as any).appUserId;
      (session.user as any).twitterAccessToken = (
        token as any
      ).twitterAccessToken;

      return session;
    },
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === "google" && user.email) {
          // Check if profile already exists by email (primary identifier)
          const { data: existingProfile, error: fetchError } =
            await supabaseAdmin
              .from("profiles")
              .select("*")
              .eq("email", user.email)
              .single();

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
          console.log("🔑 SignIn - Account debug:", {
            provider: account.provider,
            hasAccessToken: !!account.access_token,
            accessTokenPreview: account.access_token?.slice(0, 20) + "...",
            accountKeys: Object.keys(account),
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
