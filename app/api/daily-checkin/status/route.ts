import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('📊 Daily Check-in Status API - Starting...')
    
    const session = await auth()
    console.log('🔐 Daily Check-in Status - Session:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userEmail: session?.user?.email,
      userName: session?.user?.name
    })
    
    if (!session?.user?.email) {
      console.log('❌ Daily Check-in Status - No session or email')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userEmail = session.user.email
    const today = new Date().toISOString().split('T')[0] // UTC date
    
    console.log('📅 Daily Check-in Status - Checking for:', {
      userEmail: userEmail,
      today: today
    })

    // Check if already checked in today
    console.log('🔍 Daily Check-in Status - Querying daily_checkins...')
    const { data: todayCheckin, error: checkinError } = await supabaseAdmin
      .from('daily_checkins')
      .select('*')
      .eq('user_email', userEmail)
      .eq('checkin_date', today)
      .single()

    console.log('📊 Daily Check-in Status - Today checkin result:', {
      todayCheckin: todayCheckin,
      checkinError: checkinError,
      errorCode: checkinError?.code
    })

    // Get user stats
    console.log('🔍 Daily Check-in Status - Querying user_stats...')
    const { data: initialUserStats, error: statsError } = await supabaseAdmin
      .from('user_stats')
      .select('*')
      .eq('user_email', userEmail)
      .single()

    console.log('📊 Daily Check-in Status - User stats result:', {
      userStats: initialUserStats,
      statsError: statsError,
      errorCode: statsError?.code
    })

    if (statsError && statsError.code !== 'PGRST116') {
      console.log('❌ Daily Check-in Status - Unexpected stats error:', statsError)
      throw statsError
    }

    // If user stats don't exist, create them
    let userStats = initialUserStats
    if (!userStats && statsError?.code === 'PGRST116') {
      console.log('🆕 Daily Check-in Status - Creating initial user stats...')
      const { data: newUserStats, error: createStatsError } = await supabaseAdmin
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

      if (createStatsError) {
        console.log('❌ Daily Check-in Status - Failed to create user stats:', createStatsError)
        throw createStatsError
      }

      console.log('✅ Daily Check-in Status - User stats created:', newUserStats)
      // Use the newly created stats
      userStats = newUserStats
    }

    // Calculate next check-in time (next UTC midnight)
    const tomorrow = new Date()
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
    tomorrow.setUTCHours(0, 0, 0, 0)
    const timeUntilNext = tomorrow.getTime() - Date.now()

    const responseData = {
      canCheckinToday: !todayCheckin && (checkinError?.code === 'PGRST116' || !checkinError),
      hasCheckedInToday: !!todayCheckin,
      todayCheckin: todayCheckin || null,
      currentStreak: userStats?.current_daily_streak || 0,
      longestStreak: userStats?.longest_daily_streak || 0,
      totalCheckins: userStats?.daily_quests_completed || 0,
      totalXP: userStats?.total_xp || 0,
      level: userStats?.level || 1,
      tokens: userStats?.tokens || 0,
      nextCheckinIn: timeUntilNext,
      nextCheckinAt: tomorrow.toISOString(),
    }

    console.log('✅ Daily Check-in Status - Final response:', responseData)

    return NextResponse.json({
      success: true,
      data: responseData
    })
  } catch (error) {
    console.error('Daily checkin status error:', error)
    return NextResponse.json(
      { error: 'Failed to get checkin status' },
      { status: 500 }
    )
  }
}
