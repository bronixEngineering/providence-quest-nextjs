import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('💼 Wallet Status API - Starting...')
    
    const session = await auth()
    if (!session?.user?.email) {
      console.log('❌ Wallet Status - No session or email')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userEmail = session.user.email
    console.log('🔍 Wallet Status - Checking for user:', userEmail)

    // Get user's verified wallet
    const { data: wallet, error: walletError } = await supabaseAdmin
      .from('wallet_accounts')
      .select('*')
      .eq('user_email', userEmail)
      .eq('is_verified', true)
      .single()

    console.log('📊 Wallet Status - Wallet result:', {
      wallet: wallet,
      walletError: walletError
    })

    // Get wallet connect quest
    const { data: walletQuest, error: questError } = await supabaseAdmin
      .from('quest_definitions')
      .select('*')
      .eq('type', 'web3')
      .eq('category', 'wallet_connect')
      .eq('is_active', true)
      .single()

    console.log('📊 Wallet Status - Quest result:', {
      walletQuest: walletQuest,
      questError: questError
    })

    if (!walletQuest || questError) {
      return NextResponse.json({ error: 'Wallet quest not found' }, { status: 404 })
    }

    // Check if quest is completed
    const { data: questCompletion, error: completionError } = await supabaseAdmin
      .from('user_quest_completions')
      .select('*')
      .eq('user_email', userEmail)
      .eq('quest_id', walletQuest.id)
      .single()

    console.log('📊 Wallet Status - Completion result:', {
      questCompletion: questCompletion,
      completionError: completionError
    })

    const responseData = {
      hasWallet: !!wallet && !walletError,
      wallet: wallet ? {
        address: wallet.wallet_address,
        verifiedAt: wallet.verified_at,
        isPrimary: wallet.is_primary
      } : null,
      quest: {
        id: walletQuest.id,
        title: walletQuest.title,
        description: walletQuest.description,
        xpReward: walletQuest.xp_reward,
        tokenReward: walletQuest.token_reward,
        specialReward: walletQuest.special_reward,
        isCompleted: !!questCompletion && !completionError
      }
    }

    console.log('✅ Wallet Status - Final response:', responseData)

    return NextResponse.json({
      success: true,
      data: responseData
    })
  } catch (error) {
    console.error('❌ Wallet Status API Error:', error)
    return NextResponse.json(
      { error: 'Failed to get wallet status' },
      { status: 500 }
    )
  }
}
