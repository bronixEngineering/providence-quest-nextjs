"use client";

import React from "react";
import { motion } from "framer-motion";
import { INVESTORS } from "./sale-data";

export function InvestorsSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0, duration: 0.6 }}
      className="mt-12"
    >
      <div className="mt-8">
        <h3 className="text-2xl font-semibold text-center mb-8 text-white/90">
          Backed by Leading Investors
        </h3>
        <div className="relative overflow-hidden group">
          {/* Gradient overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black/80 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black/80 to-transparent z-10" />
          
          {/* Marquee container */}
          <div 
            className="flex space-x-12 py-8 marquee-scroll"
            style={{
              animation: 'marquee 25s linear infinite',
              width: 'calc(200% + 3rem)'
            }}
          >
            {/* First set of logos */}
            {INVESTORS.map((logo, index) => (
              <div key={`first-${index}`} className="flex-shrink-0">
                <img
                  src={`/assets/investors/${logo}`}
                  alt={`Investor ${index + 1}`}
                  className="h-12 w-auto opacity-70 hover:opacity-100 transition-opacity duration-300 filter brightness-0 invert"
                />
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {INVESTORS.map((logo, index) => (
              <div key={`second-${index}`} className="flex-shrink-0">
                <img
                  src={`/assets/investors/${logo}`}
                  alt={`Investor ${index + 1}`}
                  className="h-12 w-auto opacity-70 hover:opacity-100 transition-opacity duration-300 filter brightness-0 invert"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
