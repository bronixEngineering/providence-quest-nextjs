"use client"

import React from "react";
import { useSession } from "next-auth/react";
import { useProfile } from "@/hooks/useProfile";
import { useUserStats, getLevelProgress } from "@/hooks/useUserStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy,
  Coins,
  Star,
  Lock,
  Calendar,
  Gamepad2,
  Clock,
  Twitter,
  MessageSquare
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { SignInModal } from "@/components/signin-modal";
import DailyCheckin from "@/components/daily-checkin";
import SocialQuests from "@/components/social-quests";
import WalletQuest from "@/components/wallet-quest";

// Real user stats from useUserStats hook and Supabase

// Social connections hook
function useSocialConnections() {
  const { data: session } = useSession()

  return useQuery({
    queryKey: ['social-connections'],
    queryFn: async () => {
      const response = await fetch('/api/social/status')
      if (!response.ok) {
        throw new Error('Failed to fetch social connections')
      }
      const result = await response.json()
      return result.data.connections
    },
    enabled: !!session?.user,
    staleTime: 30 * 1000,
  })
}

export default function BountyPage() {
  const { data: session, status } = useSession();
  const { data: profile, isLoading: profileLoading, error: profileError } = useProfile();
  const { data: userStats, isLoading: statsLoading, error: statsError } = useUserStats();
  const { data: socialConnections } = useSocialConnections();

  // Debug logging
  console.log('🐛 Bounty Page Debug:', {
    sessionStatus: status,
    session: session,
    authProvider: (session as any)?.authProvider,
    profile: profile,
    profileLoading: profileLoading,
    profileError: profileError,
    userStats: userStats,
    statsLoading: statsLoading,
    statsError: statsError,
    socialConnections: socialConnections
  });

  // Calculate level progress
  const levelProgress = userStats ? getLevelProgress(userStats.total_xp) : null;



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

  // Social badge component
  const SocialBadge = ({ platform }: { platform: string, connection?: unknown }) => {
    const getIcon = () => {
      switch (platform) {
        case 'twitter':
          return <Twitter className="h-3 w-3" />
        case 'discord':
          return <MessageSquare className="h-3 w-3" />
        default:
          return null
      }
    }

    const getColors = () => {
      switch (platform) {
        case 'twitter':
          return 'bg-sky-500/20 text-sky-400 border-sky-500/30'
        case 'discord':
          return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
        default:
          return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      }
    }

    return (
      <Badge variant="outline" className={`${getColors()} text-xs flex items-center gap-1 px-2 py-1 border`}>
        {getIcon()}
        {platform.charAt(0).toUpperCase() + platform.slice(1)}
      </Badge>
    )
  };

  if (status === "loading" || profileLoading || statsLoading) {
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
                  {(session as any)?.authProvider && (
                    <p className="text-xs text-muted-foreground mb-1">Provider: {(session as any).authProvider}</p>
                  )}
                  {profile?.email && (
                    <p className="text-sm text-muted-foreground mb-2">{profile.email}</p>
                  )}
                  
                  {/* Social Connections Badges */}
                  {socialConnections && Object.keys(socialConnections).length > 0 ? (
                    <div className="flex items-center justify-center gap-2 mb-3">
                      {Object.entries(socialConnections).map(([platform]) => (
                        <SocialBadge key={platform} platform={platform} />
                      ))}
                    </div>
                  ) : (
                    // Temporary test badges - remove this in production
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <SocialBadge platform="twitter" />
                      <SocialBadge platform="discord" />
                    </div>
                  )}
                  
                  {profile?.wallet_address && (
                    <p className="text-xs text-muted-foreground mb-2 font-mono">
                      {profile.wallet_address.slice(0, 6)}...{profile.wallet_address.slice(-4)}
                    </p>
                  )}
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Trophy className="h-4 w-4" />
                    Level {userStats?.level || 1} Trailblazer
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Level Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Level {levelProgress?.currentLevel || 1}</span>
                      <span>{userStats?.total_xp || 0}/{levelProgress?.nextLevel ? Math.pow(levelProgress.nextLevel - 1, 2) * 100 : 100} XP</span>
                    </div>
                    <Progress value={levelProgress?.progressPercentage || 0} className="h-2" />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <div className="font-bold text-primary">{userStats?.total_quests_completed || 0}</div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                    <div className="p-3 rounded-lg bg-yellow-500/10">
                      <div className="font-bold text-yellow-400">{userStats?.tokens || 0}</div>
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

              {/* Wallet Quest */}
              <div className="space-y-4">
                <WalletQuest />
              </div>

              {/* Social Quests */}
              <div className="space-y-4">
                <SocialQuests />
              </div>

              {/* Coming Soon Quests */}
              <Card className="border-primary/20 bg-background/30 backdrop-blur-md opacity-75">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-500/20 border-slate-500/30">
                      <Gamepad2 className="h-6 w-6" />
                    </div>
                    Web3 & Game Challenges
                    <Badge variant="secondary" className="ml-auto">Coming Soon</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">More Quests Coming Soon!</h3>
                    <p className="text-muted-foreground">
                      Web3 wallet integration and game challenges will be available soon.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
