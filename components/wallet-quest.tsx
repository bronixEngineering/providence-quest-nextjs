/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, CheckCircle, Loader2, Shield } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useAccount, useSignMessage, useDisconnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { toast } from "sonner";

interface WalletConnection {
  address: string;
  verifiedAt: string;
  isPrimary: boolean;
  isVerified: boolean;
  nonce?: string;
  verificationMessage?: string;
}

interface WalletQuest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  tokenReward: number;
  specialReward?: string;
  isCompleted: boolean;
  wallet?: WalletConnection;
}

interface WalletStatusData {
  hasWallet: boolean;
  hasVerifiedWallet: boolean;
  wallet?: WalletConnection;
  quest: WalletQuest;
}

function useWalletStatus() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["wallet-status"],
    queryFn: async (): Promise<WalletStatusData> => {
      const response = await fetch("/api/wallet/status");
      if (!response.ok) {
        throw new Error("Failed to fetch wallet status");
      }
      const result = await response.json();
      return result.data;
    },
    enabled: !!session?.user,
    staleTime: 30 * 1000,
  });
}

function useWalletConnect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (walletAddress: string) => {
      const response = await fetch("/api/wallet/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to connect wallet");
      }

      const result = await response.json();
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet-status"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Connection failed");
    },
  });
}

// function useWalletDisconnect() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async () => {
//       const response = await fetch("/api/wallet/disconnect", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//       });

//       if (!response.ok) {
//         const error = await response.json();
//         throw new Error(error.error || "Failed to disconnect wallet");
//       }

//       return response.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["wallet-status"] });
//       toast.success("Wallet disconnected");
//     },
//     onError: (error) => {
//       toast.error(error instanceof Error ? error.message : "Disconnect failed");
//     },
//   });
// }

function useWalletVerify() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      walletAddress,
      signature,
      message,
    }: {
      walletAddress: string;
      signature: string;
      message: string;
    }) => {
      const response = await fetch("/api/wallet/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, signature, message }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to verify wallet");
      }

      const result = await response.json();
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["wallet-status"] });
      queryClient.invalidateQueries({ queryKey: ["user-stats"] });

      if (data.questCompleted && data.rewards) {
        toast.success(
          `Wallet connected! +${data.rewards.xp} XP, +${data.rewards.tokens} Tokens`
        );
      } else {
        toast.success("Wallet connected successfully!");
      }
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Verification failed"
      );
    },
  });
}

