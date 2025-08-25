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
        console.log('🔐 NextAuth SignIn Callback:', { user, account, profile })
        
        if (account?.provider === "google" && user.id) {
          // Check if profile already exists
          const { data: existingProfile, error: fetchError } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('user_id', user.id)
            .single()

          if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('❌ NextAuth - Error checking profile:', fetchError)
            return true // Continue with sign in even if DB error
          }

          if (!existingProfile) {
            console.log('🆕 NextAuth - Creating new profile for user:', user.id)
            
            const { error: createError } = await supabaseAdmin
              .from('profiles')
              .insert([
                {
                  user_id: user.id,
                  email: user.email,
                  name: user.name,
                  avatar_url: user.image,
                },
              ])

            if (createError) {
              console.error('❌ NextAuth - Failed to create profile:', createError)
              // Continue with sign in even if profile creation fails
            } else {
              console.log('✅ NextAuth - Profile created successfully')
            }
          } else {
            console.log('✅ NextAuth - Profile already exists')
          }
        }
        
        return true
      } catch (error) {
        console.error('❌ NextAuth SignIn Callback Error:', error)
        return true // Continue with sign in even if error
      }
    },
  },
});


