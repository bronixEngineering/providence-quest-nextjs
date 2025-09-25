"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, CheckCircle2, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

type DailyLinkQuest = {
  id: string;
  title: string;
  description: string;
  category: string;
  url: string | null;
  xp: number;
  tokens: number;
  special: string | null;
  isCompleted: boolean;
};

function useDailyLinkQuests() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["daily-link-quests", session?.user?.email],
    queryFn: async (): Promise<DailyLinkQuest[]> => {
      const res = await fetch("/api/quests/daily-link/today", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch daily link quests");
      const json = await res.json();
      return json.data || [];
    },
    enabled: !!session?.user,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

function useCompleteDailyLinkQuest() {
  const qc = useQueryClient();
  const session = useSession();
  return useMutation({
    mutationFn: async (questId: string) => {
      // Wait 10 seconds before completing the quest
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      const res = await fetch("/api/quests/daily-link/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to complete quest");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Quest completed");
      qc.invalidateQueries({ queryKey: ["daily-link-quests"] });
      qc.invalidateQueries({ queryKey: ["user-stats", session?.data?.user?.email] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to complete quest"),
  });
}

export default function DailyLinkQuests() {
  const { data, isLoading } = useDailyLinkQuests();
  const complete = useCompleteDailyLinkQuest();

  if (isLoading) return null;
  if (!data || data.length === 0) return null;

  return (
    <div className="space-y-4">
      {data.map((q) => (
        <Card key={q.id} className="border-primary/20 bg-card backdrop-blur-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ExternalLink className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{q.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">Daily</Badge>
                    <span className="text-sm text-muted-foreground">
                      +{q.xp} XP{q.tokens ? ` • +${q.tokens} Tokens` : ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-muted-foreground text-sm mb-3">{q.description}</p>
              </div>
              <Button
                variant={q.isCompleted ? "secondary" : "default"}
                disabled={q.isCompleted || complete.isPending || !q.url}
                onClick={() => {
                  if (q.url) window.open(q.url, "_blank", "noopener,noreferrer");
                  complete.mutate(q.id);
                }}
                className="ml-4"
              >
                {complete.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : q.isCompleted ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Completed
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Go
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


