"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  CheckCircle,
  Loader2,
  Shield,
  Copy,
  ExternalLink,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useAccount, useConnect, useSignMessage } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { toast } from "sonner";

interface WalletConnection {
  address: string;
  verifiedAt: string;
  isPrimary: boolean;
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

  const [pendingConnection, setPendingConnection] = useState<{
    nonce: string;
    message: string;
    walletAddress: string;
  } | null>(null);
  const [showMessage, setShowMessage] = useState(false);

  const handleConnect = async () => {
    if (!address || !isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      const result = await connectMutation.mutateAsync(address);
      setPendingConnection(result);
      setShowMessage(true);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleSign = async () => {
    if (!pendingConnection || !signMessage) return;

    try {
      // Use Wagmi to sign the message
      const signature = await signMessage({
        message: pendingConnection.message,
      });

      await verifyMutation.mutateAsync({
        walletAddress: pendingConnection.walletAddress,
        signature: signature ?? "",
        message: pendingConnection.message,
      } as {
        walletAddress: string;
        signature: string;
        message: string;
      });
      setPendingConnection(null);
      setShowMessage(false);
    } catch (error) {
      toast.error("Failed to sign message");
      console.error("Signing error:", error);
    }
  };

  const copyMessage = () => {
    if (pendingConnection) {
      navigator.clipboard.writeText(pendingConnection.message);
      toast.success("Message copied to clipboard");
    }
  };

  if (isLoading) {
    return (
      <Card className="border border-slate-700/50 bg-slate-900/95 shadow-xl">
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
      <Card className="border border-red-500/20 bg-red-500/5">
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
      <Card className="border border-slate-700/50 bg-slate-900/95 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
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
                {walletData.wallet && (
                  <p className="text-xs text-slate-500 mt-1 font-mono">
                    {walletData.wallet.address.slice(0, 6)}...
                    {walletData.wallet.address.slice(-4)}
                  </p>
                )}
              </div>
            </div>

            {/* Action & Rewards */}
            <div className="flex items-center gap-4">
              <div className="text-right text-sm">
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="text-cyan-400">
                    +{walletData.quest.xpReward} XP
                  </span>
                  <span className="text-amber-400">
                    +{walletData.quest.tokenReward} Tokens
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
              ) : !isConnected ? (
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <Button
                      onClick={openConnectModal}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 border-0 text-white"
                      size="sm"
                    >
                      <Wallet className="h-3 w-3 mr-2" />
                      Connect Wallet
                    </Button>
                  )}
                </ConnectButton.Custom>
              ) : (
                <Button
                  onClick={handleConnect}
                  disabled={connectMutation.isPending || !!pendingConnection}
                  className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:opacity-90 border-0 text-white"
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
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signature Required Modal */}
      {showMessage && pendingConnection && (
        <Card className="border border-orange-500/20 bg-orange-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-400">
              <Shield className="h-5 w-5" />
              Signature Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-300">
              Please sign this message to verify wallet ownership:
            </p>

            <div className="bg-slate-800/50 p-3 rounded border border-slate-700/50">
              <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono">
                {pendingConnection.message}
              </pre>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={copyMessage}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Copy className="h-3 w-3" />
                Copy Message
              </Button>

              <Button
                onClick={handleSign}
                disabled={verifyMutation.isPending}
                className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:opacity-90"
                size="sm"
              >
                {verifyMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Verifying...
                  </div>
                ) : (
                  "Sign & Verify"
                )}
              </Button>
            </div>

            <p className="text-xs text-slate-500">
              Connect your Web3 wallet and sign the message to verify ownership.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
