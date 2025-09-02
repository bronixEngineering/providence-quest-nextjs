"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Calendar, 
  Flame, 
  Trophy, 
  Coins, 
  Zap, 
  CheckCircle, 
  Clock,
  Gift
} from 'lucide-react'
import { useDailyCheckinStatus, useDailyCheckin, formatTimeUntilNext } from '@/hooks/useDailyCheckin'
import { toast } from 'sonner'

export default function DailyCheckin() {
  const { data: status, isLoading, error } = useDailyCheckinStatus()
  const checkinMutation = useDailyCheckin()
  const [timeUntilNext, setTimeUntilNext] = useState<number>(0)

  // Update countdown timer
  useEffect(() => {
    if (!status?.nextCheckinIn) return

    setTimeUntilNext(status.nextCheckinIn)
    
    const interval = setInterval(() => {
      setTimeUntilNext(prev => {
        const newTime = prev - 1000
        return newTime > 0 ? newTime : 0
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [status?.nextCheckinIn])

  const handleCheckin = async () => {
    try {
      const result = await checkinMutation.mutateAsync()
      
      // Show success toast with rewards
      toast.success(
        <div className="flex flex-col gap-2">
          <div className="font-semibold">Daily Check-in Complete! 🎉</div>
          <div className="text-sm">
            <div>+{result.xpEarned} XP • +{result.tokensEarned} Tokens</div>
            {result.bonusReward && (
              <div className="text-yellow-400">🎁 {result.bonusReward}</div>
            )}
            <div>Day {result.streakDay} streak!</div>
          </div>
        </div>,
        { duration: 5000 }
      )
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to check in')
    }
  }

  if (isLoading) {
    return (
      <Card className="border-primary/20 bg-card backdrop-blur-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !status) {
    return (
      <Card className="border-red-500/20 bg-card backdrop-blur-md">
        <CardContent className="p-6 text-center">
          <div className="text-red-400 mb-2">Failed to load check-in status</div>
          <div className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Unknown error'}
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-purple-400'
    if (streak >= 14) return 'text-orange-400'
    if (streak >= 7) return 'text-yellow-400'
    if (streak >= 3) return 'text-green-400'
    return 'text-blue-400'
  }

  const getNextReward = (streak: number) => {
    if (streak >= 30) return { target: null, reward: 'Monthly Master achieved!' }
    if (streak >= 14) return { target: 30, reward: 'Monthly Master (👑 +100 XP, +50 Tokens)' }
    if (streak >= 7) return { target: 14, reward: 'Bi-Weekly Beast (🦁 +40 XP, +25 Tokens)' }
    if (streak >= 3) return { target: 7, reward: 'Weekly Warrior (⚔️ +25 XP, +15 Tokens)' }
    return { target: 3, reward: '3-Day Streak (🔥 +15 XP, +8 Tokens)' }
  }

  const nextReward = getNextReward(status.currentStreak)
  const progressToNext = nextReward.target 
    ? Math.min((status.currentStreak / nextReward.target) * 100, 100)
    : 100

  return (
    <Card className="border border-border bg-card shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-100">Daily Check-in</CardTitle>
            <p className="text-sm text-slate-400 mt-1">Maintain your daily streak</p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getStreakColor(status.currentStreak)}`}>
              {status.currentStreak}
            </div>
            <div className="text-xs text-slate-400 uppercase tracking-wide">Day Streak</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-0">


        {/* Check-in Status - Compact */}
        <div>
          {status.hasCheckedInToday ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-medium text-sm">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span>Completed</span>
                {status.todayCheckin?.bonus_reward && (
                  <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded border border-amber-500/30">
                    {status.todayCheckin.bonus_reward}
                  </span>
                )}
              </div>
              
              {status.todayCheckin && (
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-cyan-400">+{status.todayCheckin.total_xp}</span>
                    <span className="text-slate-400">XP</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-amber-400">+{status.todayCheckin.tokens_earned}</span>
                    <span className="text-slate-400">Tokens</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleCheckin}
                disabled={checkinMutation.isPending || !status.canCheckinToday}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 border-0 text-white font-medium"
                size="sm"
              >
                {checkinMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    Checking in...
                  </div>
                ) : status.canCheckinToday ? (
                  'Check In'
                ) : (
                  'Unavailable'
                )}
              </Button>
              
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
                  10 XP
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-amber-400 rounded-full"></div>
                  5 Tokens
                </span>
                {nextReward.target && (
                  <span className="text-slate-500">
                    {status.currentStreak}/{nextReward.target} to next
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
