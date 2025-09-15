"use client";

import React, { useEffect, useState } from "react";
import { CometCard } from "@/components/ui/comet-card";
import { Badge } from "@/components/ui/badge";

interface CompactLootboxCardProps {
  className?: string;
  isCompleted?: boolean;
  specialReward?: string;
}

export function CompactLootboxCard({ className, isCompleted = false, specialReward = "Mystery Lootbox" }: CompactLootboxCardProps) {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowIntro(false), 900);
    return () => clearTimeout(t);
  }, []);
  return (
    <CometCard className={className}>
      <div
        className="relative overflow-hidden flex w-160 h-96 cursor-pointer flex-row items-center rounded-[20px] border-0 bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-indigo-900/30 p-6 backdrop-blur-sm gap-8"
        style={{
          transformStyle: "preserve-3d",
          transform: "none",
          opacity: 1,
        }}
      >
        {/* Intro tint overlay (fades out on mount) */}
        <div
          className={`pointer-events-none absolute inset-0 rounded-[20px] bg-gradient-to-br from-purple-500/20 via-indigo-500/20 to-blue-500/20 transition-opacity duration-700 ${showIntro ? "opacity-100" : "opacity-0"}`}
        />
        {/* Sol taraf - Resim */}
        <div className="relative flex-shrink-0">
          <img
            loading="lazy"
            className="w-80 h-80 object-contain rounded-xl"
            alt="Lootbox reward"
            src="/lootbox.png"
            style={{
              filter: "none",
            }}
          />
          {/* Locked overlay - only small lock icon in corner */}
          {!isCompleted && (
            <div className="absolute -top-1 -right-1">
              <div className="bg-black/60 rounded-full p-2">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
          )}
        </div>
        
        {/* Sağ taraf - Yazılar */}
        <div className="flex flex-col justify-center space-y-6 flex-1">
          <div className="text-4xl text-gray-300 opacity-75 font-bold">
            Lootbox #001
          </div>
          
          <Badge 
            variant="secondary" 
            className={`px-8 py-4 text-xl font-medium w-fit ${
              isCompleted 
                ? "bg-green-500/20 text-green-400 border-green-500/30" 
                : "bg-purple-500/20 text-purple-400 border-purple-500/30"
            }`}
          >
            {isCompleted ? "🎉 Unlocked" : "🔒 Locked"}
          </Badge>
        </div>
      </div>
    </CometCard>
  );
}
