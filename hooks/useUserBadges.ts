"use client"

import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

export interface BadgeData {
  id: number
  user_discord_id: string
  badge_discord_role_id: string
  assigned_at: string
  badges: {
    discord_role_id: string
    name: string
    description: string
    color: string
    icon_url?: string
  }
}

export function useUserBadges() {
  const { data: session, status } = useSession()
  
  return useQuery({
    queryKey: ['user-badges'],
    queryFn: async () => {
      const response = await fetch('/api/user/badges')
      if (!response.ok) {
        throw new Error('Failed to fetch user badges')
      }
      const data = await response.json()
      return data.badges as BadgeData[]
    },
    enabled: !!session?.user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
