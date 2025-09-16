"use client";

import React, { useEffect, useState } from "react";
import { CometCard } from "@/components/ui/comet-card";
import { Badge } from "@/components/ui/badge";

interface CompactLootboxCardProps {
  className?: string;
  isCompleted?: boolean;
  specialReward?: string;
  imageUrl?: string;
}

export function CompactLootboxCard({ className, isCompleted = false, specialReward = "Mystery Lootbox", imageUrl }: CompactLootboxCardProps) {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowIntro(false), 900);
    return () => clearTimeout(t);
  }, []);
  return (
    <CometCard className={className}>
      <div
        className="relative overflow-hidden flex w-full cursor-pointer flex-col items-center rounded-[20px] border-0 bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-indigo-900/30 p-4 backdrop-blur-sm gap-4"
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
        
        {/* Resim */}
        <div className="relative">
          <img
            loading="lazy"
            className="w-32 h-32 object-contain rounded-xl"
            alt="Lootbox reward"
            src={imageUrl || "https://urdsxlylixebqhvmsaeu.supabase.co/storage/v1/object/public/public-assets/lootbox.webp"}
            style={{
              filter: "none",
            }}
            onError={(e) => {
              console.error("Lootbox image failed to load:", e);
              // Fallback to a default image or show error state
              const target = e.target as HTMLImageElement;
              target.src = "/lootbox.png"; // Fallback to local image
            }}
            onLoad={() => {
              console.log("Lootbox image loaded successfully");
            }}
          />
          {/* Locked overlay - only small lock icon in corner */}
          {!isCompleted && (
            <div className="absolute -top-1 -right-1">
              <div className="bg-black/60 rounded-full p-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
          )}
        </div>
        
        {/* Yazılar - Image'ın altında */}
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="text-lg text-gray-300 opacity-75 font-bold">
            Lootbox #001
          </div>
          
          <Badge 
            variant="secondary" 
            className={`px-4 py-2 text-sm font-medium ${
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
