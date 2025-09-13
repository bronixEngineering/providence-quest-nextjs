/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email;

    // Get all social connections for user
    const { data: connections, error: connectionsError } = await supabaseAdmin
      .from("user_social_connections")
      .select("*")
      .eq("user_email", userEmail)
      .eq("is_verified", true);

    // Get available social quests (exclude twitter_share as it has its own component)
    const { data: socialQuests, error: questsError } = await supabaseAdmin
      .from("quest_definitions")
      .select("*")
      .eq("type", "social")
      .neq("category", "twitter_share")
      .eq("is_active", true)
      .order("sort_order");

    // Get completed social quests (exclude twitter_share)
    const { data: completedQuests, error: completedError } = await supabaseAdmin
      .from("user_quest_completions")
      .select(
        `
        *,
        quest_definitions!inner(
          type,
          category,
          title,
          xp_reward,
          token_reward
        )
      `
      )
      .eq("user_email", userEmail)
      .eq("quest_definitions.type", "social")
      .neq("quest_definitions.category", "twitter_share");

    // Process connections by platform
    const connectionsByPlatform = (connections || []).reduce((acc, conn) => {
      acc[conn.platform] = {
        id: conn.id,
        platform: conn.platform,
        username: conn.platform_username,
        userId: conn.platform_user_id,
        connectedAt: conn.connected_at,
        verifiedAt: conn.verified_at,
        data: conn.platform_data,
      };
      return acc;
    }, {} as Record<string, any>);

    // Process quests with completion status
    const questsWithStatus = (socialQuests || []).map((quest) => {
      const completion = (completedQuests || []).find(
        (c) => c.quest_id === quest.id
      );

      // Extract platform from category (twitter_link -> twitter, discord_member -> discord)
      const platform = quest.category.split("_")[0];
      const isConnected = connectionsByPlatform[platform];

      return {
        id: quest.id,
        title: quest.title,
        description: quest.description,
        category: quest.category,
        platform: platform,
        xpReward: quest.xp_reward,
        tokenReward: quest.token_reward,
        specialReward: quest.special_reward,
        isCompleted: !!completion,
        isAvailable: !completion,
        completedAt: completion?.completed_at || null,
        requirements: quest.requirements,
        connection: isConnected || null,
      };
    });

    const responseData = {
      connections: connectionsByPlatform,
      quests: questsWithStatus,
      stats: {
        totalConnections: Object.keys(connectionsByPlatform).length,
        completedQuests: (completedQuests || []).length,
        availableQuests: questsWithStatus.filter((q) => q.isAvailable).length,
      },
    };

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("❌ Social Status API Error:", error);
    return NextResponse.json(
      { error: "Failed to get social status" },
      { status: 500 }
    );
  }
}
