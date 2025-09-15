"use client";

import React from "react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { Badge } from "@/components/ui/badge";
import { Gift, Sparkles, Zap } from "lucide-react";

interface LootboxCardProps {
  className?: string;
  isCompleted?: boolean;
  specialReward?: string;
}

export function LootboxCard({ className, isCompleted = false, specialReward = "Mystery Lootbox" }: LootboxCardProps) {
  return (
    <CardContainer className={`inter-var ${className}`}>
      <CardBody className="bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 relative group/card dark:hover:shadow-2xl dark:hover:shadow-purple-500/[0.1] dark:bg-black/50 dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[20rem] h-auto rounded-xl p-6 border backdrop-blur-sm">
        {/* Glowing background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-indigo-500/10 rounded-xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
        
        {/* Sparkle effects */}
        <div className="absolute top-4 right-4 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500">
          <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
        </div>
        
        <CardItem
          translateZ="50"
          className="text-xl font-bold text-white mb-2 flex items-center gap-2"
        >
          <Gift className="h-6 w-6 text-purple-400" />
          Special Reward
        </CardItem>
        
        <CardItem
          as="p"
          translateZ="60"
          className="text-purple-200 text-sm max-w-sm mb-4"
        >
          Complete the referral quest to unlock this exclusive lootbox!
        </CardItem>
        
        <CardItem translateZ="100" className="w-full mb-6">
          <div className="relative">
            <img
              src="/lootbox.png"
              height="200"
              width="200"
              className="h-48 w-full object-contain rounded-xl group-hover/card:shadow-xl transition-all duration-300"
              alt="Mystery Lootbox"
              style={{
                filter: isCompleted ? "none" : "brightness(0.8) saturate(0.7)",
              }}
            />
            {/* Glow effect on hover - only when completed */}
            {isCompleted && (
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"></div>
            )}
            {/* Locked overlay - subtle */}
            {!isCompleted && (
              <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center">
                <div className="bg-black/40 rounded-full p-3">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </CardItem>
        
        <div className="flex flex-col gap-3">
          <CardItem
            translateZ={20}
            className="text-center"
          >
            <Badge 
              variant="secondary" 
              className={`px-4 py-2 text-sm font-medium ${
                isCompleted 
                  ? "bg-green-500/20 text-green-400 border-green-500/30" 
                  : "bg-purple-500/20 text-purple-400 border-purple-500/30"
              }`}
            >
              {isCompleted ? "🎉 Unlocked!" : "🔒 Locked"}
            </Badge>
          </CardItem>
          
          <CardItem
            translateZ={20}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span>{specialReward}</span>
            </div>
          </CardItem>
        </div>
      </CardBody>
    </CardContainer>
  );
}
