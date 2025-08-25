"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

export interface DailyCheckinStatus {
  canCheckinToday: boolean
  hasCheckedInToday: boolean
  todayCheckin: {
    id: string
    streak_day: number
    total_xp: number
    tokens_earned: number
    bonus_reward: string | null
    checked_in_at: string
  } | null
  currentStreak: number
  longestStreak: number
  totalCheckins: number
  totalXP: number
  level: number
  tokens: number
  nextCheckinIn: number // milliseconds
  nextCheckinAt: string // ISO string
}

export interface CheckinResult {
  streakDay: number
  xpEarned: number
  tokensEarned: number
  bonusReward: string | null
  message: string
  updatedStats: {
    totalXP: number
    level: number
    tokens: number
    currentStreak: number
    longestStreak: number
    totalCheckins: number
  }
}

export function useDailyCheckinStatus() {
  const { data: session } = useSession()

  return useQuery({
    queryKey: ['daily-checkin-status'],
    queryFn: async (): Promise<DailyCheckinStatus> => {
      const response = await fetch('/api/daily-checkin/status')
      if (!response.ok) {
        throw new Error('Failed to fetch checkin status')
      }
      const result = await response.json()
      return result.data
    },
    enabled: !!session?.user,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute to update countdown
  })
}

export function useDailyCheckin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (): Promise<CheckinResult> => {
      const response = await fetch('/api/daily-checkin/checkin', {
        method: 'POST',
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to check in')
      }
      
      const result = await response.json()
      return result.data
    },
    onSuccess: () => {
      // Invalidate and refetch checkin status
      queryClient.invalidateQueries({ queryKey: ['daily-checkin-status'] })
      // Also invalidate profile to update user stats
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

// Helper function to format time until next checkin
export function formatTimeUntilNext(milliseconds: number): string {
  if (milliseconds <= 0) return "Available now!"
  
  const hours = Math.floor(milliseconds / (1000 * 60 * 60))
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  } else {
    return `${seconds}s`
  }
}
