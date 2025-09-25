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
  Trophy,
  TrendingUp,
  Target,
  Users
} from "lucide-react";

// Mock data - replace with real data later
const SALE_DATA = {
  totalTokens: 1000000,
  soldTokens: 350000,
  pricePerToken: 0.1,
  minPurchase: 100,
  maxPurchase: 10000,
  saleEnds: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  raiseTarget: 1000000, // $1M USDT target
  currentRaised: 350000, // Current amount raised
};

// Mock bid data
const MOCK_BIDS = [
  { id: 1, wallet: "0x1234...5678", amount: 50000, price: 0.1, timestamp: new Date(Date.now() - 3600000) },
  { id: 2, wallet: "0x9abc...def0", amount: 25000, price: 0.1, timestamp: new Date(Date.now() - 7200000) },
  { id: 3, wallet: "0x5555...9999", amount: 100000, price: 0.095, timestamp: new Date(Date.now() - 10800000) },
  { id: 4, wallet: "0xaaaa...bbbb", amount: 75000, price: 0.1, timestamp: new Date(Date.now() - 14400000) },
];

// Investor logos
const INVESTORS = [
  "Copy of Avalanche.png",
  "Copy of Bitscale.png", 
  "Copy of BlizzardFund_Logo.png",
  "Copy of CoinFund.png",
  "Copy of CSI_GLOBAL_main_logo-1.png",
  "Copy of Id-theory-1.png",
  "Copy of Infinite Capital.png",
  "Copy of PermanentVentures_Logo.png",
  "Copy of Ready Player.png",
  "Copy of red-logo-IOSG-PNG.png",
  "Copy of Three Body.png"
];

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


          {/* Layout: Left (What is Providence + Stats + Orders) | Right (sticky purchase) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8 order-2 lg:order-1">

          {/* What is Providence - Move to Left Side */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Card className="border-primary/20 bg-card backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white text-xl">What is Providence?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  Providence is a next-generation gaming ecosystem that combines blockchain technology with immersive gameplay experiences. 
                  Our platform enables players to truly own their in-game assets, participate in decentralized governance, and earn rewards 
                  through skilled gameplay. With Providence, we&apos;re building the future of gaming where players have real ownership, 
                  meaningful choices, and the ability to shape the worlds they inhabit.
                </p>
              </CardContent>
            </Card>
          </motion.div>
          {/* Total Raise Target */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mb-8"
          >
            <Card className="border-primary/20 bg-card backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Total Raise Target
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-3xl font-bold text-white">
                      ${SALE_DATA.currentRaised.toLocaleString()} USDT
                    </div>
                    <div className="text-sm text-muted-foreground">
                      of ${SALE_DATA.raiseTarget.toLocaleString()} USDT target
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-primary">
                      {((SALE_DATA.currentRaised / SALE_DATA.raiseTarget) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Complete</div>
                  </div>
                </div>
                <div className="w-full bg-secondary/20 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${(SALE_DATA.currentRaised / SALE_DATA.raiseTarget) * 100}%` }}
                  />
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Target can be exceeded - no hard cap limit
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Purchase Orders - Left Side Small Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mb-8"
          >
            <Card className="border-primary/20 bg-card backdrop-blur-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Live Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {MOCK_BIDS.slice(0, 3).map((bid, index) => (
                    <motion.div 
                      key={bid.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="flex items-center justify-between p-2 rounded border border-white/5 bg-muted/5 hover:bg-muted/10 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        </div>
                        <div className="text-xs">
                          <div className="text-white font-mono">{bid.wallet.slice(0, 6)}...{bid.wallet.slice(-4)}</div>
                        </div>
                      </div>
                      <div className="text-right text-xs">
                        <div className="text-white font-semibold">{(bid.amount / 1000).toFixed(0)}K</div>
                        <div className="text-muted-foreground">${bid.price}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-3 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Total Volume</span>
                    <span className="text-white font-semibold">
                      ${MOCK_BIDS.reduce((sum, bid) => sum + (bid.amount * bid.price), 0).toLocaleString()}
                    </span>
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
          <div className="mb-6 flex justify-center">
            <CardContainer containerClassName="py-4" className="w-36">
              <CardBody className="h-36 w-36 rounded-xl relative overflow-visible flex items-center justify-center">
                {/* pulsing glow ring */}
                <CardItem translateZ={10} className="absolute inset-0 flex items-center justify-center">
                  <div className="h-28 w-28 rounded-full blur-2xl bg-white/20 animate-[pulse_1.6s_ease-in-out_infinite] shadow-[0_0_50px_rgba(255,255,255,0.35)]" />
                </CardItem>
                {/* token */}
                <CardItem translateZ={30} className="flex items-center justify-center">
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

          {/* Price Trajectory Chart - Small, Under Purchase */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="mt-6"
          >
            <Card className="border-primary/20 bg-card backdrop-blur-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Price Trajectory - 1st Sale
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-3">
                  <p className="text-muted-foreground text-xs mb-1">
                    Current: <span className="text-white font-semibold">${SALE_DATA.pricePerToken}</span> per PRV
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Price increases exponentially with demand. Early access advantage.
                  </p>
                </div>
                
                {/* Enhanced bonding curve visualization */}
                <div className="relative h-24 bg-gradient-to-r from-primary/5 to-accent/5 rounded border border-white/10 overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 300 96">
                    <defs>
                      <linearGradient id="bondingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{stopColor: 'rgba(255,255,255,0.15)', stopOpacity: 1}} />
                        <stop offset="100%" style={{stopColor: 'rgba(255,255,255,0.02)', stopOpacity: 1}} />
                      </linearGradient>
                    </defs>
                    {/* More realistic bonding curve */}
                    <path
                      d="M 0,85 C 30,82 60,75 90,65 C 120,52 150,35 180,22 C 210,12 240,6 270,3 L 300,2 L 300,96 L 0,96 Z"
                      fill="url(#bondingGradient)"
                      stroke="rgba(255,255,255,0.4)"
                      strokeWidth="1.5"
                    />
                    {/* Current position with pulse */}
                    <motion.circle 
                      cx="25" 
                      cy="83" 
                      r="3" 
                      fill="white"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <text x="30" y="80" fill="white" fontSize="8" className="font-medium">
                      You are here
                    </text>
                    {/* Future price points */}
                    <circle cx="90" cy="65" r="2" fill="rgba(255,255,255,0.6)" />
                    <circle cx="150" cy="35" r="2" fill="rgba(255,255,255,0.4)" />
                    <circle cx="210" cy="12" r="2" fill="rgba(255,255,255,0.3)" />
                  </svg>
                </div>
                
                <div className="mt-2 text-xs text-muted-foreground">
                  Early participants secure the lowest entry prices
                </div>
              </CardContent>
            </Card>
          </motion.div>
          </div>
          </div>
          </div>

          {/* Investors Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.6 }}
            className="mt-12"
          >
            <div className="mt-8">
              <h3 className="text-2xl font-semibold text-center mb-8 text-white/90">
                Backed by Leading Investors
              </h3>
              <div className="relative overflow-hidden group">
                {/* Gradient overlays */}
                <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black/80 to-transparent z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black/80 to-transparent z-10" />
                
                {/* Marquee container */}
                <div 
                  className="flex space-x-12 py-8 marquee-scroll"
                  style={{
                    animation: 'marquee 25s linear infinite',
                    width: 'calc(200% + 3rem)'
                  }}
                >
                  {/* First set of logos */}
                  {INVESTORS.map((logo, index) => (
                    <div key={`first-${index}`} className="flex-shrink-0">
                      <img
                        src={`/assets/investors/${logo}`}
                        alt={`Investor ${index + 1}`}
                        className="h-12 w-auto opacity-70 hover:opacity-100 transition-opacity duration-300 filter brightness-0 invert"
                      />
                    </div>
                  ))}
                  {/* Duplicate set for seamless loop */}
                  {INVESTORS.map((logo, index) => (
                    <div key={`second-${index}`} className="flex-shrink-0">
                      <img
                        src={`/assets/investors/${logo}`}
                        alt={`Investor ${index + 1}`}
                        className="h-12 w-auto opacity-70 hover:opacity-100 transition-opacity duration-300 filter brightness-0 invert"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>


          {/* Utility / How to use section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
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

