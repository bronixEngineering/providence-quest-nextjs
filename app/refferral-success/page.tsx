"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { useMutation } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import Header from "@/components/header"
import { toast } from "sonner"

function ReferralSuccessInner() {
  const router = useRouter()
  const { status } = useSession()
  const params = useSearchParams()
  const refId = params.get("refId")

  const useReferral = useMutation({
    mutationFn: async (referralCode: string) => {
      const response = await fetch("/api/referral/use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralCode }),
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || "Referral failed")
      }
      return response.json()
    },
    onSuccess: () => {
      toast.success("Referral applied! Enjoy your rewards.")
      setTimeout(() => router.replace("/bounty"), 1200)
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Referral failed"
      toast.error(message)
      setTimeout(() => router.replace("/bounty"), 1500)
    },
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      if (refId) router.replace(`/refferral-signin/${encodeURIComponent(refId)}`)
      else router.replace("/bounty")
    }
    if (status === "authenticated" && refId && !useReferral.isPending && !useReferral.isSuccess && !useReferral.isError) {
      useReferral.mutate(refId)
    }
  }, [status, refId, router, useReferral])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-md mx-auto">
          <Card className="border border-border bg-card shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="text-slate-2 00 font-medium mb-2">Finalizing your referral…</div>
              <div className="text-slate-400 text-sm">Please wait, do not close this window.</div>
              <div className="mt-6 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function ReferralSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto px-4 pt-24 pb-12">
            <div className="max-w-md mx-auto">
              <Card className="border border-border bg-card shadow-xl">
                <CardContent className="p-6 text-center">
                  <div className="text-slate-200 font-medium mb-2">Loading…</div>
                  <div className="mt-6 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      }
    >
      <ReferralSuccessInner />
    </Suspense>
  )
}

export const dynamic = "force-dynamic"


