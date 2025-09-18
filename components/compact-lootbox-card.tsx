"use client";

import React, { useEffect, useState } from "react";
import { CometCard } from "@/components/ui/comet-card";
import { Badge } from "@/components/ui/badge";

interface CompactLootboxCardProps {
  className?: string;
  isCompleted?: boolean;
  specialReward?: string;
  imageUrl?: string;
  feature?: string;
}

export function CompactLootboxCard({ className, isCompleted = false, specialReward = "Mystery Lootbox", imageUrl, feature }: CompactLootboxCardProps) {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowIntro(false), 900);
    return () => clearTimeout(t);
  }, []);
  return (
    <CometCard className={className}>
      <div
        className="relative overflow-hidden flex w-full cursor-pointer flex-col rounded-[20px] border-0 bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-indigo-900/30 backdrop-blur-sm h-80 p-1"
        style={{
          transformStyle: "preserve-3d",
          transform: "none",
          opacity: 1,
        }}
      >
        {/* Intro tint overlay (fades out on mount) */}
        <div
          className={`pointer-events-none absolute inset-1 rounded-[18px] bg-gradient-to-br from-purple-500/20 via-indigo-500/20 to-blue-500/20 transition-opacity duration-700 ${showIntro ? "opacity-100" : "opacity-0"}`}
        />
        
        {/* Background Image - fills card with small padding */}
        <div className="absolute inset-1">
          <img
            loading="lazy"
            className="w-full h-full object-cover rounded-[18px]"
            alt="Lootbox reward"
            src={imageUrl || "https://urdsxlylixebqhvmsaeu.supabase.co/storage/v1/object/public/public-assets/lootbox2.webp"}
            style={{
              filter: "none",
            }}
            onError={(e) => {
              console.error("Lootbox image failed to load:", e);
              // Fallback to a default image or show error state
              const target = e.target as HTMLImageElement;
              target.src = "/lootbox2.webp"; // Fallback to local image
            }}
            onLoad={() => {
              console.log("Lootbox image loaded successfully");
            }}
          />
        </div>
        
        {/* Locked overlay - only small lock icon in corner */}
        {!isCompleted && (
          <div className="absolute top-3 right-3 z-10">
            <div className="bg-black/60 rounded-full p-1">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
        )}
        
        {/* Text overlay at bottom */}
        <div className="absolute bottom-1 left-1 right-1 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 rounded-b-[18px]">
          <div className="text-center space-y-2">
            <div className="text-lg text-white font-bold drop-shadow-lg">
              {specialReward}
            </div>
            {feature && (
              <Badge 
                variant="secondary" 
                className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs px-2 py-1"
              >
                {feature}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </CometCard>
  );
}
