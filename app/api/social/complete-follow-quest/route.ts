/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email;

    // Get Twitter follow quest
    const { data: twitterFollowQuest, error: questError } = await supabaseAdmin
      .from("quest_definitions")
      .select("*")
      .eq("category", "twitter_follow")
      .eq("is_active", true)
      .single();

    if (questError || !twitterFollowQuest) {
      return NextResponse.json(
        { error: "Twitter follow quest not found" },
        { status: 404 }
      );
    }

    // Check if already completed
    const { data: existingCompletion, error: completionError } =
      await supabaseAdmin
        .from("user_quest_completions")
        .select("*")
        .eq("user_email", userEmail)
        .eq("quest_id", twitterFollowQuest.id)
        .single();

    if (existingCompletion) {
      return NextResponse.json({
        success: true,
        message: "Twitter follow quest already completed",
        isCompleted: true,
        completion: existingCompletion,
      });
    }

    // Complete the quest automatically
    const { data: newCompletion, error: insertError } = await supabaseAdmin
      .from("user_quest_completions")
      .insert([
        {
          user_email: userEmail,
          quest_id: twitterFollowQuest.id,
          xp_earned: twitterFollowQuest.xp_reward,
          tokens_earned: twitterFollowQuest.token_reward,
          special_reward_earned: twitterFollowQuest.special_reward,
          completion_data: {
            completed_at: new Date().toISOString(),
            note: "Follow quest completed via follow button",
          },
        },
      ])
      .select("*")
      .single();

    if (insertError) {
      console.error(
        "❌ Complete Follow Quest - Failed to insert completion:",
        insertError
      );
      return NextResponse.json(
        { error: "Failed to complete quest" },
        { status: 500 }
      );
    }

    // Update user stats
    await supabaseAdmin.rpc("update_user_stats_after_quest", {
      p_user_email: userEmail,
      p_quest_type: "social",
      p_xp_earned: twitterFollowQuest.xp_reward,
      p_tokens_earned: twitterFollowQuest.token_reward,
    });

    console.log(
      "✅ Complete Follow Quest - Quest completed successfully:",
      newCompletion
    );

    return NextResponse.json({
      success: true,
      message: "Twitter follow quest completed successfully",
      isCompleted: true,
      completion: newCompletion,
      rewards: {
        xp: twitterFollowQuest.xp_reward,
        tokens: twitterFollowQuest.token_reward,
        special: twitterFollowQuest.special_reward,
      },
    });
  } catch (error) {
    console.error("❌ Complete Follow Quest API Error:", error);
    return NextResponse.json(
      { error: "Failed to complete quest" },
      { status: 500 }
    );
  }
}
