import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST() {
  try {
    console.log('🔌 Wallet Disconnect API - Starting...')
    
    const session = await auth()
    if (!session?.user?.email) {
      console.log('❌ Wallet Disconnect - No session or email')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userEmail = session.user.email
    console.log('🔍 Wallet Disconnect - Disconnecting wallet for user:', userEmail)

    // Delete all wallet connections for this user (both verified and pending)
    const { error: deleteError } = await supabaseAdmin
      .from('wallet_accounts')
      .delete()
      .eq('user_email', userEmail)

    if (deleteError) {
      console.log('❌ Wallet Disconnect - Failed to delete wallet connections:', deleteError)
      throw deleteError
    }

    // Clear wallet reference from profile
    await supabaseAdmin
      .from('profiles')
      .update({
        primary_wallet_address: null,
        wallet_verified_at: null
      })
      .eq('email', userEmail)

    console.log('✅ Wallet Disconnect - Wallet disconnected successfully')

    return NextResponse.json({
      success: true,
      message: 'Wallet disconnected successfully'
    })
  } catch (error) {
    console.error('❌ Wallet Disconnect API Error:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect wallet' },
      { status: 500 }
    )
  }
}
