import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Service role client for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Types for our database tables
export interface Profile {
  id: string
  user_id: string // NextAuth user ID
  email?: string
  name?: string
  avatar_url?: string
  wallet_address?: string
  wallet_nonce?: string
  wallet_verified: boolean
  level: number
  xp: number
  tokens: number
  completed_quests: number
  total_quests: number
  rank?: string
  created_at: string
  updated_at: string
}
