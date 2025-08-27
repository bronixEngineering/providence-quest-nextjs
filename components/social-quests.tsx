/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  CheckCircle,
  Twitter,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession, signIn } from "next-auth/react";
import { toast } from "sonner";

interface SocialConnection {
  id: string;
  platform: string;
  username: string;
  userId: string;
  connectedAt: string;
  verifiedAt: string;
  data: any;
}

interface SocialQuest {
  id: string;
  title: string;
  description: string;
  category: string;
  platform: string;
  xpReward: number;
  tokenReward: number;
  specialReward?: string;
  isCompleted: boolean;
  isAvailable: boolean;
  completedAt?: string;
  requirements: any;
  connection?: SocialConnection;
}

interface SocialStatusData {
  connections: Record<string, SocialConnection>;
  quests: SocialQuest[];
  stats: {
    totalConnections: number;
    completedQuests: number;
    availableQuests: number;
  };
}

function useSocialStatus() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["social-status"],
    queryFn: async (): Promise<SocialStatusData> => {
      const response = await fetch("/api/social/status");
      if (!response.ok) {
        throw new Error("Failed to fetch social status");
      }
      const result = await response.json();
      return result.data;
    },
    enabled: !!session?.user,
    staleTime: 30 * 1000,
  });
}

function useSocialVerify() {
  return useMutation({
    mutationFn: async (platform: string) => {
      const response = await fetch("/api/social/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to verify");
      }

      const result = await response.json();
      return result;
    },
    onSuccess: (data) => {
      // Redirect to NextAuth verification
      window.location.href = data.verifyUrl;
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Verification failed"
      );
    },
  });
}

function getPlatformIcon(platform: string) {
  switch (platform) {
    case "twitter":
      return <Twitter className="h-4 w-4" />;
    case "discord":
      return <MessageSquare className="h-4 w-4" />;
    default:
      return <ExternalLink className="h-4 w-4" />;
  }
}

function getPlatformColor(platform: string) {
  switch (platform) {
    case "twitter":
      return "from-sky-600 to-blue-600";
    case "discord":
      return "from-indigo-600 to-purple-600";
    default:
      return "from-slate-600 to-slate-700";
  }
}

export default function SocialQuests() {
  const { data: socialData, isLoading, error } = useSocialStatus();
  const verifyMutation = useSocialVerify();

  const handleVerify = (platform: string) => {
    // Start Auth.js OAuth and come back to /bounty
    signIn(platform, { callbackUrl: "/bounty?verified=" + platform });
  };

  if (isLoading) {
    return (
      <Card className="border border-slate-700/50 bg-slate-900/95 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !socialData) {
    return (
      <Card className="border border-red-500/20 bg-red-500/5">
        <CardContent className="p-6 text-center">
          <div className="text-red-400 mb-2">Failed to load social quests</div>
          <div className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Unknown error"}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">
            Social Quests
          </h3>
          <p className="text-sm text-slate-400">
            Connect your accounts to earn rewards
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span>{socialData.stats.totalConnections} connected</span>
          <span>{socialData.stats.completedQuests} completed</span>
        </div>
      </div>

      {/* Quest Cards */}
      <div className="grid gap-3">
        {socialData.quests.map((quest) => (
          <Card
            key={quest.id}
            className="border border-slate-700/50 bg-slate-900/95 shadow-lg"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                {/* Quest Info */}
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r ${getPlatformColor(
                      quest.platform
                    )}`}
                  >
                    {getPlatformIcon(quest.platform)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-slate-100">
                        {quest.title}
                      </h4>
                      {quest.isCompleted && (
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                      )}
                    </div>
                    <p className="text-sm text-slate-400">
                      {quest.description}
                    </p>
                    {quest.connection && (
                      <p className="text-xs text-slate-500 mt-1">
                        Connected as @{quest.connection.username}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action & Rewards */}
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm">
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="text-cyan-400">
                        +{quest.xpReward} XP
                      </span>
                      <span className="text-amber-400">
                        +{quest.tokenReward} Tokens
                      </span>
                    </div>
                    {quest.specialReward && (
                      <div className="text-xs text-slate-400 mt-1">
                        {quest.specialReward}
                      </div>
                    )}
                  </div>

                  {quest.isCompleted ? (
                    <Badge
                      variant="secondary"
                      className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    >
                      Completed
                    </Badge>
                  ) : (
                    <Button
                      onClick={() => handleVerify(quest.platform)}
                      disabled={verifyMutation.isPending}
                      className={`bg-gradient-to-r ${getPlatformColor(
                        quest.platform
                      )} hover:opacity-90 border-0 text-white`}
                      size="sm"
                    >
                      {verifyMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Verifying...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(quest.platform)}
                          Verify
                        </div>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {socialData.quests.length === 0 && (
        <Card className="border border-slate-700/50 bg-slate-900/95">
          <CardContent className="p-6 text-center">
            <div className="text-slate-400">No social quests available</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
