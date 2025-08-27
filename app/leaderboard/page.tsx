/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Award, Crown, Zap, Star } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";

// Mock data - replace with real data later
const leaderboardData = [
  {
    rank: 1,
    name: "QuantumMaster",
    avatar: "",
    questsCompleted: 247,
    totalPoints: 98540,
    legendaryItems: 12,
    title: "Apex Legend"
  },
  {
    rank: 2,
    name: "CyberNinja",
    avatar: "",
    questsCompleted: 189,
    totalPoints: 87320,
    legendaryItems: 9,
    title: "Elite Warrior"
  },
  {
    rank: 3,
    name: "NeonSpectre",
    avatar: "",
    questsCompleted: 156,
    totalPoints: 76890,
    legendaryItems: 8,
    title: "Quest Master"
  },
  {
    rank: 4,
    name: "VoidHunter",
    avatar: "",
    questsCompleted: 134,
    totalPoints: 65430,
    legendaryItems: 6,
    title: "Shadow Walker"
  },
  {
    rank: 5,
    name: "PixelReaper",
    avatar: "",
    questsCompleted: 112,
    totalPoints: 58920,
    legendaryItems: 5,
    title: "Digital Assassin"
  }
];

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Crown className="h-6 w-6 text-yellow-500" />;
    case 2:
      return <Trophy className="h-6 w-6 text-gray-400" />;
    case 3:
      return <Medal className="h-6 w-6 text-amber-600" />;
    default:
      return <Award className="h-5 w-5 text-muted-foreground" />;
  }
}

function getRankBadgeVariant(rank: number) {
  switch (rank) {
    case 1:
      return "default";
    case 2:
      return "secondary";
    case 3:
      return "outline";
    default:
      return "secondary";
  }
}

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gradient-to-br from-background via-background to-secondary/10 py-8 pt-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-6 py-2 text-sm font-medium text-primary">
              🏆 Hall of Fame
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Elite Questers{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Leaderboard
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Witness the legends who dominate Providence Quest. Climb the ranks, earn legendary status, 
              and claim your place among the greatest questers.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="mb-2 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground">1,247</div>
                <div className="text-sm text-muted-foreground">Active Questers</div>
              </CardContent>
            </Card>
            <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="mb-2 flex items-center justify-center">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground">89,420</div>
                <div className="text-sm text-muted-foreground">Quests Completed</div>
              </CardContent>
            </Card>
            <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="mb-2 flex items-center justify-center">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground">2,156</div>
                <div className="text-sm text-muted-foreground">Legendary Items Earned</div>
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard */}
          <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Top Questers
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {leaderboardData.map((player, index) => (
                  <div
                    key={player.rank}
                    className={`flex items-center gap-4 p-6 transition-colors hover:bg-accent/5 ${
                      index !== leaderboardData.length - 1 ? "border-b border-border/50" : ""
                    }`}
                  >
                    {/* Rank */}
                    <div className="flex w-12 items-center justify-center">
                      {getRankIcon(player.rank)}
                    </div>

                    {/* Player Info */}
                    <div className="flex flex-1 items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={player.avatar} alt={player.name} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {player.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{player.name}</h3>
                          <Badge variant={getRankBadgeVariant(player.rank) as any} className="text-xs">
                            {player.title}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {player.questsCompleted} quests • {player.legendaryItems} legendary items
                        </div>
                      </div>
                    </div>

                    {/* Points */}
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary">
                        {player.totalPoints.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">XP</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="mt-8 text-center">
            <p className="mb-4 text-muted-foreground">
              Ready to climb the ranks? Start your quest journey today!
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Card className="inline-block border-primary/20 bg-primary/5 p-4">
                <p className="text-sm font-medium text-primary">
                  💡 Pro Tip: Complete daily quests for bonus XP and rare item drops!
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
      </main>
      <Footer />
    </div>
  );
}
