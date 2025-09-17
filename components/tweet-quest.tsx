/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CheckCircle, Gift, Loader2, Zap } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { CompactLootboxCard } from "@/components/compact-lootbox-card";

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

// Check if X (Twitter) is connected using the same logic as social quests
function useSocialStatus() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["social-status"],
    queryFn: async () => {
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
  const { data: questData, isLoading, error } = useTweetQuest();
  const { data: referralStats } = useReferralStats();
  const { data: socialData, isLoading: socialLoading } = useSocialStatus();
  const completeMutation = useCompleteTweetQuest();

  const [tweetUrl, setTweetUrl] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [hasPostedTweet, setHasPostedTweet] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isCountdownActive, setIsCountdownActive] = useState(false);

  // Client-side validators
  const tweetUrlPattern =
    /^https?:\/\/(twitter\.com|x\.com)\/\w+\/status\/\d+/i;
  const isValidTweetUrl = (url: string) => tweetUrlPattern.test(url.trim());
  const isValidWallet = (addr: string) =>
    /^0x[a-fA-F0-9]{40}$/.test(addr.trim());

  const generateTweetText = () => {
    if (!referralStats?.referralCode) return "";
    // Use a fallback for SSR compatibility
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const referralUrl = `${origin}/refferral-signin/${referralStats.referralCode}`;
    const defaultXUrl =
      "https://x.com/PlayProvidence/status/1965873649082315261";
    return `Come join me at Providence ${referralUrl}\n${defaultXUrl}`;
  };

  const copyImageToClipboard = async () => {
    try {
      // Fetch the image from Supabase
      const response = await fetch(
        "https://urdsxlylixebqhvmsaeu.supabase.co/storage/v1/object/public/public-assets/lootbox.webp"
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();

      // Convert WebP to PNG using canvas
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get canvas context");
      }
      const img = new window.Image();

      return new Promise((resolve, reject) => {
        img.onload = async () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          canvas.toBlob(async (pngBlob) => {
            if (!pngBlob) {
              reject(new Error("Failed to convert to PNG"));
              return;
            }

            // Check if clipboard API is supported
            if (!navigator.clipboard || !navigator.clipboard.write) {
              reject(new Error("Clipboard API not supported"));
              return;
            }

            try {
              // Copy PNG to clipboard
              await navigator.clipboard.write([
                new ClipboardItem({
                  "image/png": pngBlob,
                }),
              ]);

              toast.success("NFT image copied to clipboard! 🎨");
              resolve(true);
            } catch (clipError) {
              console.error("Clipboard write failed:", clipError);
              reject(clipError);
            }
          }, "image/png");
        };

        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = URL.createObjectURL(blob);
      });
    } catch (error) {
      console.error("Failed to copy image:", error);
      toast.error(
        `Failed to copy image: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleOpenTwitter = () => {
    const tweetText = generateTweetText();
    if (tweetText) {
      // First copy the image
      copyImageToClipboard();

      // Show image modal with countdown
      setIsImageModalOpen(true);
      setIsCountdownActive(true);
      setCountdown(5);

      // Start countdown
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setIsCountdownActive(false);
            
            // Open Twitter after countdown
            const encodedTweet = encodeURIComponent(tweetText);
            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedTweet}`;
            window.open(twitterUrl, "_blank");
            setHasPostedTweet(true);

            // Close modal when Twitter opens
            setTimeout(() => {
              setIsImageModalOpen(false);
            }, 1000);
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      toast.error("Referral code not available");
    }
  };

  const handleSubmit = () => {
    if (!tweetUrl.trim() || !walletAddress.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!isValidTweetUrl(tweetUrl)) {
      toast.error("Please enter a valid tweet link (twitter.com/x.com)");
      return;
    }
    if (!isValidWallet(walletAddress)) {
      toast.error("Please enter a valid wallet address (0x... 42 chars)");
      return;
    }

    completeMutation.mutate({
      tweetUrl: tweetUrl.trim(),
      walletAddress: walletAddress.trim(),
    });

    // Close dialog and reset state after successful submission
    setIsDialogOpen(false);
    setHasPostedTweet(false);
    setTweetUrl("");
    setWalletAddress("");
  };

  if (isLoading || socialLoading) {
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

  // Check if X (Twitter) is connected - check connections object
  const isXConnected =
    socialData?.connections && socialData.connections.twitter;

  // If socialData is not loaded yet, show loading state
  if (!socialData) {
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

  return (
    <div className="space-y-6">
      <Card className="relative border border-border bg-card shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden">
        {/* Light effect from top-left */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-radial from-white/10 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CardHeader className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-800/20 border-gray-800/30 group-hover:bg-gray-800/30 transition-colors">
                <XIcon className="h-6 w-6 text-gray-100" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <CardTitle className="text-xl">{quest.title}</CardTitle>
                  {completed && (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  )}
                  <Badge
                    variant="outline"
                    className="bg-gray-800/20 text-gray-300 border-gray-800/30 text-xs"
                  >
                    Time Limited
                  </Badge>
                </div>
                <p className="text-muted-foreground">{quest.description}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="bg-gray-800/20 text-gray-300 border-gray-800/30"
              >
                <Zap className="h-3 w-3 mr-1" />
                {quest.xp_reward} XP
              </Badge>
              {quest.special_reward && (
                <Badge
                  variant="outline"
                  className="bg-purple-500/20 text-purple-400 border-purple-500/30"
                >
                  <Gift className="h-3 w-3 mr-1" />
                  {quest.special_reward}
                </Badge>
              )}
              {completed && (
                <Badge
                  variant="secondary"
                  className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                >
                  Completed
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative z-10">
          {!completed && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1">
                  <p className="text-muted-foreground">
                    Post your tweet on X and submit your wallet address
                  </p>
                  {!referralStats?.referralCode && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Loading your referral code...
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!isXConnected ? (
                    <div className="text-center py-4">
                      <div className="text-sm text-muted-foreground mb-2">
                        Connect your X account first in Social Quests
                      </div>
                      <Button
                        disabled
                        className="bg-gray-600 text-gray-400 px-4 py-2 border border-gray-700 cursor-not-allowed"
                      >
                        <XIcon className="h-4 w-4 mr-2" />
                        Connect X First
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={handleOpenTwitter}
                      disabled={!referralStats?.referralCode}
                      className="bg-gray-900 hover:bg-black text-white px-4 py-2 border border-gray-700"
                    >
                      <XIcon className="h-4 w-4 mr-2" />
                      Post on X
                    </Button>
                  )}

                  {hasPostedTweet && (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white px-4 py-2">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Complete Quest
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Complete Tweet Quest</DialogTitle>
                          <DialogDescription>
                            Please provide your tweet URL and wallet address to
                            complete the quest.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <label className="text-sm font-medium">
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
                          <div className="grid gap-2">
                            <label className="text-sm font-medium">
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
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={handleSubmit}
                            disabled={
                              completeMutation.isPending ||
                              !tweetUrl.trim() ||
                              !walletAddress.trim()
                            }
                            className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white"
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
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}

                  {/* Image Copy Modal */}
                  <Dialog
                    open={isImageModalOpen}
                    onOpenChange={setIsImageModalOpen}
                  >
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>NFT Reward Ready! 🎁</DialogTitle>
                        <DialogDescription>
                          The NFT image has been copied to your clipboard. Paste
                          it into your tweet and publish!
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <div className="flex justify-center mb-4">
                          <img
                            src="https://urdsxlylixebqhvmsaeu.supabase.co/storage/v1/object/public/public-assets/lootbox.webp"
                            alt="NFT Reward"
                            width={128}
                            height={128}
                            className="object-contain rounded-lg border border-border"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/lootbox.png"; // Fallback to local image
                              toast.error(
                                "Failed to load NFT image, using fallback"
                              );
                            }}
                          />
                        </div>
                        <div className="text-center space-y-3">
                          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                            <p className="text-sm font-medium text-green-400">
                              ✅ NFT image copied to clipboard!
                            </p>
                          </div>
                          
                          {isCountdownActive && (
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                              <div className="text-2xl font-bold text-blue-400 mb-2">
                                {countdown}
                              </div>
                              <p className="text-sm text-blue-300">
                                Opening X in {countdown} second{countdown !== 1 ? 's' : ''}...
                              </p>
                            </div>
                          )}
                          
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              📝 Paste the image into your tweet
                            </p>
                            <p className="text-sm text-muted-foreground">
                              🚀 Publish your tweet and complete the quest
                            </p>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <div className="text-center text-sm text-muted-foreground">
                          {isCountdownActive 
                            ? `Opening X in ${countdown} second${countdown !== 1 ? 's' : ''}...`
                            : "Modal will close automatically when Twitter opens"
                          }
                        </div>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Lootbox Preview - Alt Satır */}
              {quest.special_reward && (
                <div className="border-t border-border pt-4">
                  <div className="flex justify-center gap-4 w-full">
                    <div className="flex-1 max-w-md">
                      <CompactLootboxCard
                        isCompleted={false}
                        specialReward={quest.special_reward}
                        className="w-full"
                      />
                    </div>
                    <div className="flex-1 max-w-md">
                      <CompactLootboxCard
                        isCompleted={false}
                        specialReward="Epic Lootbox"
                        imageUrl="https://urdsxlylixebqhvmsaeu.supabase.co/storage/v1/object/public/public-assets/tb.webp"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
