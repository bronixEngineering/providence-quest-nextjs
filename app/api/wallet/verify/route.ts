import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { ethers } from 'ethers'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { signature, walletAddress } = await request.json()
    
    if (!signature || !walletAddress) {
      return NextResponse.json({ error: 'Missing signature or wallet address' }, { status: 400 })
    }

    // Get user profile with stored nonce
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (!profile.wallet_nonce) {
      return NextResponse.json({ error: 'No nonce found. Please connect wallet first.' }, { status: 400 })
    }

    try {
      // Verify the signature server-side
      const message = `Please sign this message to verify your wallet ownership:\n\nNonce: ${profile.wallet_nonce}`
      const recoveredAddress = ethers.verifyMessage(message, signature)

      if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        return NextResponse.json({ error: 'Signature verification failed' }, { status: 400 })
      }

      // Update profile with verified wallet
      const { data: updatedProfile, error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ 
          wallet_address: walletAddress.toLowerCase(),
          wallet_verified: true,
          wallet_nonce: null // Clear the nonce after successful verification
        })
        .eq('id', profile.id)
        .select()
        .single()

      if (updateError) throw updateError

      return NextResponse.json({
        success: true,
        verified: true,
        message: 'Wallet successfully connected and verified!',
        profile: updatedProfile
      })
    } catch (signatureError) {
      console.error('Signature verification error:', signatureError)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
  } catch (error) {
    console.error('Wallet verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify wallet' },
      { status: 500 }
    )
  }
}