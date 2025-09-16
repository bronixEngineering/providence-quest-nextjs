import { Card, CardContent } from "@/components/ui/card";
import { Zap, Trophy, Users } from "lucide-react";

export default function FeaturesSection() {
  return (
    <section className="py-16 bg-background">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Follow the Quests
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Earn rewards and enhance your gameplay
          </p>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-border bg-card hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20 mx-auto">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Complete Tasks</h3>
              <p className="text-sm text-muted-foreground">
                Finish daily quests and social challenges to earn XP and unlock rewards.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20 mx-auto">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                Get Rewards
              </h3>
              <p className="text-sm text-muted-foreground">
                Collect lootboxes, XP, and special items for completing quests.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card hover:shadow-lg transition-shadow sm:col-span-2 lg:col-span-1">
            <CardContent className="p-6 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20 mx-auto">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Track Progress</h3>
              <p className="text-sm text-muted-foreground">
                See your stats, level up, and compete on the leaderboard.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
