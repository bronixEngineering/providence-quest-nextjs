/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ExternalLink,
  CheckCircle,
  Loader2,
  Trophy,
  Zap,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

// X (Twitter) Icon Component
const XIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface TweetQuest {
  id: string;
  title: string;
  description: string;
  category: string;
  requirements: {
    action: string;
    predefined_tweet: string;
    tweet_url_required: boolean;
    wallet_address_required: boolean;
  };
  xp_reward: number;
  token_reward: number;
  special_reward: string;
  is_repeatable: boolean;
  sort_order: number;
}

interface ReferralStats {
  referralCode: string | null;
  totalReferrals: number;
  totalEarnedXP: number;
  hasUsedReferral: boolean;
  referrals: Array<{
    name: string | null;
    email: string | null;
    avatar_url: string | null;
    joinedAt: string;
  }>;
}

interface TweetQuestResponse {
  quest: TweetQuest;
  completed: boolean;
  completion?: any;
}

function useTweetQuest() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["tweet-quest"],
    queryFn: async (): Promise<TweetQuestResponse> => {
      const response = await fetch("/api/quests/tweet-share");
      if (!response.ok) {
        throw new Error("Failed to fetch tweet quest");
      }
      return response.json();
    },
    enabled: !!session?.user,
    staleTime: 30 * 1000,
  });
}

function useReferralStats() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["referral-stats"],
    queryFn: async (): Promise<ReferralStats> => {
      const response = await fetch("/api/referral/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch referral stats");
      }
      return response.json();
    },
    enabled: !!session?.user,
    staleTime: 60 * 1000,
  });
}

function useCompleteTweetQuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { tweetUrl: string; walletAddress: string }) => {
      const response = await fetch("/api/quests/tweet-share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to complete tweet quest");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success("Tweet quest completed! 🎉", {
        description: `Earned ${data.rewards.xp} XP and ${data.rewards.tokens} tokens!`,
      });
      queryClient.invalidateQueries({ queryKey: ["tweet-quest"] });
      queryClient.invalidateQueries({ queryKey: ["user-stats"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to complete quest"
      );
    },
  });
}

export default function TweetQuest() {
  const { data: session } = useSession();
  const { data: questData, isLoading, error } = useTweetQuest();
  const { data: referralStats } = useReferralStats();
  const completeMutation = useCompleteTweetQuest();

  const [tweetUrl, setTweetUrl] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  const generateTweetText = () => {
    if (!referralStats?.referralCode) return "";
    const referralUrl = `${window.location.origin}/refferral-signin/${referralStats.referralCode}`;
    return `Come join me at Providence ${referralUrl}`;
  };

  const handleCopyTweet = () => {
    const tweetText = generateTweetText();
    if (tweetText) {
      navigator.clipboard.writeText(tweetText);
      toast.success("Tweet copied to clipboard! 📋");
    } else {
      toast.error("Referral code not available");
    }
  };

  const handleOpenTwitter = () => {
    const tweetText = generateTweetText();
    if (tweetText) {
      const encodedTweet = encodeURIComponent(tweetText);
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedTweet}`;
      window.open(twitterUrl, "_blank");
    } else {
      toast.error("Referral code not available");
    }
  };

  const handleSubmit = () => {
    if (!tweetUrl.trim() || !walletAddress.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    completeMutation.mutate({
      tweetUrl: tweetUrl.trim(),
      walletAddress: walletAddress.trim(),
    });
  };

  if (isLoading) {
    return (
      <Card className="border border-border bg-card shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !questData) {
    return (
      <Card className="border border-red-500/20 bg-card">
        <CardContent className="p-6 text-center">
          <div className="text-red-400 mb-2">Failed to load tweet quest</div>
          <div className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Unknown error"}
          </div>
        </CardContent>
      </Card>
    );
  }

  const { quest, completed } = questData;

  return (
    <Card className="relative border border-gray-800/20 bg-gradient-to-br from-gray-900/10 via-gray-800/5 to-black/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-gray-800/30 group overflow-hidden">
      {/* Light effect from top-left */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-radial from-white/10 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-800/20 border-gray-800/30 group-hover:bg-gray-800/30 transition-colors">
              <XIcon className="h-6 w-6 text-gray-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">{quest.title}</CardTitle>
                {completed && (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                )}
                <Badge variant="outline" className="bg-gray-800/20 text-gray-300 border-gray-800/30 text-xs">
                  Time Limited
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">{quest.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-gray-800/20 text-gray-300 border-gray-800/30">
              <Zap className="h-3 w-3 mr-1" />
              {quest.xp_reward} XP
            </Badge>
            <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
              <Trophy className="h-3 w-3 mr-1" />
              {quest.token_reward} Tokens
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10">
        {!completed && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">
                Post tweet on X to help others join Providence Quest!
              </p>
              
              <Button
                onClick={handleOpenTwitter}
                disabled={!referralStats?.referralCode}
                className="bg-gray-900 hover:bg-black text-white px-6 py-2 border border-gray-700"
              >
                <XIcon className="h-4 w-4 mr-2" />
                Post on X
              </Button>
              
              {!referralStats?.referralCode && (
                <p className="text-xs text-muted-foreground mt-2">
                  Loading your referral code...
                </p>
              )}
            </div>

            {/* Submission Form - Hidden by default, shown after posting */}
            <div className="space-y-3 pt-4 border-t border-border">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Tweet URL *
                </label>
                <Input
                  type="url"
                  placeholder="https://twitter.com/username/status/1234567890"
                  value={tweetUrl}
                  onChange={(e) => setTweetUrl(e.target.value)}
                  className="bg-background/50"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Wallet Address *
                </label>
                <Input
                  type="text"
                  placeholder="0x..."
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="bg-background/50 font-mono"
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={completeMutation.isPending || !tweetUrl.trim() || !walletAddress.trim()}
                className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white"
              >
                {completeMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Completing Quest...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Quest
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
