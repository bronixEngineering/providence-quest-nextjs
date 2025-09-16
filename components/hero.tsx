import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Trophy, Users } from "lucide-react";
import Spline from "@splinetool/react-spline/next";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-visible w-full h-[calc(100vh+80px)] -mt-16 pt-16">
      {/* Spline 3D Background */}
      <div className="absolute inset-0 w-screen max-h-[calc(100vh+4rem)]">
        <Spline
          scene="https://prod.spline.design/BNEF76NZdN2aN7JY/scene.splinecode"
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
      <div className="relative z-10 w-full h-full flex flex-col justify-between px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl text-center">
          {/* Main Heading */}
          <h1 className="mb-6 text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-2xl">
            Embark on Providence
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Your Journey Starts Here
            </span>
          </h1>

        

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/bounty">
              <Button size="lg" className="h-12 px-8 text-lg cursor-pointer">
                Start Your Quest
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button variant="outline" size="lg" className="h-12 px-8 text-lg">
                View Leaderboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Cards - Moved to bottom */}
        <div className="mx-auto max-w-6xl w-full">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
