import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Fetch all user stats ordered by total XP descending
    const { data: userStats, error } = await supabase
      .from('user_stats')
      .select('user_email, total_xp, level, total_quests_completed, current_daily_streak, longest_daily_streak, badges')
      .order('total_xp', { ascending: false })
      .limit(100); // Top 100 users

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch leaderboard data' }, { status: 500 });
    }

    // Process the data to mask emails and format for display
    const leaderboardData = userStats?.map((user, index) => {
      // Mask email: show first 3 characters and last 2 characters
      const email = user.user_email;
      const maskedEmail = email ? 
        `${email.substring(0, 3)}***${email.substring(email.length - 2)}` : 
        'Unknown';

      return {
        rank: index + 1,
        email: maskedEmail,
        totalXp: user.total_xp || 0,
        level: user.level || 1,
        questsCompleted: user.total_quests_completed || 0,
        dailyStreak: user.current_daily_streak || 0,
        longestStreak: user.longest_daily_streak || 0,
        badges: user.badges || []
      };
    }) || [];

    return NextResponse.json({ 
      success: true, 
      data: leaderboardData 
    });

  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
