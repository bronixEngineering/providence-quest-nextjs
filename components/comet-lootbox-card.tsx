"use client";

import React from "react";
import { CometCard } from "@/components/ui/comet-card";
import { Badge } from "@/components/ui/badge";
import { Gift, Sparkles, Zap } from "lucide-react";

interface CometLootboxCardProps {
  className?: string;
  isCompleted?: boolean;
  specialReward?: string;
}

export function CometLootboxCard({ className, isCompleted = false, specialReward = "Mystery Lootbox" }: CometLootboxCardProps) {
  return (
    <CometCard className={className}>
      <button
        type="button"
        className="my-10 flex w-80 cursor-pointer flex-col items-stretch rounded-[16px] border-0 bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-indigo-900/30 p-2 md:my-20 md:p-4 backdrop-blur-sm"
        aria-label="View lootbox reward"
        style={{
          transformStyle: "preserve-3d",
          transform: "none",
          opacity: 1,
        }}
      >
        <div className="mx-2 flex-1">
          <div className="relative mt-2 aspect-[3/4] w-full">
            <img
              loading="lazy"
              className="absolute inset-0 h-full w-full rounded-[16px] object-contain p-4"
              alt="Lootbox reward"
              src="/lootbox.png"
              style={{
                boxShadow: "rgba(0, 0, 0, 0.05) 0px 5px 6px 0px",
                opacity: 1,
                filter: isCompleted ? "none" : "brightness(0.8) saturate(0.7)",
              }}
            />
            {/* Glow effect overlay - only when completed */}
            {isCompleted && (
              <div className="absolute inset-0 rounded-[16px] bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-indigo-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            )}
            {/* Locked overlay - subtle */}
            {!isCompleted && (
              <div className="absolute inset-0 rounded-[16px] bg-black/20 flex items-center justify-center">
                <div className="bg-black/40 rounded-full p-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            )}
            
          </div>
        </div>
        
        <div className="mt-2 flex flex-col items-center justify-between p-4 font-mono text-white space-y-2">
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-purple-400" />
            <div className="text-xs font-semibold">Special Reward</div>
          </div>
          
          <div className="text-xs text-gray-300 opacity-75 text-center">
            Lootbox #001
          </div>
          
          <Badge 
            variant="secondary" 
            className={`px-3 py-1 text-xs font-medium ${
              isCompleted 
                ? "bg-green-500/20 text-green-400 border-green-500/30" 
                : "bg-purple-500/20 text-purple-400 border-purple-500/30"
            }`}
          >
            {isCompleted ? "🎉 Unlocked!" : "🔒 Locked"}
          </Badge>
        </div>
      </button>
    </CometCard>
  );
}
