/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Star, Target } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";

interface LeaderboardUser {
  rank: number;
  email: string;
  totalXp: number;
  level: number;
  questsCompleted: number;
  dailyStreak: number;
  longestStreak: number;
  badges: any[];
}

function useLeaderboardData() {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: async (): Promise<LeaderboardUser[]> => {
      const response = await fetch("/api/leaderboard");
      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard data");
      }
      const result = await response.json();
      return result.data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

function getRankIcon(rank: number) {
  if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-400" />;
  if (rank === 2) return <Medal className="h-6 w-6 text-gray-300" />;
  if (rank === 3) return <Star className="h-6 w-6 text-amber-500" />;
  return <Target className="h-4 w-4 text-muted-foreground" />;
}

function getRankBadge(rank: number) {
  if (rank === 1) return "🥇 Champion";
  if (rank === 2) return "🥈 Runner-up";
  if (rank === 3) return "🥉 Bronze";
  if (rank <= 10) return "🏆 Top 10";
  if (rank <= 25) return "⭐ Elite";
  if (rank <= 50) return "🔥 Rising Star";
  return "🚀 Trailblazer";
}

export default function LeaderboardPage() {
  const { data: leaderboardData, isLoading, error } = useLeaderboardData();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-background pt-24 pb-8">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">Leaderboard</h1>
              <p className="text-lg text-muted-foreground">
                Loading top Trailblazers...
              </p>
            </div>
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-background pt-24 pb-8">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">Leaderboard</h1>
              <p className="text-lg text-muted-foreground">
                Failed to load leaderboard data
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Header />
      <main className="flex-1 bg-background pt-24 pb-8 overflow-x-hidden">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              <Trophy className="inline-block h-10 w-10 mr-3 text-secondary" />
              Leaderboard
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Compete with other Trailblazers and climb the ranks. Complete
              quests, earn XP, and dominate the leaderboard!
            </p>
            <p className="text-sm text-muted-foreground/80 max-w-2xl mx-auto mt-1">
              * Raw scores are currently displayed. Final rankings will be
              calculated with Discord exclusive role multipliers.
            </p>
          </div>

          {/* Stats Overview */}
          {/* Removed Top XP card per request */}

          {/* Leaderboard Table */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-secondary" />
                Top Trailblazers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboardData?.map((user) => (
                  <div
                    key={user.rank}
                    className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-lg transition-all duration-200 ${
                      user.rank <= 3
                        ? "bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20"
                        : "bg-muted/30 hover:bg-muted/50"
                    }`}
                  >
                    {/* Left cluster: Rank + User */}
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      {/* Rank */}
                      <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-card border border-border shrink-0">
                        {getRankIcon(user.rank)}
                      </div>

                      {/* User Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-9 w-9 sm:h-10 sm:w-10 shrink-0">
                          <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                            {user.email.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-semibold text-foreground">
                            {user.email}
                          </div>
                          <div className="text-sm text-muted-foreground whitespace-nowrap">
                            {/* Level hidden per request */}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right cluster: Stats + Badge */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 w-full sm:w-auto">
                      <div className="text-left sm:text-right">
                        <div className="text-base sm:text-lg font-bold text-primary leading-tight">
                          {user.totalXp.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Total XP
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <div className="text-sm font-semibold text-foreground leading-tight">
                          {user.dailyStreak}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Day Streak
                        </div>
                      </div>

                      <Badge
                        variant="secondary"
                        className={`${
                          user.rank <= 3
                            ? "bg-gradient-to-r from-secondary/20 to-secondary/60 text-secondary border-secondary/30"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {getRankBadge(user.rank)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {(!leaderboardData || leaderboardData.length === 0) && (
                <div className="text-center py-12">
                  <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Trailblazers Yet
                  </h3>
                  <p className="text-muted-foreground">
                    Be the first to complete quests and claim the top spot!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
