import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    console.log("🐦 Tweet Share Quest API - Starting...");

    const session = await auth();
    if (!session?.user?.email) {
      console.log("❌ Tweet Share - No session or email");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tweetUrl, walletAddress } = await request.json();
    console.log("🎯 Tweet Share - Data received:", { tweetUrl, walletAddress });

    // Validate required fields
    if (!tweetUrl || !walletAddress) {
      return NextResponse.json(
        { error: "Tweet URL and wallet address are required" },
        { status: 400 }
      );
    }

    // Validate tweet URL format
    const tweetUrlPattern = /^https?:\/\/(twitter\.com|x\.com)\/\w+\/status\/\d+/i;
    if (!tweetUrlPattern.test(tweetUrl)) {
      return NextResponse.json(
        { error: "Invalid tweet URL format" },
        { status: 400 }
      );
    }

    // Validate wallet address format (basic Ethereum address validation)
    const walletAddressPattern = /^0x[a-fA-F0-9]{40}$/;
    if (!walletAddressPattern.test(walletAddress)) {
      return NextResponse.json(
        { error: "Invalid wallet address format" },
        { status: 400 }
      );
    }

    // Get the tweet quest definition
    const { data: questDef, error: questError } = await supabaseAdmin
      .from("quest_definitions")
      .select("*")
      .eq("category", "twitter_share")
      .eq("is_active", true)
      .single();

    if (questError || !questDef) {
      console.log("❌ Tweet Share - Quest definition not found:", questError);
      return NextResponse.json(
        { error: "Tweet quest not found" },
        { status: 404 }
      );
    }

    // Check if user already completed this quest
    const { data: existingCompletion, error: completionError } = await supabaseAdmin
      .from("user_quest_completions")
      .select("*")
      .eq("user_email", session.user.email)
      .eq("quest_id", questDef.id)
      .single();

    if (existingCompletion) {
      return NextResponse.json(
        { error: "Tweet quest already completed" },
        { status: 400 }
      );
    }

    // Create quest completion record
    const { data: completion, error: insertError } = await supabaseAdmin
      .from("user_quest_completions")
      .insert({
        user_email: session.user.email,
        quest_id: questDef.id,
        xp_earned: questDef.xp_reward,
        tokens_earned: questDef.token_reward,
        special_reward_earned: questDef.special_reward,
        completion_data: {
          tweet_url: tweetUrl,
          wallet_address: walletAddress,
          completed_at: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (insertError) {
      console.log("❌ Tweet Share - Failed to insert completion:", insertError);
      return NextResponse.json(
        { error: "Failed to complete quest" },
        { status: 500 }
      );
    }

    // Update user stats
    const { error: statsError } = await supabaseAdmin.rpc(
      "update_user_stats_after_quest",
      {
        p_user_email: session.user.email,
        p_quest_type: "social",
        p_xp_earned: questDef.xp_reward,
        p_tokens_earned: questDef.token_reward,
      }
    );

    if (statsError) {
      console.log("⚠️ Tweet Share - Stats update failed:", statsError);
      // Don't fail the request, just log the error
    }

    console.log("✅ Tweet Share - Quest completed successfully");

    return NextResponse.json({
      success: true,
      message: "Tweet quest completed successfully!",
      rewards: {
        xp: questDef.xp_reward,
        tokens: questDef.token_reward,
        badge: questDef.special_reward,
      },
      completion: completion,
    });
  } catch (error) {
    console.error("❌ Tweet Share - Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the tweet quest definition
    const { data: questDef, error: questError } = await supabaseAdmin
      .from("quest_definitions")
      .select("*")
      .eq("category", "twitter_share")
      .eq("is_active", true)
      .single();

    if (questError || !questDef) {
      return NextResponse.json(
        { error: "Tweet quest not found" },
        { status: 404 }
      );
    }

    // Check if user already completed this quest
    const { data: existingCompletion } = await supabaseAdmin
      .from("user_quest_completions")
      .select("*")
      .eq("user_email", session.user.email)
      .eq("quest_id", questDef.id)
      .single();

    return NextResponse.json({
      quest: questDef,
      completed: !!existingCompletion,
      completion: existingCompletion,
    });
  } catch (error) {
    console.error("❌ Tweet Share GET - Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
