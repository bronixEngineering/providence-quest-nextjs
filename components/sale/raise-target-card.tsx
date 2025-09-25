"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";
import { SALE_DATA } from "./sale-data";

export function RaiseTargetCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.6 }}
      className="mb-8"
    >
      <Card className="border-primary/20 bg-card backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5" />
            Total Raise Target
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-3xl font-bold text-white">
                ${SALE_DATA.currentRaised.toLocaleString()} USDT
              </div>
              <div className="text-sm text-muted-foreground">
                of ${SALE_DATA.raiseTarget.toLocaleString()} USDT target
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-primary">
                {((SALE_DATA.currentRaised / SALE_DATA.raiseTarget) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
          </div>
          <div className="w-full bg-secondary/20 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-1000"
              style={{ width: `${(SALE_DATA.currentRaised / SALE_DATA.raiseTarget) * 100}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Target can be exceeded - no hard cap limit
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
