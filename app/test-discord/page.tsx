"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestDiscord() {
  const { data: session, status } = useSession()

  console.log('Test Discord - Session:', session)
  console.log('Test Discord - Status:', status)

  if (status === "loading") {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4">Loading...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Discord Login Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {session ? (
            <div>
              <h3 className="text-lg font-semibold">Logged in!</h3>
              <div className="bg-gray-100 p-4 rounded mt-4">
                <pre>{JSON.stringify(session, null, 2)}</pre>
              </div>
              <Button 
                onClick={() => signOut()} 
                variant="outline" 
                className="mt-4"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p>Not logged in</p>
              
              <div className="space-y-2">
                <Button 
                  onClick={() => signIn("google")}
                  className="w-full"
                >
                  Sign in with Google
                </Button>
                
                <Button 
                  onClick={() => signIn("discord")}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  Sign in with Discord
                </Button>
                
                <Button 
                  onClick={() => signIn("twitter")}
                  className="w-full bg-sky-500 hover:bg-sky-600"
                >
                  Sign in with Twitter
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
