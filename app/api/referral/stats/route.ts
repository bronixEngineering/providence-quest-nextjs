import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

interface ProfileData {
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET() {
  try {
    // Auth kontrolü
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email;

    // Profile'ı bul
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", userEmail)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Referral code'unu al
    const { data: referralCode } = await supabase
      .from("referral_codes")
      .select("referral_code")
      .eq("profile_id", profile.id)
      .single();

    // Kaç kişi referral'ını kullandı
    const { data: referrals, error: referralsError } = await supabase
      .from("referral_usage")
      .select("referred_profile_id, used_at")
      .eq("referrer_profile_id", profile.id);

    if (referralsError) {
      return NextResponse.json({ error: "Failed to fetch referrals" }, { status: 500 });
    }

    // Referral kullanan profile'ların bilgilerini al
    const referredProfileIds = referrals?.map((r) => r.referred_profile_id) || [];
    let referredProfiles: ProfileData[] = [];

    if (referredProfileIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("name, email, avatar_url, created_at")
        .in("id", referredProfileIds);

      referredProfiles = profiles || [];
    }

    const referralCount = referrals?.length || 0;
    let totalEarnedXP = referralCount * 20;

    if (referralCount >= 5) {
      totalEarnedXP += 100;
    }
    if (referralCount >= 10) {
      totalEarnedXP += 200;
    }

    // Current user'ın daha önce referral kullanıp kullanmadığını kontrol et
    const { data: hasUsedReferral } = await supabase
      .from("referral_usage")
      .select("id")
      .eq("referred_profile_id", profile.id)
      .single();

    return NextResponse.json({
      referralCode: referralCode?.referral_code || null,
      totalReferrals: referrals?.length || 0,
      totalEarnedXP,
      hasUsedReferral: !!hasUsedReferral,
      referrals: referredProfiles.map((profile, index) => ({
        ...profile,
        joinedAt: referrals?.[index]?.used_at,
      })),
    });
  } catch (error) {
    console.error("Referral stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
