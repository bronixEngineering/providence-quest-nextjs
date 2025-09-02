import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Trophy, Users } from "lucide-react";
import Spline from "@splinetool/react-spline/next";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-visible w-full -mt-16 pt-16">
      {/* Spline 3D Background */}
      <div className="absolute inset-0 w-screen max-h-[calc(100vh+4rem)]">
        <Spline
          scene="https://prod.spline.design/KPRd9BKgEYWvp8qh/scene.splinecode"
          className="w-full h-full"
          style={{
            objectFit: "cover",
            objectPosition: "center",
            width: "100vw",
            height: "100%",
          }}
        />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 w-full px-4 py-24 sm:py-32">
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
            Master challenges, unlock rare game assets, and dominate the
            Providence Game universe. Every quest completed brings you closer to
            legendary status.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/bounty">
              <Button size="lg" className="h-12 px-8 text-lg cursor-pointer">
                Start Your Quest
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="h-12 px-8 text-lg">
              View Leaderboard
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pb-16">
            <Card className="border-white/20 bg-background/20 backdrop-blur-md">
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20 mx-auto backdrop-blur-sm">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Dynamic Quests</h3>
                <p className="text-sm text-muted-foreground">
                  Engage in ever-evolving challenges that adapt to your skill
                  level and unlock epic rewards.
                </p>
              </CardContent>
            </Card>

            <Card className="border-white/20 bg-background/20 backdrop-blur-md">
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20 mx-auto backdrop-blur-sm">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">
                  Legendary Rewards
                </h3>
                <p className="text-sm text-muted-foreground">
                  Earn rare game assets, exclusive items, and digital treasures
                  for Providence Game.
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
                  Join the ranks of top questers and compete for dominance on
                  the leaderboards.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
