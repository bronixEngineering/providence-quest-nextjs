import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userEmail = session.user.email

    // Get user stats
    const { data: userStats, error: statsError } = await supabaseAdmin
      .from('user_stats')
      .select('*')
      .eq('user_email', userEmail)
      .single()



    // If user stats don't exist, create them (same logic as daily checkin)
    if (!userStats && statsError?.code === 'PGRST116') {
      const { data: newUserStats, error: createError } = await supabaseAdmin
        .from('user_stats')
        .insert([{
          user_email: userEmail,
          total_xp: 0,
          level: 1,
          tokens: 0,
          total_quests_completed: 0,
          daily_quests_completed: 0,
          social_quests_completed: 0,
          web3_quests_completed: 0,
          current_daily_streak: 0,
          longest_daily_streak: 0,
          connected_social_accounts: 0,
          badges: []
        }])
        .select('*')
        .single()

      if (createError) {
        throw createError
      }

      return NextResponse.json({
        success: true,
        data: newUserStats
      })
    }

    if (statsError && statsError.code !== 'PGRST116') {
      console.log('❌ User Stats - Unexpected error:', statsError)
      throw statsError
    }

    console.log('✅ User Stats - Success:', userStats)
    return NextResponse.json({
      success: true,
      data: userStats
    })
  } catch (error) {
    console.error('❌ User Stats API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    )
  }
}
