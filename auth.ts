import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { supabaseAdmin } from "@/lib/supabase";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        console.log('🔐 NextAuth SignIn Callback - FULL DEBUG:', { 
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
          accountProvider: account?.provider,
          profileEmail: profile?.email 
        })
        
        if (account?.provider === "google" && user.email) {
          console.log('🔍 NextAuth - Checking for existing profile with email:', user.email)
          
          // Check if profile already exists by email (primary identifier)
          const { data: existingProfile, error: fetchError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('email', user.email)
            .single()

          console.log('📊 NextAuth - Profile check result:', {
            existingProfile: existingProfile,
            fetchError: fetchError,
            errorCode: fetchError?.code,
            errorMessage: fetchError?.message
          })

          // PGRST116 = no rows returned (profile doesn't exist)
          if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('❌ NextAuth - Unexpected error checking profile:', fetchError)
            return true // Continue with sign in even if DB error
          }

          if (!existingProfile) {
            console.log('🆕 NextAuth - No profile found, creating new one for email:', user.email)
            
            const profileData = {
              user_id: user.id || `email_${user.email?.replace(/[@.]/g, '_')}`, // Fallback if user.id is null
              email: user.email,
              name: user.name,
              avatar_url: user.image,
            }
            
            console.log('📝 NextAuth - Profile data to insert:', profileData)
            
            // Use upsert to handle race conditions (conflict on email)
            const { data: newProfile, error: createError } = await supabaseAdmin
              .from('profiles')
              .upsert([profileData], { 
                onConflict: 'email',
                ignoreDuplicates: false 
              })
              .select('*')
              .single()

            console.log('📊 NextAuth - Profile creation result:', {
              newProfile: newProfile,
              createError: createError,
              errorCode: createError?.code,
              errorMessage: createError?.message
            })

            if (createError) {
              console.error('❌ NextAuth - Failed to create profile:', createError)
              // Check if it's a duplicate key error
              if (createError.code === '23505') {
                console.log('⚠️ NextAuth - Profile already exists (duplicate key), continuing...')
              }
            } else {
              console.log('✅ NextAuth - Profile created/updated successfully:', newProfile?.id)
            }
          } else {
            console.log('✅ NextAuth - Profile already exists:', existingProfile.id, 'for email:', existingProfile.email)
            
            // Update existing profile with latest info from Google
            const { error: updateError } = await supabaseAdmin
              .from('profiles')
              .update({
                user_id: user.id || existingProfile.user_id, // Update user_id if we have it
                name: user.name,
                avatar_url: user.image,
              })
              .eq('email', user.email)
              
            if (updateError) {
              console.error('❌ NextAuth - Failed to update existing profile:', updateError)
            } else {
              console.log('✅ NextAuth - Updated existing profile with latest Google info')
            }
          }
        } else {
          console.log('⚠️ NextAuth - Skipping profile creation - missing required data:', {
            provider: account?.provider,
            hasUserId: !!user.id,
            hasEmail: !!user.email
          })
        }
        
        return true
      } catch (error) {
        console.error('❌ NextAuth SignIn Callback Error:', error)
        return true // Continue with sign in even if error
      }
    },
  },
});