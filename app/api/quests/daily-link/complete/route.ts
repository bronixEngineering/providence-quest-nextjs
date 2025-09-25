import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { questId } = body as { questId?: string };
    if (!questId) {
      return NextResponse.json({ error: "questId is required" }, { status: 400 });
    }

    // Find quest
    const { data: quest, error: questError } = await supabaseAdmin
      .from("quest_definitions")
      .select("id, type, category, xp_reward, token_reward, special_reward")
      .eq("id", questId)
      .eq("is_active", true)
      .single();

    if (questError || !quest) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }

    // Enforce daily quest type
    if (quest.type !== "daily") {
      return NextResponse.json({ error: "Quest is not daily" }, { status: 400 });
    }

    // Check already completed
    const { data: existing } = await supabaseAdmin
      .from("user_quest_completions")
      .select("id")
      .eq("user_email", session.user.email)
      .eq("quest_id", questId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: true, alreadyCompleted: true });
    }

    // Insert completion
    const { error: insertError } = await supabaseAdmin
      .from("user_quest_completions")
      .insert([
        {
          user_email: session.user.email,
          quest_id: questId,
          xp_earned: quest.xp_reward,
          tokens_earned: quest.token_reward,
          special_reward_earned: quest.special_reward,
          completion_data: {
            completed_at: new Date().toISOString(),
            note: "Daily link quest completed via click",
          },
        },
      ]);

    if (insertError) {
      return NextResponse.json({ error: "Failed to complete quest" }, { status: 500 });
    }

    // Update stats
    await supabaseAdmin.rpc("update_user_stats_after_quest", {
      p_user_email: session.user.email,
      p_quest_type: "daily",
      p_xp_earned: quest.xp_reward,
      p_tokens_earned: quest.token_reward,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}


