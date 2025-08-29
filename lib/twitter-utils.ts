/**
 * Twitter utility functions for follow functionality
 */

export function createFollowUrl(username: string): string {
  // Remove @ if present
  const cleanUsername = username.replace('@', '')
  return `https://twitter.com/intent/follow?screen_name=${cleanUsername}`
}

export function createTwitterProfileUrl(username: string): string {
  const cleanUsername = username.replace('@', '')
  return `https://twitter.com/${cleanUsername}`
}

export async function checkFollowStatus(targetUsername: string): Promise<boolean> {
  try {
    const response = await fetch('/api/social/check-follow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ targetUsername }),
    })

    if (!response.ok) {
      throw new Error('Failed to check follow status')
    }

    const data = await response.json()
    return data.data.isFollowing
  } catch (error) {
    console.error('Error checking follow status:', error)
    return false
  }
}
