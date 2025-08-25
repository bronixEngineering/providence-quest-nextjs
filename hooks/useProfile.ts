"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

export interface ProfileData {
  id: string
  user_id: string
  email?: string
  name?: string
  avatar_url?: string
  wallet_address?: string
  wallet_verified: boolean
  level: number
  xp: number
  tokens: number
  completed_quests: number
  total_quests: number
  rank?: string
}

export function useProfile() {
  const { data: session, status } = useSession()
  
  console.log('🎣 useProfile Hook Debug:', {
    sessionStatus: status,
    hasSession: !!session,
    hasUser: !!session?.user,
    userId: session?.user?.id,
    enabled: !!session?.user
  })
  
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      console.log('🚀 Profile Query - Making API call to /api/profile')
      const response = await fetch('/api/profile')
      
      console.log('📡 Profile Query - Response status:', response.status)
      
      if (!response.ok) {
        console.error('❌ Profile Query - Response not ok:', response.status, response.statusText)
        throw new Error('Failed to fetch profile')
      }
      const data = await response.json()
      console.log('✅ Profile Query - Success:', data)
      return data.profile as ProfileData
    },
    enabled: !!session?.user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (updates: Partial<ProfileData>) => {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update profile')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

export function useConnectWallet() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ walletAddress }: { walletAddress: string }) => {
      const response = await fetch('/api/wallet/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to connect wallet')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

export function useVerifyWallet() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      signature, 
      walletAddress 
    }: { 
      signature: string
      walletAddress: string 
    }) => {
      const response = await fetch('/api/wallet/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ signature, walletAddress }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to verify wallet')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}
