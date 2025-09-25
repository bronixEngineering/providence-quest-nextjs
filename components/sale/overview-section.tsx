"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function OverviewSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.6 }}
    >
      <Card className="border-primary/20 bg-card backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white text-xl">What is Providence?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed text-sm">
            Providence is a next-generation gaming ecosystem that combines blockchain technology with immersive gameplay experiences. 
            Our platform enables players to truly own their in-game assets, participate in decentralized governance, and earn rewards 
            through skilled gameplay. With Providence, we&apos;re building the future of gaming where players have real ownership, 
            meaningful choices, and the ability to shape the worlds they inhabit.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
