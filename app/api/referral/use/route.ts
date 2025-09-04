import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { referralCode } = await request.json();
    
    if (!referralCode) {
      return NextResponse.json({ error: 'Referral code required' }, { status: 400 });
    }

    // Referral code'u bul
    const { data: referralData, error: referralError } = await supabase
      .from('referral_codes')
      .select('profile_id')
      .eq('referral_code', referralCode)
      .single();

    if (referralError || !referralData) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 });
    }

    // Referrer'ı bul
    const { data: referrerProfile } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', referralData.profile_id)
      .single();

    // Current user'ın profile'ını bul
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', session.user.email)
      .single();

    if (!currentProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Kendini referral olarak kullanamaz
    if (referrerProfile?.email === currentProfile.email) {
      return NextResponse.json({ error: 'Cannot use your own referral code' }, { status: 400 });
    }

    // Daha önce referral kullanılmış mı kontrol et
    const { data: existingUsage } = await supabase
      .from('referral_usage')
      .select('id')
      .eq('referred_profile_id', currentProfile.id)
      .single();

    if (existingUsage) {
      return NextResponse.json({ error: 'Referral code already used' }, { status: 400 });
    }

    // Referral usage'ı kaydet
    const { error: usageError } = await supabase
      .from('referral_usage')
      .insert({
        referrer_profile_id: referralData.profile_id,
        referred_profile_id: currentProfile.id
      });

    if (usageError) {
      return NextResponse.json({ error: 'Failed to record referral usage' }, { status: 500 });
    }

    // Referrer'a +100 XP ekle
    const { error: xpError } = await supabase
      .from('user_stats')
      .update({ 
        total_xp: supabase.sql`total_xp + 100`,
        total_quests_completed: supabase.sql`total_quests_completed + 1`
      })
      .eq('user_email', referrerProfile.email);

    if (xpError) {
      console.error('Failed to add XP to referrer:', xpError);
    }

    // Referred user'a da +50 XP bonus
    const { error: bonusError } = await supabase
      .from('user_stats')
      .update({ 
        total_xp: supabase.sql`total_xp + 50`,
        total_quests_completed: supabase.sql`total_quests_completed + 1`
      })
      .eq('user_email', currentProfile.email);

    if (bonusError) {
      console.error('Failed to add bonus XP to referred user:', bonusError);
    }

    return NextResponse.json({ 
      message: 'Referral code used successfully!',
      rewards: {
        referrer: '+100 XP',
        referred: '+50 XP'
      }
    });

  } catch (error) {
    console.error('Referral usage error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
