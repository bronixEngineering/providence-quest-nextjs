import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { walletAddress } = await request.json()
    
    if (!walletAddress) {
      return NextResponse.json({ error: 'Missing wallet address' }, { status: 400 })
    }

    // Get or create user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      throw profileError
    }

    let userProfile = profile
    if (!userProfile) {
      // Create profile if doesn't exist
      const { data: newProfile, error: createError } = await supabaseAdmin
        .from('profiles')
        .insert([
          {
            user_id: session.user.id!,
            email: session.user.email,
            name: session.user.name,
            avatar_url: session.user.image,
          },
        ])
        .select()
        .single()

      if (createError) throw createError
      userProfile = newProfile
    }

    // Generate nonce for wallet verification
    const nonce = nanoid(32)

    // Update profile with nonce (temporarily store for verification)
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        wallet_nonce: nonce,
        wallet_verified: false
      })
      .eq('id', userProfile.id)

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      nonce,
      message: `Please sign this message to verify your wallet ownership:\n\nNonce: ${nonce}`
    })
  } catch (error) {
    console.error('Wallet connection error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize wallet connection' },
      { status: 500 }
    )
  }
}