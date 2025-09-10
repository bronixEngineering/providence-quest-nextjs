"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Users, Copy, Share2, CheckCircle, Calendar } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";

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

export default function ReferralPage() {
  const { data: session } = useSession();
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [referralInput, setReferralInput] = useState("");
  const [usingReferral, setUsingReferral] = useState(false);
  const [referralMessage, setReferralMessage] = useState("");

  useEffect(() => {
    if (session?.user?.email) {
      fetchReferralStats();
    }
  }, [session]);

  const fetchReferralStats = async () => {
    try {
      const response = await fetch("/api/referral/stats");
      if (response.ok) {
        const data = await response.json();
        setReferralStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch referral stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = async () => {
    if (referralStats?.referralCode) {
      try {
        await navigator.clipboard.writeText(referralStats.referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy:", error);
      }
    }
  };

  const shareReferralCode = async () => {
    if (referralStats?.referralCode) {
      const shareData = {
        title: "Join Providence Quest!",
        text: `Use my referral code: ${referralStats.referralCode}`,
        url: `${window.location.origin}/refferral-signin/${referralStats.referralCode}`,
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (error) {
          console.error("Error sharing:", error);
        }
      } else {
        // Fallback for browsers that don't support Web Share API
        copyReferralCode();
      }
    }
  };

  const useReferralCode = async () => {
    if (!referralInput.trim()) return;

    setUsingReferral(true);
    setReferralMessage("");

    try {
      const response = await fetch("/api/referral/use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralCode: referralInput.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setReferralMessage(`✅ ${data.message} You earned ${data.rewards.referred}!`);
        setReferralInput("");
        // Refresh stats
        fetchReferralStats();
      } else {
        setReferralMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      console.error("Failed to use referral code:", error);
      setReferralMessage("❌ Failed to use referral code");
    } finally {
      setUsingReferral(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center flex flex-col justify-center items-center flex-1">
          <h1 className="text-4xl font-bold mb-4">Referral Program</h1>
          <p className="text-lg text-muted-foreground">Please sign in to view your referral program.</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />

        <div className="container mx-auto px-4 py-24">
          {/* Header Skeleton */}
          <div className="text-center mb-16">
            <div className="h-12 bg-muted rounded-lg w-96 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-muted rounded-lg w-2xl mx-auto animate-pulse"></div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Referral Card Skeleton */}
            <div className="lg:col-span-2">
              <Card className="border-border bg-card">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-lg animate-pulse"></div>
                    <div className="h-6 bg-muted rounded-lg w-32 animate-pulse"></div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="h-20 bg-muted rounded-lg w-48 mx-auto mb-4 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded-lg w-64 mx-auto mb-6 animate-pulse"></div>

                    <div className="flex gap-3 justify-center">
                      <div className="h-10 bg-muted rounded-lg w-24 animate-pulse"></div>
                      <div className="h-10 bg-muted rounded-lg w-20 animate-pulse"></div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/20 border border-border">
                    <div className="h-4 bg-muted rounded-lg w-24 mb-2 animate-pulse"></div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-10 bg-muted rounded animate-pulse"></div>
                      <div className="w-10 h-10 bg-muted rounded animate-pulse"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stats Sidebar Skeleton */}
            <div className="space-y-6">
              {/* Total Referrals Skeleton */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-muted rounded animate-pulse"></div>
                    <div className="h-5 bg-muted rounded-lg w-28 animate-pulse"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-10 bg-muted rounded-lg w-16 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-muted rounded-lg w-32 animate-pulse"></div>
                </CardContent>
              </Card>

              {/* Total XP Earned Skeleton */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-muted rounded animate-pulse"></div>
                    <div className="h-5 bg-muted rounded-lg w-28 animate-pulse"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-10 bg-muted rounded-lg w-20 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-muted rounded-lg w-32 animate-pulse"></div>
                </CardContent>
              </Card>

              {/* Rewards Info Skeleton */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-muted rounded animate-pulse"></div>
                    <div className="h-5 bg-muted rounded-lg w-16 animate-pulse"></div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="h-4 bg-muted rounded-lg w-20 animate-pulse"></div>
                      <div className="h-6 bg-muted rounded-lg w-16 animate-pulse"></div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Use Referral Code Skeleton */}
          <div className="mt-12">
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="h-7 bg-muted rounded-lg w-48 mx-auto animate-pulse"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-5 bg-muted rounded-lg w-80 mx-auto animate-pulse"></div>

                <div className="flex gap-3 max-w-md mx-auto">
                  <div className="flex-1 h-10 bg-muted rounded animate-pulse"></div>
                  <div className="h-10 bg-muted rounded-lg w-24 animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* How It Works Skeleton */}
          <div className="mt-12">
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="h-8 bg-muted rounded-lg w-32 mx-auto animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-3">
                      <div className="w-16 h-16 bg-muted rounded-full mx-auto animate-pulse"></div>
                      <div className="h-5 bg-muted rounded-lg w-24 mx-auto animate-pulse"></div>
                      <div className="h-4 bg-muted rounded-lg w-32 mx-auto animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">
            Referral{" "}
            <span className="bg-gradient-to-r from-primary via-primary to-primary bg-clip-text text-transparent">
              Program
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Invite friends to Providence Quest and earn rewards together! Share your referral code and watch your
            network grow.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Referral Card */}
          <div className="lg:col-span-2">
            <Card className="border-secondary/20 bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary/20 border-secondary/30">
                    <Trophy className="h-6 w-6 text-secondary" />
                  </div>
                  Your Referral Code
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {referralStats?.referralCode ? (
                  <>
                    <div className="text-center">
                      <div className="text-6xl font-bold text-secondary mb-4 font-mono tracking-wider">
                        {referralStats.referralCode}
                      </div>
                      <p className="text-sm text-muted-foreground mb-6">Share this code with friends to earn rewards</p>

                      <div className="flex gap-3 justify-center">
                        <Button
                          onClick={copyReferralCode}
                          variant="outline"
                          className="bg-secondary/10 hover:bg-secondary/20 border-secondary/30 text-secondary"
                        >
                          {copied ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Code
                            </>
                          )}
                        </Button>

                        <Button onClick={shareReferralCode} className="bg-secondary hover:bg-secondary/90 text-white">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>

                    {/* Referral Link */}
                    <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/20">
                      <p className="text-sm text-muted-foreground mb-2">Referral Link:</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 p-2 rounded bg-background border text-sm font-mono">
                          {`${window.location.origin}/refferral-signin/${referralStats.referralCode}`}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(
                                `${window.location.origin}/refferral-signin/${referralStats.referralCode}`
                              );
                              setLinkCopied(true);
                              setTimeout(() => setLinkCopied(false), 2000);
                            } catch (error) {
                              console.error("Failed to copy link:", error);
                              // noop
                            }
                          }}
                        >
                          {linkCopied ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-1" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading your referral code...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Total Referrals */}
            <Card className="border-secondary/20 bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-secondary" />
                  Total Referrals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary">{referralStats?.totalReferrals || 0}</div>
                <p className="text-sm text-muted-foreground">Friends joined with your code</p>
              </CardContent>
            </Card>

            {/* Total XP Earned */}
            <Card className="border-secondary/20 bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-secondary" />
                  Total XP Earned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary">{referralStats?.totalEarnedXP || 0} XP</div>
                <p className="text-sm text-muted-foreground">From referral rewards</p>
              </CardContent>
            </Card>

            {/* Rewards Info */}
            <Card className="border-secondary/20 bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-secondary" />
                  Rewards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Per Referral:</span>
                  <Badge variant="secondary" className="bg-secondary/20 text-secondary">
                    +20 XP
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Bonus at 5:</span>
                  <Badge variant="secondary" className="bg-secondary/20 text-secondary">
                    +100 XP
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Bonus at 10:</span>
                  <Badge variant="secondary" className="bg-secondary/20 text-secondary">
                    +200 XP
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Referrals List */}
        {referralStats && referralStats.referrals.length > 0 && (
          <div className="mt-12">
            <Card className="border-secondary/20 bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-secondary" />
                  Your Referrals ({referralStats.totalReferrals})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {referralStats.referrals.map((referral, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 rounded-lg bg-background/50 border border-border"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={referral.avatar_url || ""} />
                        <AvatarFallback className="bg-secondary/20 text-secondary">
                          {referral.name?.charAt(0) || referral.email?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="font-medium">
                          {referral.name || referral.email?.split("@")[0] || "Anonymous"}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          Joined {new Date(referral.joinedAt).toLocaleDateString()}
                        </div>
                      </div>

                      <Badge variant="secondary" className="bg-secondary/20 text-secondary">
                        +20 XP
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Use Referral Code */}
        <div className="mt-12">
          <Card className={`border-secondary/20 bg-card ${referralStats?.hasUsedReferral ? "opacity-60" : ""}`}>
            <CardHeader>
              <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
                {referralStats?.hasUsedReferral && <CheckCircle className="h-6 w-6 text-green-500" />}
                Use a Referral Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {referralStats?.hasUsedReferral ? (
                <div className="text-center space-y-4">
                  <p className="text-center text-green-600 font-medium">
                    ✅ You have already used a referral code and earned bonus XP!
                  </p>
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-sm text-green-600">
                      Thanks for joining with a friend&apos;s referral code! You&apos;ve earned your bonus rewards.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-center text-muted-foreground">
                    Have a friend&apos;s referral code? Enter it below to earn bonus XP!
                  </p>

                  <div className="flex gap-3 max-w-md mx-auto">
                    <input
                      type="text"
                      placeholder="Enter referral code..."
                      value={referralInput}
                      onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground"
                      maxLength={8}
                    />
                    <Button
                      onClick={useReferralCode}
                      disabled={usingReferral || !referralInput.trim()}
                      className="bg-secondary hover:bg-secondary/90 text-white"
                    >
                      {usingReferral ? "Using..." : "Use Code"}
                    </Button>
                  </div>

                  {referralMessage && (
                    <div
                      className={`text-center p-3 rounded-md ${
                        referralMessage.includes("✅")
                          ? "bg-green-500/10 text-green-600 border border-green-500/20"
                          : "bg-red-500/10 text-red-600 border border-red-500/20"
                      }`}
                    >
                      {referralMessage}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="mt-12">
          <Card className="border-secondary/20 bg-card">
            <CardHeader>
              <CardTitle className="text-2xl text-center">How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl font-bold text-secondary">1</span>
                  </div>
                  <h3 className="font-semibold">Share Your Code</h3>
                  <p className="text-sm text-muted-foreground">Copy and share your unique referral code with friends</p>
                </div>

                <div className="space-y-3">
                  <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl font-bold text-secondary">2</span>
                  </div>
                  <h3 className="font-semibold">Friends Join</h3>
                  <p className="text-sm text-muted-foreground">
                    When they sign up using your code, you both get rewards
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl font-bold text-secondary">3</span>
                  </div>
                  <h3 className="font-semibold">Earn Together</h3>
                  <p className="text-sm text-muted-foreground">Complete quests together and unlock bonus rewards</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
