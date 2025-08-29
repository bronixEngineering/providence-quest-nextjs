import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🏅 User Badges API - Starting...')
    
    const session = await auth()
    if (!session?.user?.email) {
      console.log('❌ User Badges - No session or email')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userEmail = session.user.email
    console.log('🔍 User Badges - Looking for Discord connection for user:', userEmail)

    // First, get the user's Discord ID from social connections
    const { data: discordConnection, error: discordError } = await supabaseAdmin
      .from('user_social_connections')
      .select('platform_user_id')
      .eq('user_email', userEmail)
      .eq('platform', 'discord')
      .eq('is_verified', true)
      .single()

    if (discordError || !discordConnection) {
      console.log('❌ User Badges - No Discord connection found:', discordError)
      return NextResponse.json({ 
        success: true, 
        badges: [],
        message: 'No Discord connection found'
      })
    }

    const discordUserId = discordConnection.platform_user_id
    console.log('🎯 User Badges - Found Discord user ID:', discordUserId)

    // Get user badges with badge details
    const { data: userBadges, error: badgesError } = await supabaseAdmin
      .from('user_badges')
      .select(`
        *,
        badges (
          discord_role_id,
          name,
          color,
          position,
          permissions
        )
      `)
      .eq('user_discord_id', discordUserId)

    if (badgesError) {
      console.log('❌ User Badges - Failed to fetch badges:', badgesError)
      return NextResponse.json({ error: 'Failed to fetch badges' }, { status: 500 })
    }

    console.log('✅ User Badges - Successfully fetched badges:', userBadges?.length || 0)

    return NextResponse.json({
      success: true,
      badges: userBadges || [],
      discordUserId: discordUserId
    })

  } catch (error) {
    console.error('❌ User Badges API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user badges' },
      { status: 500 }
    )
  }
}
