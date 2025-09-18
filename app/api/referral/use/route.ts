import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { referralCode } = await request.json();

    if (!referralCode) {
      return NextResponse.json({ error: "Referral code required" }, { status: 400 });
    }

    // Referral code'u bul
    const { data: referralData, error: referralError } = await supabase
      .from("referral_codes")
      .select("profile_id")
      .eq("referral_code", referralCode)
      .single();

    if (referralError || !referralData) {
      return NextResponse.json({ error: "Invalid referral code" }, { status: 400 });
    }

    // Referrer'ı bul
    const { data: referrerProfile, error: referrerError } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("id", referralData.profile_id)
      .single();

    if (referrerError || !referrerProfile) {
      return NextResponse.json({ error: "Referrer profile not found" }, { status: 404 });
    }

    // Current user'ın profile'ını bul
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", session.user.email)
      .single();

    if (!currentProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Kendini referral olarak kullanamaz
    if (referrerProfile?.email === currentProfile.email) {
      return NextResponse.json({ error: "Cannot use your own referral code" }, { status: 400 });
    }

    // Daha önce referral kullanılmış mı kontrol et
    const { data: existingUsage } = await supabase
      .from("referral_usage")
      .select("id")
      .eq("referred_profile_id", currentProfile.id)
      .single();

    if (existingUsage) {
      return NextResponse.json({ error: "Referral code already used" }, { status: 400 });
    }

    // Referral usage'ı kaydet
    const { error: usageError } = await supabase.from("referral_usage").insert({
      referrer_profile_id: referralData.profile_id,
      referred_profile_id: currentProfile.id,
    });

    if (usageError) {
      return NextResponse.json({ error: "Failed to record referral usage" }, { status: 500 });
    }

    // Referrer'ın mevcut referral sayısını al (bu yeni referral dahil değil)
    const { data: currentReferrals } = await supabase
      .from("referral_usage")
      .select("id")
      .eq("referrer_profile_id", referralData.profile_id);

    // Referrer'a +20 XP ekle
    const { data: referrerStats } = await supabase
      .from("user_stats")
      .select("total_xp, total_quests_completed")
      .eq("user_email", referrerProfile.email)
      .single();

    let totalXpToAdd = 20;
    let milestoneBonus = 0;
    const newReferralCount = currentReferrals?.length || 0;

    // Milestone bonus kontrolü
    if (newReferralCount === 5) {
      milestoneBonus = 100;
      totalXpToAdd += milestoneBonus;
    } else if (newReferralCount === 10) {
      milestoneBonus = 200;
      totalXpToAdd += milestoneBonus;
    }

    console.log(milestoneBonus, currentReferrals?.length, "milestoneBonus");

    // Eğer referrer'ın stats'ı yoksa, yeni bir kayıt oluştur
    if (!referrerStats) {
      const { error: createReferrerError } = await supabase.from("user_stats").insert({
        user_email: referrerProfile.email,
        total_xp: totalXpToAdd,
        total_quests_completed: 1,
      });

      if (createReferrerError) {
        console.error("Failed to create stats for referrer:", createReferrerError);
      }
    } else {
      // Mevcut stats'ı güncelle
      const { error: xpError } = await supabase
        .from("user_stats")
        .update({
          total_xp: (referrerStats.total_xp || 0) + totalXpToAdd,
          total_quests_completed: (referrerStats.total_quests_completed || 0) + 1,
        })
        .eq("user_email", referrerProfile.email);

      if (xpError) {
        console.error("Failed to add XP to referrer:", xpError);
      }
    }

    // Referred user'a da +10 XP bonus
    const { data: referredStats } = await supabase
      .from("user_stats")
      .select("total_xp, total_quests_completed")
      .eq("user_email", currentProfile.email)
      .single();

    // Eğer referred user'ın stats'ı yoksa, yeni bir kayıt oluştur
    if (!referredStats) {
      const { error: createError } = await supabase.from("user_stats").insert({
        user_email: currentProfile.email,
        total_xp: 10,
        total_quests_completed: 1,
      });

      if (createError) {
        console.error("Failed to create stats for referred user:", createError);
      }
    } else {
      // Mevcut stats'ı güncelle
      const { error: bonusError } = await supabase
        .from("user_stats")
        .update({
          total_xp: (referredStats.total_xp || 0) + 10,
          total_quests_completed: (referredStats.total_quests_completed || 0) + 1,
        })
        .eq("user_email", currentProfile.email);

      if (bonusError) {
        console.error("Failed to add bonus XP to referred user:", bonusError);
      }
    }

    return NextResponse.json({
      message: "Referral code used successfully!",
      rewards: {
        referrer: `+${totalXpToAdd} XP${milestoneBonus > 0 ? ` (${milestoneBonus} bonus)` : ""}`,
        referred: "+10 XP",
      },
    });
  } catch (error) {
    console.error("Referral usage error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
