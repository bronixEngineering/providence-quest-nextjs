import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, Zap, Trophy, Users, Wallet, ArrowRight, Sparkles } from "lucide-react";
import { SignInModal } from "@/components/signin-modal";
import Spline from '@splinetool/react-spline/next';

export default function Hero() {
  return (
    <section className="relative overflow-hidden min-h-screen -mt-16 pt-16">
      {/* Spline 3D Background */}
      <div className="absolute inset-0 w-full h-full">
        <Spline
          scene="https://prod.spline.design/KPRd9BKgEYWvp8qh/scene.splinecode"
          className="w-full h-full"
        />
      </div>
      
      {/* Content Overlay */}
      <div className="relative z-10 container mx-auto px-4 py-24 sm:py-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-6 py-2 text-sm font-medium text-primary">
            🎮 Level Up Your Game
          </div>

          {/* Main Heading */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl drop-shadow-2xl">
            Complete Quests,{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Earn Epic Loot
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Master challenges, unlock rare game assets, and dominate the Providence Game universe. 
            Every quest completed brings you closer to legendary status.
          </p>

          {/* Arya-4 Chat Interface */}
          <div className="mx-auto mb-8 max-w-2xl">
            <div className="mb-4 flex items-center justify-center gap-2">
              <div className="h-3 w-3 bg-primary rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-primary">Interact with Arya-4</span>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Your AI friend in a futuristic digital world
            </p>
            <div className="flex gap-2 backdrop-blur-sm bg-background/10 p-4 rounded-xl border border-white/10">
              <Input 
                placeholder="Ask Arya-4 about your next quest..." 
                className="flex-1 h-12 text-base bg-background/50 border-white/20"
              />
              <Button size="icon" className="h-12 w-12">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <SignInModal>
              <Button size="lg" className="h-12 px-8 text-lg cursor-pointer">
                Start Your Quest
              </Button>
            </SignInModal>
            <Button variant="outline" size="lg" className="h-12 px-8 text-lg">
              View Leaderboard
            </Button>
          </div>



          {/* Feature Cards */}
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-white/20 bg-background/20 backdrop-blur-md">
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20 mx-auto backdrop-blur-sm">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Dynamic Quests</h3>
                <p className="text-sm text-muted-foreground">
                  Engage in ever-evolving challenges that adapt to your skill level and unlock epic rewards.
                </p>
              </CardContent>
            </Card>

            <Card className="border-white/20 bg-background/20 backdrop-blur-md">
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20 mx-auto backdrop-blur-sm">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Legendary Rewards</h3>
                <p className="text-sm text-muted-foreground">
                  Earn rare game assets, exclusive items, and digital treasures for Providence Game.
                </p>
              </CardContent>
            </Card>

            <Card className="border-white/20 bg-background/20 backdrop-blur-md sm:col-span-2 lg:col-span-1">
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20 mx-auto backdrop-blur-sm">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Elite Community</h3>
                <p className="text-sm text-muted-foreground">
                  Join the ranks of top questers and compete for dominance on the leaderboards.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Web3 Asset Discovery - Minimalist */}
          <div className="mt-12 mx-auto max-w-lg">
            <Card className="border-white/20 bg-background/20 backdrop-blur-md">
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20 mx-auto backdrop-blur-sm">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Own Web3 Assets?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect your wallet to earn bonus points from your existing NFTs and tokens.
                </p>
                <Button size="sm" variant="outline" className="w-full">
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Wallet
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

    </section>
  );
}
