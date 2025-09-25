"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";
import { 
  Wallet, 
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { SALE_DATA } from "./sale-data";

export function PurchasePanel() {
  const { isConnected } = useAccount();
  const { connect } = useConnect();
  
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [isPurchasing, setIsPurchasing] = useState(false);
  
  const remainingTokens = SALE_DATA.totalTokens - SALE_DATA.soldTokens;
  const totalPrice = parseFloat(purchaseAmount) * SALE_DATA.pricePerToken;

  const handlePurchase = async () => {
    if (!isConnected) {
      connect({ connector: injected() });
      return;
    }

    if (!purchaseAmount || parseFloat(purchaseAmount) < SALE_DATA.minPurchase) {
      return;
    }

    setIsPurchasing(true);
    // Simulate purchase
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsPurchasing(false);
    setPurchaseAmount("");
  };

  const handleMaxClick = () => {
    setPurchaseAmount(Math.min(SALE_DATA.maxPurchase, remainingTokens).toString());
  };

  return (
    <>
      {/* Minimal 3D Token (tight to content, no outer card) */}
      <div className="mb-6 flex justify-center">
        <CardContainer containerClassName="py-4" className="w-36">
          <CardBody className="h-36 w-36 rounded-xl relative overflow-visible flex items-center justify-center">
            {/* pulsing glow ring */}
            <CardItem translateZ={10} className="absolute inset-0 flex items-center justify-center">
              <div className="h-28 w-28 rounded-full blur-2xl bg-white/20 animate-[pulse_1.6s_ease-in-out_infinite] shadow-[0_0_50px_rgba(255,255,255,0.35)]" />
            </CardItem>
            {/* token */}
            <CardItem translateZ={30} className="flex items-center justify-center">
              <img src="/sigil.png" alt="PRV Token" className="h-20 w-20 opacity-95 drop-shadow-[0_0_45px_rgba(255,255,255,0.5)]" />
            </CardItem>
          </CardBody>
        </CardContainer>
      </div>
      
      {/* Purchase Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
          <Card className="relative overflow-hidden border-primary/20 bg-card backdrop-blur-md shadow-2xl">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_500px_at_0%_0%,rgba(255,255,255,0.06),transparent_60%)]" />
            <CardHeader className="pb-4">
              <CardTitle className="text-white flex items-center gap-3">
                <Wallet className="h-5 w-5 text-white/80" />
                Purchase Tokens
                {isConnected && (
                  <Badge variant="outline" className="border-white/20 text-white/70">Wallet Connected</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isConnected ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-white/70 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    Connect your wallet to participate in the Providence token sale and secure your share of the ecosystem.
                  </p>
                  <Button
                    onClick={() => connect({ connector: injected() })}
                    className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-white/10"
                  >
                    <Wallet className="h-5 w-5 mr-2" />
                    Connect Wallet
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white mb-3">Amount</label>
                      <div className="flex gap-2 items-stretch">
                        <div className="relative flex-1">
                          <Input
                            type="number"
                            placeholder="0.0"
                            value={purchaseAmount}
                            onChange={(e) => setPurchaseAmount(e.target.value)}
                            className="pr-16 bg-background border-white/10 text-white placeholder:text-muted-foreground focus:border-white/20 focus:ring-white/10"
                            min={SALE_DATA.minPurchase}
                            max={Math.min(SALE_DATA.maxPurchase, remainingTokens)}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">PRV</span>
                        </div>
                        <Button
                          variant="outline"
                          onClick={handleMaxClick}
                          className="border-white/10 text-white hover:bg-white/10 transition-all duration-200"
                        >
                          Max
                        </Button>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>Min: {SALE_DATA.minPurchase}</span>
                        <span>Max: {Math.min(SALE_DATA.maxPurchase, remainingTokens)}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-white">
                        Purchase Summary
                      </label>
                      <div className="bg-muted/20 rounded-lg p-4 border border-white/10">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-muted-foreground">Price per Token:</span>
                          <span className="text-white font-medium">${SALE_DATA.pricePerToken} ETH</span>
                        </div>
                        {purchaseAmount && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="border-t border-white/10 pt-2"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-white">Total Cost:</span>
                              <span className="text-white font-bold text-lg">
                                ${totalPrice.toFixed(2)} ETH
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={handlePurchase}
                      disabled={!purchaseAmount || parseFloat(purchaseAmount) < SALE_DATA.minPurchase || isPurchasing}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
                    >
                      {isPurchasing ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"
                        />
                      ) : (
                        <CheckCircle className="h-5 w-5 mr-2" />
                      )}
                      {isPurchasing ? "Processing..." : "Purchase Tokens"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
    </>
  );
}
