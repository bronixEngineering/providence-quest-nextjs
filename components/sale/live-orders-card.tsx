"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { MOCK_BIDS } from "./sale-data";

export function LiveOrdersCard() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.7, duration: 0.6 }}
      className="mb-8"
    >
      <Card className="border-primary/20 bg-card backdrop-blur-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Users className="h-4 w-4" />
            Live Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {MOCK_BIDS.slice(0, 3).map((bid, index) => (
              <motion.div 
                key={bid.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex items-center justify-between p-2 rounded border border-white/5 bg-muted/5 hover:bg-muted/10 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  </div>
                  <div className="text-xs">
                    <div className="text-white font-mono">{bid.wallet.slice(0, 6)}...{bid.wallet.slice(-4)}</div>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <div className="text-white font-semibold">{(bid.amount / 1000).toFixed(0)}K</div>
                  <div className="text-muted-foreground">${bid.price}</div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-3 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Total Volume</span>
              <span className="text-white font-semibold">
                ${MOCK_BIDS.reduce((sum, bid) => sum + (bid.amount * bid.price), 0).toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
