"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { SALE_DATA } from "./sale-data";

export function SaleStatsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
      >
        <Card className="border-primary/20 bg-card backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-muted-foreground text-sm mb-2">Total Supply</p>
                <p className="text-3xl font-bold text-white">
                  {SALE_DATA.totalTokens.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Tokens</p>
              </div>
              <div className="flex-shrink-0 ml-4">
                <img src="/sigil.png" alt="Providence Token" className="h-8 w-8 rounded opacity-80" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <Card className="border-primary/20 bg-card backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-muted-foreground text-sm mb-2">Price per Token</p>
                <p className="text-3xl font-bold text-white">
                  ${SALE_DATA.pricePerToken}
                </p>
                <p className="text-xs text-muted-foreground mt-1">ETH</p>
              </div>
              <div className="flex-shrink-0 ml-4">
                <img src="/sigil.png" alt="Providence Token" className="h-8 w-8 rounded opacity-80" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
      >
        <Card className="border-primary/20 bg-card backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-2">Sale Ends</p>
                <p className="text-2xl font-bold text-white">
                  7 Days
                </p>
                <p className="text-xs text-muted-foreground mt-1">Remaining</p>
              </div>
              <Clock className="h-6 w-6 text-white/80" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
