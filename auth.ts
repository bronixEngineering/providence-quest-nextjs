/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Twitter from "next-auth/providers/twitter";
import Discord from "next-auth/providers/discord";
import { supabaseAdmin } from "@/lib/supabase";

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: true,
  providers: [
    Google,
    Twitter,
    Discord({
      clientId: process.env.AUTH_DISCORD_ID!,
      clientSecret: process.env.AUTH_DISCORD_SECRET!,
    })
  ],
  callbacks: {
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
              existingProfile.email
            );

            // Update existing profile with latest info from Google
            const { error: updateError } = await supabaseAdmin
              .from("profiles")
              .update({
                user_id: user.id || existingProfile.user_id, // Update user_id if we have it
                name: user.name,
                avatar_url: user.image,
              })
              .eq("email", user.email);

            if (updateError) {
              console.error(
                "❌ NextAuth - Failed to update existing profile:",
                updateError
              );
            } else {
              console.log(
                "✅ NextAuth - Updated existing profile with latest Google info"
              );
            }
          }
        }

        // Handle social verification for Twitter/Discord (tie to current user)
        if (account?.provider === "twitter" || account?.provider === "discord") {
          try {
            const ownerEmail = user.email || (profile as any)?.email || null
            if (!ownerEmail) {
              console.log(`⚠️ NextAuth - Missing email for ${account.provider} verification; skipping DB write`)
              return true
            }

            console.log(`🎯 NextAuth - Verifying ${account.provider} account for existing user:`, ownerEmail);

            // Update or create social connection
            const { data: socialConnection, error: socialError } = await supabaseAdmin
              .from('user_social_connections')
              .upsert([
                {
                  user_email: ownerEmail,
                  platform: account.provider,
                  platform_user_id: user.id,
                  platform_username: user.name || ownerEmail,
                  platform_data: {
                    image: user.image,
                    email: ownerEmail,
                    connectedAt: new Date().toISOString()
                  },
                  is_verified: true,
                  verified_at: new Date().toISOString(),
                }
              ], { 
                onConflict: 'user_email,platform',
                ignoreDuplicates: false 
              })
              .select('*')
              .single()

            if (socialError) {
              console.log(`❌ NextAuth - Failed to create ${account.provider} connection:`, socialError);
            } else {
              console.log(`✅ NextAuth - ${account.provider} connection created:`, socialConnection);

              // Check and complete social quest
              const { data: socialQuest, error: questError } = await supabaseAdmin
                .from('quest_definitions')
                .select('*')
                .eq('type', 'social')
                .eq('category', `${account.provider}_link`)
                .eq('is_active', true)
                .single()

              if (socialQuest && !questError) {
                // Check if already completed
                const { data: existingCompletion } = await supabaseAdmin
                  .from('user_quest_completions')
                  .select('*')
                  .eq('user_email', ownerEmail)
                  .eq('quest_id', socialQuest.id)
                  .single()

                if (!existingCompletion) {
                  // Complete the quest
                  const { error: completionError } = await supabaseAdmin
                    .from('user_quest_completions')
                    .insert([
                      {
                        user_email: ownerEmail,
                        quest_id: socialQuest.id,
                        xp_earned: socialQuest.xp_reward,
                        tokens_earned: socialQuest.token_reward,
                        special_reward_earned: socialQuest.special_reward,
                        completion_data: {
                          platform: account.provider,
                          platform_username: user.name,
                          connected_at: new Date().toISOString()
                        }
                      }
                    ])

                  if (!completionError) {
                    console.log(`🎉 NextAuth - ${account.provider} social quest completed!`);
                  }
                }
              }
            }
          } catch (error) {
            console.error(`❌ NextAuth - Social quest processing error for ${account?.provider}:`, error);
          }
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
