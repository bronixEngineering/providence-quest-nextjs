"use client"

import { useSession } from "next-auth/react";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  Clock, 
  Users, 
  Gamepad2, 
  Timer, 
  ExternalLink,
  Trophy,
  Coins,
  Star,
  Lock,
  Calendar
} from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { SignInModal } from "@/components/signin-modal";
import DailyCheckin from "@/components/daily-checkin";

// Mock additional game data - will come from Supabase
const mockGameData = {
  level: 12,
  xp: 2840,
  nextLevelXp: 3000,
  totalQuests: 47,
  completedQuests: 32,
  tokens: 156,
  rank: "#247"
};

// Mock quest data - will come from Supabase
const questCategories = [
  {
    id: "social",
    title: "Social Quests",
    icon: Users,
    color: "bg-blue-500/20 border-blue-500/30",
    quests: [
      {
        id: 1,
        title: "Follow Providence on X",
        description: "Follow @playprovidence on X (Twitter) to stay updated",
        reward: "25 XP + 10 Tokens",
        status: "completed",
        link: "https://x.com/playprovidence"
      },
      {
        id: 2,
        title: "Join Discord Community",
        description: "Join the official Providence Discord server",
        reward: "50 XP + 25 Tokens",
        status: "completed",
        link: "https://discord.com/invite/9mxcWFfzXh"
      },
      {
        id: 3,
        title: "Share Trailer with #ProvidenceQuest",
        description: "Share the Providence game trailer with the hashtag #ProvidenceQuest",
        reward: "75 XP + 50 Tokens",
        status: "pending",
        link: "https://playprovidence.io/"
      },
      {
        id: 4,
        title: "Create Providence Meme",
        description: "Create and share a meme about Providence gameplay",
        reward: "100 XP + 75 Tokens",
        status: "pending"
      }
    ]
  },
  {
    id: "timelocked",
    title: "Time-Locked Quests",
    icon: Timer,
    color: "bg-purple-500/20 border-purple-500/30",
    quests: [
      {
        id: 5,
        title: "Daily Login Streak",
        description: "Log in daily for 7 consecutive days",
        reward: "200 XP + 150 Tokens",
        status: "in-progress",
        progress: 4,
        maxProgress: 7
      },
      {
        id: 6,
        title: "Attend Live Stream",
        description: "Join a live Providence development stream",
        reward: "300 XP + 200 Tokens",
        status: "pending",
        timeLeft: "Next stream in 2 days"
      }
    ]
  },
  {
    id: "game",
    title: "Game Challenges",
    icon: Gamepad2,
    color: "bg-green-500/20 border-green-500/30",
    quests: [
      {
        id: 7,
        title: "First Game Session",
        description: "Play Providence for the first time (on-chain verification)",
        reward: "500 XP + 300 Tokens + Rare Item",
        status: "pending"
      },
      {
        id: 8,
        title: "Craft Your First Item",
        description: "Create your first item in the Providence universe",
        reward: "250 XP + 200 Tokens",
        status: "locked",
        requirement: "Complete 'First Game Session'"
      }
    ]
  }
];

function getStatusIcon(status: string) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-5 w-5 text-green-400" />;
    case "in-progress":
      return <Clock className="h-5 w-5 text-yellow-400" />;
    case "locked":
      return <Clock className="h-5 w-5 text-gray-400" />;
    default:
      return <Clock className="h-5 w-5 text-blue-400" />;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "completed":
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Completed</Badge>;
    case "in-progress":
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">In Progress</Badge>;
    case "locked":
      return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Locked</Badge>;
    default:
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Available</Badge>;
  }
}

