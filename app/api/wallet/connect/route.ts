import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  try {
    console.log('🔗 Wallet Connect API - Starting...')
    
    const session = await auth()
    if (!session?.user?.email) {
      console.log('❌ Wallet Connect - No session or email')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { walletAddress } = await request.json()
    console.log('💼 Wallet Connect - Request:', { walletAddress, userEmail: session.user.email })

    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 })
    }

    // Check if user already has a verified wallet
    const { data: existingWallet, error: existingError } = await supabaseAdmin
      .from('wallet_accounts')
      .select('*')
      .eq('user_email', session.user.email)
      .eq('is_verified', true)
      .single()

    console.log('🔍 Wallet Connect - Existing wallet check:', {
      existingWallet: existingWallet,
      existingError: existingError
    })

    if (existingWallet) {
      return NextResponse.json({ 
        error: 'Wallet already connected',
        wallet: {
          address: existingWallet.wallet_address,
          verifiedAt: existingWallet.verified_at
        }
      }, { status: 400 })
    }

    // Check if this wallet is already connected to another user
    const { data: walletOwner, error: ownerError } = await supabaseAdmin
      .from('wallet_accounts')
      .select('user_email, is_verified')
      .eq('wallet_address', walletAddress.toLowerCase())
      .eq('is_verified', true)
      .single()

    if (walletOwner && !ownerError) {
      return NextResponse.json({ 
        error: 'Wallet already connected to another account' 
      }, { status: 400 })
    }

    // Generate nonce for signature verification
    const nonce = nanoid(16)
    const verificationMessage = `Connect wallet to Providence Quest\n\nNonce: ${nonce}\nAddress: ${walletAddress.toLowerCase()}\nUser: ${session.user.email}`

    console.log('🎲 Wallet Connect - Generated nonce:', { nonce, message: verificationMessage })

    // Store pending wallet connection
    const { data: pendingWallet, error: insertError } = await supabaseAdmin
      .from('wallet_accounts')
      .upsert([
        {
          user_email: session.user.email,
          wallet_address: walletAddress.toLowerCase(),
          nonce: nonce,
          verification_message: verificationMessage,
          is_verified: false,
          is_primary: true,
          network_chain_id: 1 // Ethereum mainnet
        }
      ], { 
        onConflict: 'user_email,wallet_address',
        ignoreDuplicates: false 
      })
      .select('*')
      .single()

    if (insertError) {
      console.log('❌ Wallet Connect - Failed to create pending connection:', insertError)
      throw insertError
    }

    console.log('✅ Wallet Connect - Pending connection created:', pendingWallet)

    return NextResponse.json({
      success: true,
      data: {
        nonce: nonce,
        message: verificationMessage,
        walletAddress: walletAddress.toLowerCase(),
        requiresSignature: true
      }
    })
  } catch (error) {
    console.error('❌ Wallet Connect API Error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate wallet connection' },
      { status: 500 }
    )
  }
}