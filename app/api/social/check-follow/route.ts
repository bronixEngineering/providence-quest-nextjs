import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Check Follow API - Starting...')
    
    const session = await auth()
    if (!session?.user?.email) {
      console.log('❌ Check Follow - No session or email')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { targetUsername } = await request.json()
    if (!targetUsername) {
      return NextResponse.json({ error: 'Target username required' }, { status: 400 })
    }

    console.log('🎯 Check Follow - Checking if user follows:', targetUsername)

    // Get user's Twitter access token from session
    const twitterAccessToken = (session.user as { twitterAccessToken?: string })?.twitterAccessToken
    
    if (!twitterAccessToken) {
      console.log('❌ Check Follow - No Twitter access token found')
      return NextResponse.json({ 
        error: 'Twitter access token not found. Please login with Twitter first.',
        requiresTwitterLogin: true 
      }, { status: 401 })
    }

    console.log('🔑 Check Follow - Using Twitter access token:', twitterAccessToken?.slice(0, 20) + '...')

    // First, get the target user's ID
    const cleanUsername = targetUsername.replace('@', '')
    console.log('🎯 Check Follow - Getting user ID for:', cleanUsername)
    
    const targetUserResponse = await fetch(`https://api.twitter.com/2/users/by/username/${cleanUsername}`, {
      headers: {
        'Authorization': `Bearer ${twitterAccessToken}`
      }
    })

    console.log('📡 Check Follow - Target user response status:', targetUserResponse.status)
    
    if (!targetUserResponse.ok) {
      const errorText = await targetUserResponse.text()
      console.log('❌ Check Follow - Failed to get target user:', targetUserResponse.status, errorText)
      return NextResponse.json({ error: 'Failed to get target user info' }, { status: 400 })
    }

    const targetUserData = await targetUserResponse.json()
    console.log('📊 Check Follow - Target user data:', targetUserData)
    
    const targetUserId = targetUserData.data.id
    console.log('🆔 Check Follow - Target user ID:', targetUserId)

    // Check if user follows the target
    console.log('🔍 Check Follow - Checking follow status for user ID:', targetUserId)
    
    const followResponse = await fetch(`https://api.twitter.com/2/users/me/following?target_user_id=${targetUserId}`, {
      headers: {
        'Authorization': `Bearer ${twitterAccessToken}`
      }
    })

    console.log('📡 Check Follow - Follow response status:', followResponse.status)
    
    if (!followResponse.ok) {
      const errorText = await followResponse.text()
      console.log('❌ Check Follow - Failed to check follow status:', followResponse.status, errorText)
      return NextResponse.json({ error: 'Failed to check follow status' }, { status: 400 })
    }

    const followData = await followResponse.json()
    console.log('📊 Check Follow - Follow data:', followData)
    
    const isFollowing = followData.data && followData.data.length > 0

    console.log('✅ Check Follow - Result:', { targetUsername, isFollowing })

    return NextResponse.json({
      success: true,
      data: {
        targetUsername,
        isFollowing,
        message: isFollowing 
          ? `User is following @${targetUsername}` 
          : `User is not following @${targetUsername}`
      }
    })

  } catch (error) {
    console.error('❌ Check Follow API Error:', error)
    return NextResponse.json(
      { error: 'Failed to check follow status' },
      { status: 500 }
    )
  }
}