export default function WalletQuest() {
  const { data: walletData, isLoading, error } = useWalletStatus();
  const connectMutation = useWalletConnect();
  const verifyMutation = useWalletVerify();

  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const { signMessage } = useSignMessage();
  const { disconnect } = useDisconnect();

  const [pendingConnection, setPendingConnection] = useState<{
    nonce: string;
    message: string;
    walletAddress: string;
  } | null>(null);

  const handleConnect = async () => {
    if (!address || !isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      const result = await connectMutation.mutateAsync(address);
      setPendingConnection(result);
      // Auto-sign with the result to avoid stale/null state
      handleSign(result);
    } catch (error: any) {
      console.error("🔍 DEBUG - handleConnect error:", error);
      // Error handled by mutation
    }
  };

  const handleVerify = async () => {
    if (!address || !isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    console.log("🔍 DEBUG - handleVerify called with address:", address);

    // Always create new nonce and request signature
    try {
      console.log("🔍 DEBUG - Calling connectMutation...");
      const result = await connectMutation.mutateAsync(address);
      console.log(
        "🔍 DEBUG - connectMutation result:",
        JSON.stringify(result, null, 2)
      );
      setPendingConnection(result);

      // Call handleSign directly with the result data
      console.log("🔍 DEBUG - Calling handleSign with result data...");
      handleSign(result);
    } catch (error) {
      console.error("🔍 DEBUG - handleVerify error:", error);
      // Error handled by mutation
    }
  };

  const handleSign = async (connectionData: {
    nonce: string;
    message: string;
    walletAddress: string;
  }) => {
    const dataToUse = connectionData;

    console.log("🔍 DEBUG - handleSign called");
    console.log("🔍 DEBUG - dataToUse:", dataToUse);
    console.log("🔍 DEBUG - signMessage:", !!signMessage);

    if (!dataToUse?.message || !dataToUse?.walletAddress || !signMessage) {
      console.log("🔍 DEBUG - handleSign early return - missing data");
      toast.error("Missing signing data");
      return;
    }

    try {
      console.log("🔐 Wallet Quest - Starting signature process:", {
        message: dataToUse.message,
        walletAddress: dataToUse.walletAddress,
      });

      // Use Wagmi to sign the message - it's a callback function!
      signMessage(
        {
          message: dataToUse.message,
        },
        {
          onSuccess: async (signature) => {
            console.log("✍️ Wallet Quest - Signature received:", signature);

            await verifyMutation.mutateAsync({
              walletAddress: dataToUse.walletAddress,
              signature: signature,
              message: dataToUse.message,
            });
            setPendingConnection(null);
          },
          onError: (error) => {
            console.error("Signing error:", error);
            toast.error(
              "Failed to sign message: " + (error.message || "Unknown error")
            );
          },
        }
      );
    } catch (error) {
      console.error("Signing error:", error);
      toast.error(
        "Failed to sign message: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  };

  if (isLoading) {
    return (
      <Card className="border border-border bg-card shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !walletData) {
    return (
      <Card className="border border-red-500/20 bg-card">
        <CardContent className="p-6 text-center">
          <div className="text-red-400 mb-2">Failed to load wallet quest</div>
          <div className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Unknown error"}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Web3 Quests</h3>
          <p className="text-sm text-slate-400">
            Connect your wallet to unlock Web3 rewards
          </p>
        </div>
      </div>

      {/* Wallet Quest Card */}
      <Card className="border border-border bg-card shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Quest Info */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600">
                <Wallet className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-slate-100">
                    {walletData.quest.title}
                  </h4>
                  {walletData.quest.isCompleted && (
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                  )}
                </div>
                <p className="text-sm text-slate-400">
                  {walletData.quest.description}
                </p>
                {walletData.hasVerifiedWallet && walletData.wallet ? (
                  <p className="text-xs text-slate-500 mt-1 font-mono">
                    {walletData.wallet.address.slice(0, 6)}...
                    {walletData.wallet.address.slice(-4)}
                  </p>
                ) : address ? (
                  <p className="text-xs text-slate-500 mt-1 font-mono">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </p>
                ) : null}
                {isConnected && address && !walletData.hasVerifiedWallet && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded text-xs">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                      <span className="text-emerald-400 font-medium">
                        Connected
                      </span>
                      <span className="text-emerald-300 font-mono">
                        {address.slice(0, 6)}...{address.slice(-4)}
                      </span>
                    </div>
                    <button
                      onClick={() => disconnect()}
                      className="text-xs text-red-400 hover:text-red-300 underline underline-offset-2"
                    >
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Action & Rewards */}
            <div className="w-full sm:w-auto flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 sm:gap-4">
              <div className="text-left sm:text-right text-sm">
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="text-cyan-400">
                    +{walletData.quest.xpReward} XP
                  </span>
                </div>
                {walletData.quest.specialReward && (
                  <div className="text-xs text-slate-400 mt-1">
                    {walletData.quest.specialReward}
                  </div>
                )}
              </div>

              {walletData.quest.isCompleted ? (
                <Badge
                  variant="secondary"
                  className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                >
                  Completed
                </Badge>
              ) : !address ? (
                // Wallet not connected - show Rainbow connect button
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <Button
                      onClick={openConnectModal}
                      className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 border-0 text-white"
                      size="sm"
                    >
                      <Wallet className="h-3 w-3 mr-2" />
                      Connect Wallet
                    </Button>
                  )}
                </ConnectButton.Custom>
              ) : address ? (
                // Wallet connected - show verify/disconnect buttons
                <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={handleVerify}
                    disabled={connectMutation.isPending || !!pendingConnection}
                    className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-cyan-600 hover:opacity-90 border-0 text-white"
                    size="sm"
                  >
                    {connectMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Verifying...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Shield className="h-3 w-3" />
                        Verify Wallet
                      </div>
                    )}
                  </Button>
                </div>
              ) : (
                // Fallback - should not reach here
                <Button
                  onClick={handleConnect}
                  disabled={connectMutation.isPending || !!pendingConnection}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 border-0 text-white"
                  size="sm"
                >
                  <Wallet className="h-3 w-3 mr-2" />
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
