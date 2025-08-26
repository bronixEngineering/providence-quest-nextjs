import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('📊 User Stats API - Starting...')
    
    const session = await auth()
    if (!session?.user?.email) {
      console.log('❌ User Stats - No session or email')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userEmail = session.user.email
    console.log('🔍 User Stats - Fetching for:', userEmail)

    // Get user stats
    const { data: userStats, error: statsError } = await supabaseAdmin
      .from('user_stats')
      .select('*')
      .eq('user_email', userEmail)
      .single()

    console.log('📊 User Stats - Result:', {
      userStats: userStats,
      statsError: statsError,
      errorCode: statsError?.code
    })

    // If user stats don't exist, create them (same logic as daily checkin)
    if (!userStats && statsError?.code === 'PGRST116') {
      console.log('🆕 User Stats - Creating initial stats...')
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
        console.log('❌ User Stats - Failed to create:', createError)
        throw createError
      }

      console.log('✅ User Stats - Created:', newUserStats)
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
