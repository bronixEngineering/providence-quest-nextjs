import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

type Requirements = {
  url?: string;
  available_on?: string; // YYYY-MM-DD UTC date the quest is available
  start_date?: string; // optional window start (YYYY-MM-DD)
  end_date?: string; // optional window end (YYYY-MM-DD)
};

type QuestRow = {
  id: string;
  title: string;
  description: string;
  category: string;
  requirements: Requirements | null;
  xp_reward: number;
  token_reward: number;
  special_reward: string | null;
};

type CompletionRow = { quest_id: string };

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date().toISOString().split("T")[0];

    // Fetch all active daily link quests
    const { data: quests, error } = await supabaseAdmin
      .from("quest_definitions")
      .select("id, title, description, category, requirements, xp_reward, token_reward, special_reward")
      .eq("type", "daily")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch quests" }, { status: 500 });
    }

    // Filter to only link-style daily quests that are available today
    const todays = (quests || []).filter((q: QuestRow) => {
      const req = (q.requirements || {}) as Requirements;
      const isLink = !!req.url && (q.category?.includes("link") || q.category === "daily_link");
      if (!isLink) return false;
      if (req.available_on) return req.available_on === today;
      // optional date window support
      if (req.start_date && req.end_date) return today >= req.start_date && today <= req.end_date;
      // If no dates provided, treat as available today by default
      return true;
    });

    // If none, return early
    if (todays.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const questIds = todays.map((q: QuestRow) => q.id);

    // Fetch completion statuses in one query
    const { data: completions } = await supabaseAdmin
      .from("user_quest_completions")
      .select("quest_id")
      .eq("user_email", session.user.email)
      .in("quest_id", questIds);

    const completedSet = new Set((completions || []).map((c: CompletionRow) => c.quest_id));

    const result = todays.map((q: QuestRow) => {
      const req = (q.requirements || {}) as Requirements;
      return {
        id: q.id,
        title: q.title,
        description: q.description,
        category: q.category,
        url: req.url || null,
        xp: q.xp_reward,
        tokens: q.token_reward,
        special: q.special_reward,
        isCompleted: completedSet.has(q.id),
      };
    });

    return NextResponse.json({ data: result });
  } catch (e) {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}


