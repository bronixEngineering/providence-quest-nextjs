import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyMessage } from 'ethers'

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Wallet Verify API - Starting...')
    
    const session = await auth()
    if (!session?.user?.email) {
      console.log('❌ Wallet Verify - No session or email')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { walletAddress, signature, message } = await request.json()
    console.log('✍️ Wallet Verify - Request:', { 
      walletAddress, 
      signature: signature?.slice(0, 10) + '...', 
      message: message?.slice(0, 50) + '...',
      userEmail: session.user.email 
    })

    if (!walletAddress || !signature || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get pending wallet connection
    const { data: pendingWallet, error: fetchError } = await supabaseAdmin
      .from('wallet_accounts')
      .select('*')
      .eq('user_email', session.user.email)
      .eq('wallet_address', walletAddress.toLowerCase())
      .eq('is_verified', false)
      .single()

    console.log('📊 Wallet Verify - Pending wallet:', {
      pendingWallet: pendingWallet,
      fetchError: fetchError
    })

    if (!pendingWallet || fetchError) {
      return NextResponse.json({ error: 'No pending wallet connection found' }, { status: 404 })
    }

    // Verify the signature
    try {
      console.log('🔍 Wallet Verify - Attempting signature verification with:', {
        message: message,
        signature: signature,
        expectedAddress: walletAddress.toLowerCase()
      })
      
      const recoveredAddress = verifyMessage(message, signature)
      console.log('🔍 Wallet Verify - Signature verification result:', {
        expectedAddress: walletAddress.toLowerCase(),
        recoveredAddress: recoveredAddress.toLowerCase(),
        matches: recoveredAddress.toLowerCase() === walletAddress.toLowerCase()
      })

      if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        console.log('❌ Wallet Verify - Address mismatch')
        return NextResponse.json({ error: 'Invalid signature - address mismatch' }, { status: 400 })
      }
    } catch (signatureError: unknown) {
      const message = signatureError instanceof Error ? signatureError.message : String(signatureError)
      console.log('❌ Wallet Verify - Signature verification failed:', signatureError)
      return NextResponse.json({ error: 'Signature verification failed: ' + message }, { status: 400 })
    }

    // Update wallet as verified
    const { data: verifiedWallet, error: updateError } = await supabaseAdmin
      .from('wallet_accounts')
      .update({
        is_verified: true,
        verified_at: new Date().toISOString(),
        verification_signature: signature,
        nonce: null // Clear nonce after verification
      })
      .eq('id', pendingWallet.id)
      .select('*')
      .single()

    if (updateError) {
      console.log('❌ Wallet Verify - Failed to update wallet:', updateError)
      throw updateError
    }

    // Update user profile with primary wallet
    await supabaseAdmin
      .from('profiles')
      .update({
        primary_wallet_address: walletAddress.toLowerCase(),
        wallet_verified_at: new Date().toISOString()
      })
      .eq('email', session.user.email)

    console.log('✅ Wallet Verify - Wallet verified:', verifiedWallet)

    // Check if this completes the wallet connect quest
    const { data: walletQuest, error: questError } = await supabaseAdmin
      .from('quest_definitions')
      .select('*')
      .eq('type', 'web3')
      .eq('category', 'wallet_connect')
      .eq('is_active', true)
      .single()

    if (walletQuest && !questError) {
      console.log('🎯 Wallet Verify - Found wallet quest:', walletQuest)
      
      // Check if already completed
      const { data: existingCompletion, error: completionError } = await supabaseAdmin
        .from('user_quest_completions')
        .select('*')
        .eq('user_email', session.user.email)
        .eq('quest_id', walletQuest.id)
        .single()

      if (!existingCompletion) {
        // Complete the quest
        const { error: questCompletionError } = await supabaseAdmin
          .from('user_quest_completions')
          .insert([
            {
              user_email: session.user.email,
              quest_id: walletQuest.id,
              xp_earned: walletQuest.xp_reward,
              tokens_earned: walletQuest.token_reward,
              special_reward_earned: walletQuest.special_reward,
              completion_data: {
                wallet_address: walletAddress.toLowerCase(),
                verification_signature: signature,
                network_chain_id: verifiedWallet.network_chain_id
              }
            }
          ])

        if (!questCompletionError) {
          // Update user stats
          await supabaseAdmin.rpc('update_user_stats_after_quest', {
            p_user_email: session.user.email,
            p_quest_type: 'web3',
            p_xp_earned: walletQuest.xp_reward,
            p_tokens_earned: walletQuest.token_reward
          })

          console.log('🎉 Wallet Verify - Quest completed successfully!')
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        wallet: {
          address: verifiedWallet.wallet_address,
          verifiedAt: verifiedWallet.verified_at,
          isPrimary: verifiedWallet.is_primary
        },
        questCompleted: !!walletQuest,
        rewards: walletQuest ? {
          xp: walletQuest.xp_reward,
          tokens: walletQuest.token_reward,
          special: walletQuest.special_reward
        } : null
      }
    })
  } catch (error) {
    console.error('❌ Wallet Verify API Error:', error)
    return NextResponse.json(
      { error: 'Failed to verify wallet connection' },
      { status: 500 }
    )
  }
}