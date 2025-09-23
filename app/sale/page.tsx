"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";
import { 
  Wallet, 
  CheckCircle,
  AlertCircle,
  Clock,
  Shield,
  Gamepad2,
  Trophy
} from "lucide-react";

// Mock data - replace with real data later
const SALE_DATA = {
  totalTokens: 1000000,
  soldTokens: 350000,
  pricePerToken: 0.1,
  minPurchase: 100,
  maxPurchase: 10000,
  saleEnds: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
};

export default function SalePage() {
  const { isConnected } = useAccount();
  const { connect } = useConnect();
  
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [isPurchasing, setIsPurchasing] = useState(false);
  

  const progressPercentage = (SALE_DATA.soldTokens / SALE_DATA.totalTokens) * 100;
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [sparks, setSparks] = useState<Array<{ id: number; offsetPx: number }>>([]);
  const remainingTokens = SALE_DATA.totalTokens - SALE_DATA.soldTokens;
  const totalPrice = parseFloat(purchaseAmount) * SALE_DATA.pricePerToken;

  // Animate progress value
  useEffect(() => {
    const durationMs = 1000;
    const start = performance.now();
    const from = 0;
    const to = progressPercentage;
    let raf: number;
    const step = (t: number) => {
      const elapsed = t - start;
      const pct = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - pct, 3); // easeOutCubic
      setAnimatedProgress(from + (to - from) * eased);
      if (pct < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [progressPercentage]);

  // Fancy sparks trailing the progress head
  useEffect(() => {
    const interval = setInterval(() => {
      setSparks((prev) => {
        const now = Date.now();
        const next = prev.filter((s) => now - s.id < 1000);
        next.push({ id: now, offsetPx: (Math.random() - 0.5) * 28 });
        return next.slice(-24);
      });
    }, 120);
    return () => clearInterval(interval);
  }, []);

  // No sparkle effects for elegant monochrome style

  const handlePurchase = async () => {
    if (!isConnected) {
      connect({ connector: injected() });
      return;
    }

    if (!purchaseAmount || parseFloat(purchaseAmount) < SALE_DATA.minPurchase) {
      return;
    }

    setIsPurchasing(true);
    // Simulate purchase
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsPurchasing(false);
    setPurchaseAmount("");
  };

  const handleMaxClick = () => {
    setPurchaseAmount(Math.min(SALE_DATA.maxPurchase, remainingTokens).toString());
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Background image + top-strong gradient overlay */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[url('/providence-avatar.png')] bg-top bg-no-repeat bg-contain opacity-10 md:opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-transparent" />
      </div>
      <Header />
      <main className="relative z-10 container mx-auto px-4 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex flex-col items-center gap-3 mb-6"
            >
              <h1 className="text-4xl sm:text-6xl font-bold text-white drop-shadow-lg">
                Providence Genesis Allocation
              </h1>
              <Badge variant="outline" className="border-white/20 text-white/70">
                Founders&apos; presale access
              </Badge>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl text-slate-300 mb-8"
            >
              Secure your share of the Providence ecosystem
            </motion.p>
          </div>

          {/* Layout: Left (progress & stats) | Right (sticky purchase) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8 order-2 lg:order-1">
          {/* Sale Progress Card - Prominent & Animated */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mb-8"
          >
            <Card className="relative overflow-hidden border-primary/20 bg-card backdrop-blur-md shadow-2xl">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1000px_600px_at_0%_0%,rgba(255,255,255,0.08),transparent_60%)]" />
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-3">
                  <span className="text-white/90">Allocation Progress</span>
                  <Badge variant="outline" className="border-white/20 text-white/80">
                    {animatedProgress.toFixed(1)}% complete
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                      {animatedProgress.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {SALE_DATA.soldTokens.toLocaleString()} of {SALE_DATA.totalTokens.toLocaleString()} allocated • Network: Avalanche (AVAX)
                    </div>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden border border-white/10">
                      <motion.div
                        className="h-full bg-white/70"
                        initial={{ width: 0 }}
                        animate={{ width: `${animatedProgress}%` }}
                        transition={{ duration: 0.8 }}
                      />
                      {/* Glowing indicator at the edge */}
                      <motion.div
                        className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.6)] border border-white/60"
                        style={{ left: `calc(${animatedProgress}% - 8px)` }}
                        animate={{ opacity: [0.9, 0.6, 0.9] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      {/* Sparks */}
                      {sparks.map((s) => (
                        <motion.div
                          key={s.id}
                          initial={{ opacity: 0.7, y: 0, scale: 0.6 }}
                          animate={{ opacity: 0, y: -14, scale: 1 }}
                          transition={{ duration: 0.9 }}
                          className="absolute h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                          style={{ left: `calc(${animatedProgress}% + ${s.offsetPx}px)`, top: '50%' }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted/30 border border-white/10">
                    <p className="text-muted-foreground text-sm mb-1">Sold</p>
                    <p className="text-2xl font-bold text-white">
                      {SALE_DATA.soldTokens.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/30 border border-white/10">
                    <p className="text-muted-foreground text-sm mb-1">Remaining</p>
                    <p className="text-2xl font-bold text-white">
                      {remainingTokens.toLocaleString()}
                    </p>
                  </div>
                </div>
                
              </CardContent>
            </Card>
          </motion.div>

          {/* Sale Stats Cards - Bounty Style */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <Card className="border-primary/20 bg-card backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm mb-2">Total Supply</p>
                      <p className="text-3xl font-bold text-white">
                        {SALE_DATA.totalTokens.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Tokens</p>
                    </div>
                    <img src="/sigil.png" alt="Providence Token" className="h-8 w-8 rounded opacity-80" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Card className="border-primary/20 bg-card backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm mb-2">Price per Token</p>
                      <p className="text-3xl font-bold text-white">
                        ${SALE_DATA.pricePerToken}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">ETH</p>
                    </div>
                    <img src="/sigil.png" alt="Providence Token" className="h-8 w-8 rounded opacity-80" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
            >
              <Card className="border-primary/20 bg-card backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm mb-2">Sale Ends</p>
                      <p className="text-2xl font-bold text-white">
                        7 Days
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Remaining</p>
                    </div>
                    <Clock className="h-6 w-6 text-white/80" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          </div>
          {/* Right Column: Sticky 3D Token + Purchase */}
          <div className="lg:col-span-1 order-1 lg:order-2">
          <div className="lg:sticky top-24">
          {/* Minimal 3D Token (tight to content, no outer card) */}
          <div className="mb-6">
            <CardContainer containerClassName="py-4" className="w-full">
              <CardBody className="h-36 w-36 mx-auto rounded-xl relative overflow-visible">
                {/* pulsing glow ring */}
                <CardItem translateZ={10} className="absolute inset-0 flex items-center justify-center">
                  <div className="h-28 w-28 rounded-full blur-2xl bg-white/20 animate-[pulse_1.6s_ease-in-out_infinite] shadow-[0_0_50px_rgba(255,255,255,0.35)]" />
                </CardItem>
                {/* token */}
                <CardItem translateZ={30} className="absolute inset-0 flex items-center justify-center">
                  <img src="/sigil.png" alt="PRV Token" className="h-20 w-20 opacity-95 drop-shadow-[0_0_45px_rgba(255,255,255,0.5)]" />
                </CardItem>
              </CardBody>
            </CardContainer>
          </div>
          {/* Purchase Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <Card className="relative overflow-hidden border-primary/20 bg-card backdrop-blur-md shadow-2xl">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_500px_at_0%_0%,rgba(255,255,255,0.06),transparent_60%)]" />
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-3">
                  <Wallet className="h-5 w-5 text-white/80" />
                  Purchase Tokens
                  {isConnected && (
                    <Badge variant="outline" className="border-white/20 text-white/70">Wallet Connected</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!isConnected ? (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-white/70 mx-auto mb-6" />
                    <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                      Connect your wallet to participate in the Providence token sale and secure your share of the ecosystem.
                    </p>
                    <Button
                      onClick={() => connect({ connector: injected() })}
                      className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-white/10"
                    >
                      <Wallet className="h-5 w-5 mr-2" />
                      Connect Wallet
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-white mb-3">Amount</label>
                        <div className="flex gap-2 items-stretch">
                          <div className="relative flex-1">
                            <Input
                              type="number"
                              placeholder="0.0"
                              value={purchaseAmount}
                              onChange={(e) => setPurchaseAmount(e.target.value)}
                              className="pr-16 bg-background border-white/10 text-white placeholder:text-muted-foreground focus:border-white/20 focus:ring-white/10"
                              min={SALE_DATA.minPurchase}
                              max={Math.min(SALE_DATA.maxPurchase, remainingTokens)}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">PRV</span>
                          </div>
                          <Button
                            variant="outline"
                            onClick={handleMaxClick}
                            className="border-white/10 text-white hover:bg-white/10 transition-all duration-200"
                          >
                            Max
                          </Button>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                          <span>Min: {SALE_DATA.minPurchase}</span>
                          <span>Max: {Math.min(SALE_DATA.maxPurchase, remainingTokens)}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-white">
                          Purchase Summary
                        </label>
                        <div className="bg-muted/20 rounded-lg p-4 border border-white/10">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-muted-foreground">Price per Token:</span>
                            <span className="text-white font-medium">${SALE_DATA.pricePerToken} ETH</span>
                          </div>
                          {purchaseAmount && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="border-t border-white/10 pt-2"
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-white">Total Cost:</span>
                                <span className="text-white font-bold text-lg">
                                  ${totalPrice.toFixed(2)} ETH
                                </span>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        onClick={handlePurchase}
                        disabled={!purchaseAmount || parseFloat(purchaseAmount) < SALE_DATA.minPurchase || isPurchasing}
                        className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
                      >
                        {isPurchasing ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                        ) : (
                          <CheckCircle className="h-5 w-5 mr-2" />
                        )}
                        {isPurchasing ? "Processing..." : "Purchase Tokens"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
          </div>
          </div>
          </div>

          {/* Utility / How to use section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="mt-12"
          >
            <Card className="border-primary/20 bg-card backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">How you&apos;ll use your tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 rounded-lg border border-white/10 bg-muted/10">
                    <div className="flex items-center gap-3 mb-2">
                      <Shield className="h-5 w-5 text-white/80" />
                      <span className="text-white font-medium">Governance</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Shape the future of Providence with on-chain votes.</p>
                  </div>
                  <div className="p-4 rounded-lg border border-white/10 bg-muted/10">
                    <div className="flex items-center gap-3 mb-2">
                      <Gamepad2 className="h-5 w-5 text-white/80" />
                      <span className="text-white font-medium">In-game economy</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Unlock items, upgrades, and marketplace utilities.</p>
                  </div>
                  <div className="p-4 rounded-lg border border-white/10 bg-muted/10">
                    <div className="flex items-center gap-3 mb-2">
                      <Trophy className="h-5 w-5 text-white/80" />
                      <span className="text-white font-medium">Rewards</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Earn boosts and benefits by participating in the ecosystem.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Centered Avalanche badge */}
            <div className="mt-8 flex justify-center">
              <div className="bg-white rounded-md px-5 py-3 border border-white/20">
                <img src="/PoweredbyAvalanche_BlackWhite%201.png" alt="Powered by Avalanche" className="h-16 w-auto" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}

