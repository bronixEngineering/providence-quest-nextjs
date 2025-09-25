"use client";

import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-center mb-12"
    >
      <div className="inline-flex flex-col items-center gap-3 mb-6">
        <h1 className="text-4xl sm:text-6xl font-bold text-white drop-shadow-lg">
          Providence Genesis Allocation
        </h1>
        <Badge variant="outline" className="border-white/20 text-white/70">
          Founders&apos; presale access
        </Badge>
      </div>
      <p className="text-xl text-slate-300 mb-8">
        Secure your share of the Providence ecosystem
      </p>
    </motion.div>
  );
}
