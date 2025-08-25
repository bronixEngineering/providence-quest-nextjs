/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const session = await auth()
    console.log('📊 Profile API - Session:', {
      userId: session?.user?.id,
      email: session?.user?.email,
      name: session?.user?.name
    })
    
    if (!session?.user) {
      console.log('❌ Profile API - No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔍 Profile API - Looking for profile with user_id:', session.user.id)

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    console.log('📊 Profile API - Supabase response:', {
      profile: profile,
      error: profileError,
      errorCode: profileError?.code
    })

    if (profileError && profileError.code !== 'PGRST116') {
      console.log('❌ Profile API - Unexpected error:', profileError)
      throw profileError
    }

    if (!profile) {
      console.log('🆕 Profile API - Profile not found, creating new one')
      const profileData = {
        user_id: session.user.id!,
        email: session.user.email,
        name: session.user.name,
        avatar_url: session.user.image,
      }
      console.log('📝 Profile API - Profile data to insert:', profileData)

      // Create profile if doesn't exist
      const { data: newProfile, error: createError } = await supabaseAdmin
        .from('profiles')
        .insert([profileData])
        .select('*')
        .single()

      console.log('📊 Profile API - Profile creation result:', {
        newProfile: newProfile,
        createError: createError
      })

      if (createError) {
        console.log('❌ Profile API - Failed to create profile:', createError)
        throw createError
      }

      console.log('✅ Profile API - Profile created successfully')
      return NextResponse.json({
        success: true,
        profile: newProfile
      })
    }

    return NextResponse.json({
      success: true,
      profile
    })
  } catch (error) {
    console.error('❌ Profile API - Fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updates = await request.json()
    
    // Only allow updating certain fields
    const allowedFields = ['name', 'avatar_url']
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key]
        return obj
      }, {} as any)

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update(filteredUpdates)
      .eq('user_id', session.user.id)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      profile: updatedProfile
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
