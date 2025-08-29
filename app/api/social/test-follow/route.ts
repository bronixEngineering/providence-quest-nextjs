/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function GET() {
  try {
    console.log('🧪 Test Follow API - Starting...')
    
    const session = await auth()
    if (!session?.user?.email) {
      console.log('❌ Test Follow - No session or email')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('👤 Test Follow - User:', session.user.email)
    console.log('🔑 Test Follow - Twitter access token exists:', !!(session.user as any)?.twitterAccessToken)
    console.log('🔑 Test Follow - Twitter access token:', (session.user as any)?.twitterAccessToken?.slice(0, 20) + '...')

    if (!(session.user as any)?.twitterAccessToken) {
      return NextResponse.json({
        success: false,
        error: 'No Twitter access token found. Please login with Twitter first.',
        data: {
          user: session.user.email,
          hasTwitterToken: false,
          sessionKeys: Object.keys(session.user || {})
        }
      })
    }

    // Direct follow check logic (no server-side fetch)
    const twitterAccessToken = (session.user as any).twitterAccessToken
    const targetUsername = 'PlayProvidence'
    const cleanUsername = targetUsername.replace('@', '')
    
    console.log('🎯 Test Follow - Getting user ID for:', cleanUsername)
    
    // Get target user ID
    const targetUserResponse = await fetch(`https://api.twitter.com/2/users/by/username/${cleanUsername}`, {
      headers: {
        'Authorization': `Bearer ${twitterAccessToken}`
      }
    })

    console.log('📡 Test Follow - Target user response status:', targetUserResponse.status)
    
    if (!targetUserResponse.ok) {
      const errorText = await targetUserResponse.text()
      console.log('❌ Test Follow - Failed to get target user:', targetUserResponse.status, errorText)
      return NextResponse.json({ 
        success: false,
        error: 'Failed to get target user info',
        status: targetUserResponse.status,
        errorText
      })
    }

    const targetUserData = await targetUserResponse.json()
    console.log('📊 Test Follow - Target user data:', targetUserData)
    
    const targetUserId = targetUserData.data.id
    console.log('🆔 Test Follow - Target user ID:', targetUserId)

    // Check follow status
    const followResponse = await fetch(`https://api.twitter.com/2/users/me/following?target_user_id=${targetUserId}`, {
      headers: {
        'Authorization': `Bearer ${twitterAccessToken}`
      }
    })

    console.log('📡 Test Follow - Follow response status:', followResponse.status)
    
    if (!followResponse.ok) {
      const errorText = await followResponse.text()
      console.log('❌ Test Follow - Failed to check follow status:', followResponse.status, errorText)
      return NextResponse.json({ 
        success: false,
        error: 'Failed to check follow status',
        status: followResponse.status,
        errorText
      })
    }

    const followData = await followResponse.json()
    console.log('📊 Test Follow - Follow data:', followData)
    
    const isFollowing = followData.data && followData.data.length > 0

    return NextResponse.json({
      success: true,
      data: {
        user: session.user.email,
        hasTwitterToken: true,
        targetUsername: 'PlayProvidence',
        targetUserId: targetUserId,
        isFollowing: isFollowing,
        followData: followData
      }
    })

  } catch (error) {
    console.error('❌ Test Follow API Error:', error)
    return NextResponse.json(
      { error: 'Failed to test follow status' },
      { status: 500 }
    )
  }
}
