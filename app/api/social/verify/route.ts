import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('🔗 Social Verify API - Starting...')
    
    const session = await auth()
    if (!session?.user?.email) {
      console.log('❌ Social Verify - No session or email')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { platform } = await request.json()
    console.log('🎯 Social Verify - Platform requested:', platform)

    if (!['twitter', 'discord'].includes(platform)) {
      return NextResponse.json({ error: 'Invalid platform' }, { status: 400 })
    }

    // Check if already verified
    const { data: existingConnection, error: fetchError } = await supabaseAdmin
      .from('user_social_connections')
      .select('*')
      .eq('user_email', session.user.email)
      .eq('platform', platform)
      .eq('is_verified', true)
      .single()

    if (existingConnection && !fetchError) {
      return NextResponse.json({ 
        error: `${platform} account already verified`,
        connection: existingConnection 
      }, { status: 400 })
    }

    // Generate verification URL - simple NextAuth redirect
    const verifyUrl = `/api/auth/signin/${platform}?callbackUrl=${encodeURIComponent(
      `/bounty?verified=${platform}`
    )}`

    console.log('✅ Social Verify - Generated URL:', verifyUrl)

    return NextResponse.json({
      success: true,
      verifyUrl: verifyUrl,
      message: `Verify your ${platform} account`
    })
  } catch (error) {
    console.error('❌ Social Verify API Error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate verification' },
      { status: 500 }
    )
  }
}
