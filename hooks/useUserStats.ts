"use client"

import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

export interface UserStats {
  user_email: string
  total_xp: number
  level: number
  tokens: number
  total_quests_completed: number
  daily_quests_completed: number
  social_quests_completed: number
  web3_quests_completed: number
  current_daily_streak: number
  longest_daily_streak: number
  connected_social_accounts: number
  badges: string[]
  created_at: string
  updated_at: string
}

export function useUserStats() {
  const { data: session } = useSession()

  return useQuery({
    queryKey: ['user-stats', session?.user?.email],
    queryFn: async (): Promise<UserStats> => {
      const response = await fetch('/api/user/stats')
      if (!response.ok) {
        throw new Error('Failed to fetch user stats')
      }
      const result = await response.json()
      return result.data
    },
    enabled: !!session?.user?.email,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  })
}

// Helper function to calculate level from XP
export function calculateLevel(xp: number): number {
  // Level formula: level = floor(sqrt(xp / 100)) + 1
  return Math.floor(Math.sqrt(xp / 100)) + 1
}

// Helper function to calculate XP needed for next level
export function getNextLevelXP(level: number): number {
  // XP needed for level N = (N-1)^2 * 100
  return Math.pow(level, 2) * 100
}

// Helper function to calculate XP progress to next level
export function getLevelProgress(xp: number): { currentLevel: number, nextLevel: number, progress: number, progressPercentage: number } {
  const currentLevel = calculateLevel(xp)
  const nextLevel = currentLevel + 1
  const currentLevelXP = Math.pow(currentLevel - 1, 2) * 100
  const nextLevelXP = getNextLevelXP(nextLevel)
  const progress = xp - currentLevelXP
  const progressPercentage = (progress / (nextLevelXP - currentLevelXP)) * 100

  return {
    currentLevel,
    nextLevel,
    progress: Math.max(0, progress),
    progressPercentage: Math.min(100, Math.max(0, progressPercentage))
  }
}
