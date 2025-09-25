"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Gamepad2, Trophy } from "lucide-react";

export function TokenUtilitySection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.6 }}
      className="mt-12"
    >
      <Card className="border-primary/20 bg-card backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white">How you&apos;ll use your tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg border border-white/10 bg-muted/10">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-5 w-5 text-white/80" />
                <span className="text-white font-medium">Governance</span>
              </div>
              <p className="text-sm text-muted-foreground">Shape the future of Providence with on-chain votes.</p>
            </div>
            <div className="p-4 rounded-lg border border-white/10 bg-muted/10">
              <div className="flex items-center gap-3 mb-2">
                <Gamepad2 className="h-5 w-5 text-white/80" />
                <span className="text-white font-medium">In-game economy</span>
              </div>
              <p className="text-sm text-muted-foreground">Unlock items, upgrades, and marketplace utilities.</p>
            </div>
            <div className="p-4 rounded-lg border border-white/10 bg-muted/10">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="h-5 w-5 text-white/80" />
                <span className="text-white font-medium">Rewards</span>
              </div>
              <p className="text-sm text-muted-foreground">Earn boosts and benefits by participating in the ecosystem.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Centered Avalanche badge */}
      <div className="mt-8 flex justify-center">
        <div className="bg-white rounded-md px-5 py-3 border border-white/20">
          <img src="/PoweredbyAvalanche_BlackWhite%201.png" alt="Powered by Avalanche" className="h-16 w-auto" />
        </div>
      </div>
    </motion.div>
  );
}
