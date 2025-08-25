import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST() {
  try {
    console.log('🎯 Daily Check-in API - Starting check-in process...')
    
    const session = await auth()
    console.log('🔐 Daily Check-in - Session:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userEmail: session?.user?.email
    })
    
    if (!session?.user?.email) {
      console.log('❌ Daily Check-in - No session or email')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userEmail = session.user.email
    console.log('🚀 Daily Check-in - Processing for user:', userEmail)

    // Call the stored procedure to process check-in
    console.log('🔍 Daily Check-in - Calling process_daily_checkin function...')
    const { data: result, error } = await supabaseAdmin
      .rpc('process_daily_checkin', { p_user_email: userEmail })
    
    console.log('📊 Daily Check-in - Function result:', {
      result: result,
      error: error,
      errorCode: error?.code,
      errorMessage: error?.message
    })

    if (error) {
      throw error
    }

    if (!result || result.length === 0) {
      console.log('❌ Daily Check-in - No result from function')
      return NextResponse.json(
        { error: 'Failed to process check-in' },
        { status: 500 }
      )
    }

    const checkinResult = result[0]
    console.log('📈 Daily Check-in - Parsed result:', checkinResult)

    if (!checkinResult.success) {
      console.log('❌ Daily Check-in - Function returned error:', checkinResult.message)
      return NextResponse.json(
        { error: checkinResult.message },
        { status: 400 }
      )
    }

    // Get updated user stats
    console.log('🔍 Daily Check-in - Fetching updated user stats...')
    const { data: userStats, error: statsError } = await supabaseAdmin
      .from('user_stats')
      .select('*')
      .eq('user_email', userEmail)
      .single()

    console.log('📊 Daily Check-in - Updated user stats:', {
      userStats: userStats,
      statsError: statsError
    })

    if (statsError) {
      console.error('❌ Daily Check-in - Error fetching updated stats:', statsError)
    }

    return NextResponse.json({
      success: true,
      data: {
        streakDay: checkinResult.streak_day,
        xpEarned: checkinResult.xp_earned,
        tokensEarned: checkinResult.tokens_earned,
        bonusReward: checkinResult.bonus_reward,
        message: checkinResult.message,
        updatedStats: {
          totalXP: userStats?.total_xp || 0,
          level: userStats?.level || 1,
          tokens: userStats?.tokens || 0,
          currentStreak: userStats?.current_daily_streak || 0,
          longestStreak: userStats?.longest_daily_streak || 0,
          totalCheckins: userStats?.daily_quests_completed || 0,
        }
      }
    })
  } catch (error) {
    console.error('Daily checkin error:', error)
    return NextResponse.json(
      { error: 'Failed to process check-in' },
      { status: 500 }
    )
  }
}
