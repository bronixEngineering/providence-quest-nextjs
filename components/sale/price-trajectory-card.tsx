"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { SALE_DATA } from "./sale-data";

export function PriceTrajectoryCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.1, duration: 0.6 }}
      className="mt-6"
    >
      <Card className="border-primary/20 bg-card backdrop-blur-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Price Trajectory - 1st Sale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3">
            <p className="text-muted-foreground text-xs mb-1">
              Current: <span className="text-white font-semibold">${SALE_DATA.pricePerToken}</span> per PRV
            </p>
            <p className="text-muted-foreground text-xs">
              Price increases exponentially with demand. Early access advantage.
            </p>
          </div>
          
          {/* Enhanced bonding curve visualization */}
          <div className="relative h-24 bg-gradient-to-r from-primary/5 to-accent/5 rounded border border-white/10 overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 300 96">
              <defs>
                <linearGradient id="bondingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{stopColor: 'rgba(255,255,255,0.15)', stopOpacity: 1}} />
                  <stop offset="100%" style={{stopColor: 'rgba(255,255,255,0.02)', stopOpacity: 1}} />
                </linearGradient>
              </defs>
              {/* More realistic bonding curve */}
              <path
                d="M 0,85 C 30,82 60,75 90,65 C 120,52 150,35 180,22 C 210,12 240,6 270,3 L 300,2 L 300,96 L 0,96 Z"
                fill="url(#bondingGradient)"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1.5"
              />
              {/* Current position with pulse */}
              <motion.circle 
                cx="25" 
                cy="83" 
                r="3" 
                fill="white"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <text x="30" y="80" fill="white" fontSize="8" className="font-medium">
                You are here
              </text>
              {/* Future price points */}
              <circle cx="90" cy="65" r="2" fill="rgba(255,255,255,0.6)" />
              <circle cx="150" cy="35" r="2" fill="rgba(255,255,255,0.4)" />
              <circle cx="210" cy="12" r="2" fill="rgba(255,255,255,0.3)" />
            </svg>
          </div>
          
          <div className="mt-2 text-xs text-muted-foreground">
            Early participants secure the lowest entry prices
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
