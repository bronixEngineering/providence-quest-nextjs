"use client"

import { useEffect } from "react"
import { useSession, signIn } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Header from "@/components/header"
import { toast } from "sonner"

export default function ReferralSigninPage() {
  const { status } = useSession()
  const params = useParams<{ refId: string }>()
  const router = useRouter()
  const refId = params?.refId

  useEffect(() => {
    if (status === "authenticated") {
      toast.info("Account already exists. Redirecting to bounty…")
      router.replace("/bounty")
    }
  }, [status, router])

  const handleGoogleSignIn = async () => {
    if (!refId || typeof refId !== "string") {
      toast.error("Invalid referral link")
      router.replace("/bounty")
      return
    }
    await signIn("google", { callbackUrl: `/refferral-success?refId=${encodeURIComponent(refId)}` })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-md mx-auto">
          <Card className="border border-border bg-card shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-100">
                Join Providence via Referral
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-400">
                Sign in with Google to continue. Your referral will be applied automatically.
              </p>
              <Button
                onClick={handleGoogleSignIn}
                size="lg"
                className="w-full h-11 bg-primary text-primary-foreground"
                disabled={status === "loading"}
              >
                {status === "loading" ? "Preparing…" : "Continue with Google"}
              </Button>
              <p className="text-xs text-slate-500 text-center">
                By continuing, you agree to our Terms and Privacy Policy.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}