export default function BountyPage() {
  const { data: session, status } = useSession();
  const { data: profile, isLoading: profileLoading, error: profileError, refetch } = useProfile();

  // Debug logging
  console.log('🐛 Bounty Page Debug:', {
    sessionStatus: status,
    session: session,
    profile: profile,
    profileLoading: profileLoading,
    profileError: profileError
  });



  // Helper function to get display name
  const getDisplayName = () => {
    if (profile?.name) return profile.name;
    if (session?.user?.name) return session.user.name;
    if (session?.user?.email) {
      // Extract name from email (everything before @)
      return session.user.email.split('@')[0];
    }
    return "Anonymous Player";
  };

  if (status === "loading" || profileLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-gradient-to-br from-background via-background to-secondary/10 pt-24 pb-8">
          <div className="container mx-auto px-4 flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your quest data...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-gradient-to-br from-background via-background to-secondary/10 pt-24 pb-8">
          <div className="container mx-auto px-4 flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md w-full border-primary/20 bg-background/50 backdrop-blur-md">
              <CardContent className="p-8 text-center">
                <Lock className="h-16 w-16 mx-auto mb-4 text-primary" />
                <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
                <p className="text-muted-foreground mb-6">
                  Sign in to access your bounty quests and start earning rewards.
                </p>
                <SignInModal>
                  <Button className="w-full" size="lg">
                    Sign In to Continue
                  </Button>
                </SignInModal>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
              <main className="flex-1 bg-gradient-to-br from-background via-background to-secondary/10 pt-24 pb-8">
                  <div className="container mx-auto px-4">

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Sticky Profile Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-32 border-primary/20 bg-background/50 backdrop-blur-md">
                <CardHeader className="text-center">
                  <Avatar className="h-20 w-20 mx-auto mb-4">
                    <AvatarImage src={profile?.avatar_url || session.user?.image || ""} alt={getDisplayName()} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xl">
                      {getDisplayName().charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-xl">{getDisplayName()}</CardTitle>
                  {profile?.email && (
                    <p className="text-sm text-muted-foreground mb-2">{profile.email}</p>
                  )}
                  {profile?.wallet_address && (
                    <p className="text-xs text-muted-foreground mb-2 font-mono">
                      {profile.wallet_address.slice(0, 6)}...{profile.wallet_address.slice(-4)}
                    </p>
                  )}
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Trophy className="h-4 w-4" />
                    Rank {profile?.rank || mockGameData.rank}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Level Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Level {profile?.level || mockGameData.level}</span>
                      <span>{profile?.xp || mockGameData.xp}/{mockGameData.nextLevelXp} XP</span>
                    </div>
                    <Progress value={((profile?.xp || mockGameData.xp) / mockGameData.nextLevelXp) * 100} className="h-2" />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <div className="font-bold text-primary">{profile?.completed_quests || mockGameData.completedQuests}</div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                    <div className="p-3 rounded-lg bg-yellow-500/10">
                      <div className="font-bold text-yellow-400">{profile?.tokens || mockGameData.tokens}</div>
                      <div className="text-xs text-muted-foreground">Tokens</div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-2">
                    <Button className="w-full" size="sm">
                      <Star className="h-4 w-4 mr-2" />
                      View Rewards
                    </Button>
                    <Button variant="outline" className="w-full" size="sm">
                      <Coins className="h-4 w-4 mr-2" />
                      Token History
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quest Categories */}
            <div className="lg:col-span-3 space-y-8">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-4">
                  Bounty{" "}
                  <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                    Quests
                  </span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Complete quests to earn XP, tokens, and rare items. Level up your Trailblazer status!
                </p>
              </div>
              
              {/* Daily Check-in Quest */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-bold">Daily Quests</h2>
                </div>
                <DailyCheckin />
              </div>

              {questCategories.map((category) => (
                <Card key={category.id} className="border-primary/20 bg-background/30 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${category.color}`}>
                        <category.icon className="h-6 w-6" />
                      </div>
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {category.quests.map((quest) => (
                        <Card key={quest.id} className="border-white/10 bg-background/20">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3 flex-1">
                                {getStatusIcon(quest.status)}
                                <div className="flex-1">
                                  <h3 className="font-semibold mb-1">{quest.title}</h3>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {quest.description}
                                  </p>
                                  <div className="text-sm font-medium text-primary">
                                    Reward: {quest.reward}
                                  </div>
                                  
                                  {/* Progress Bar for in-progress quests */}
                                  {quest.status === "in-progress" && quest.progress && quest.maxProgress && (
                                    <div className="mt-3">
                                      <div className="flex justify-between text-xs mb-1">
                                        <span>Progress</span>
                                        <span>{quest.progress}/{quest.maxProgress}</span>
                                      </div>
                                      <Progress value={(quest.progress / quest.maxProgress) * 100} className="h-2" />
                                    </div>
                                  )}
                                  
                                  {/* Time left for time-locked quests */}
                                  {quest.timeLeft && (
                                    <div className="mt-2 text-xs text-yellow-400">
                                      {quest.timeLeft}
                                    </div>
                                  )}
                                  
                                  {/* Requirement for locked quests */}
                                  {quest.requirement && (
                                    <div className="mt-2 text-xs text-gray-400">
                                      Requires: {quest.requirement}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex flex-col items-end gap-2">
                                {getStatusBadge(quest.status)}
                                {quest.link && quest.status !== "completed" && (
                                  <Button size="sm" variant="outline" asChild>
                                    <a href={quest.link} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="h-4 w-4 mr-2" />
                                      Start
                                    </a>
                                  </Button>
                                )}
                                {quest.status === "completed" && (
                                  <Button size="sm" disabled variant="outline">
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Done
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
