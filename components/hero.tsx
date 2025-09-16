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
        {/* Main Heading - Top */}
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-2xl">
            Embark on Providence
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Your Journey Starts Here
            </span>
          </h1>
        </div>
        
        {/* CTA Buttons - Bottom */}
        <div className="mx-auto max-w-4xl text-center">
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
      </div>
    </section>
  );
}
