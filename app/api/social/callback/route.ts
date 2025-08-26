import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Social Callback API - Starting...')
    
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    
    console.log('🎫 Social Callback - Token:', token)

    if (!token) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/bounty?error=missing_token`)
    }

    const session = await auth()
    if (!session?.user?.email) {
      console.log('❌ Social Callback - No session')
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/bounty?error=no_session`)
    }

    console.log('🔐 Social Callback - Session:', {
      userEmail: session.user.email,
      userName: session.user.name
    })

    // Find pending connection by token
    const { data: pendingConnection, error: fetchError } = await supabaseAdmin
      .from('user_social_connections')
      .select('*')
      .eq('verification_token', token)
      .single()

    console.log('📊 Social Callback - Pending connection:', {
      pendingConnection: pendingConnection,
      fetchError: fetchError
    })

    if (!pendingConnection || fetchError) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/bounty?error=invalid_token`)
    }

    // Verify the connection belongs to the current user
    if (pendingConnection.user_email !== session.user.email) {
      console.log('❌ Social Callback - Email mismatch')
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/bounty?error=email_mismatch`)
    }

    // Update connection as verified
    const { data: verifiedConnection, error: updateError } = await supabaseAdmin
      .from('user_social_connections')
      .update({
        is_verified: true,
        verified_at: new Date().toISOString(),
        platform_user_id: session.user.id, // From NextAuth
        platform_username: session.user.name || session.user.email,
        platform_data: {
          image: session.user.image,
          email: session.user.email,
          connectedAt: new Date().toISOString()
        },
        verification_token: null // Clear token
      })
      .eq('id', pendingConnection.id)
      .select('*')
      .single()

    if (updateError) {
      console.log('❌ Social Callback - Failed to verify connection:', updateError)
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/bounty?error=verification_failed`)
    }

    console.log('✅ Social Callback - Connection verified:', verifiedConnection)

    // Check if this completes a social quest
    const { data: socialQuest, error: questError } = await supabaseAdmin
      .from('quest_definitions')
      .select('*')
      .eq('type', 'social')
      .eq('category', `${pendingConnection.platform}_link`)
      .eq('is_active', true)
      .single()

    if (socialQuest && !questError) {
      console.log('🎯 Social Callback - Found matching quest:', socialQuest)
      
      // Check if already completed
      const { data: existingCompletion, error: completionError } = await supabaseAdmin
        .from('user_quest_completions')
        .select('*')
        .eq('user_email', session.user.email)
        .eq('quest_id', socialQuest.id)
        .single()

      if (!existingCompletion && (completionError?.code === 'PGRST116')) {
        // Complete the quest
        const { error: questCompletionError } = await supabaseAdmin
          .from('user_quest_completions')
          .insert([
            {
              user_email: session.user.email,
              quest_id: socialQuest.id,
              xp_earned: socialQuest.xp_reward,
              tokens_earned: socialQuest.token_reward,
              special_reward_earned: socialQuest.special_reward,
              completion_data: {
                platform: pendingConnection.platform,
                platform_username: verifiedConnection.platform_username,
                connection_id: verifiedConnection.id
              }
            }
          ])

        if (!questCompletionError) {
          // Update user stats
          await supabaseAdmin.rpc('update_user_stats_after_quest', {
            p_user_email: session.user.email,
            p_quest_type: 'social',
            p_xp_earned: socialQuest.xp_reward,
            p_tokens_earned: socialQuest.token_reward
          })

          console.log('🎉 Social Callback - Quest completed successfully!')
          
          return NextResponse.redirect(
            `${process.env.NEXTAUTH_URL}/bounty?success=quest_completed&platform=${pendingConnection.platform}&xp=${socialQuest.xp_reward}&tokens=${socialQuest.token_reward}`
          )
        }
      }
    }

    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/bounty?success=connected&platform=${pendingConnection.platform}`
    )
  } catch (error) {
    console.error('❌ Social Callback API Error:', error)
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/bounty?error=callback_error`)
  }
}
