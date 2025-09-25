"use client";

import React from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";

// Sale components
import { HeroSection } from "@/components/sale/hero-section";
import { OverviewSection } from "@/components/sale/overview-section";
import { RaiseTargetCard } from "@/components/sale/raise-target-card";
import { LiveOrdersCard } from "@/components/sale/live-orders-card";
import { SaleStatsGrid } from "@/components/sale/sale-stats-grid";
import { PurchasePanel } from "@/components/sale/purchase-panel";
import { PriceTrajectoryCard } from "@/components/sale/price-trajectory-card";
import { InvestorsSection } from "@/components/sale/investors-section";
import { TokenUtilitySection } from "@/components/sale/token-utility-section";

export default function SalePage() {
  return (
    <div className="relative min-h-screen bg-background overflow-visible">
      {/* Background image + top-strong gradient overlay */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[url('/providence-avatar.png')] bg-top bg-no-repeat bg-contain opacity-10 md:opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-transparent" />
      </div>

      <Header />

      <main className="relative z-10 container mx-auto px-4 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <HeroSection />

          {/* Layout: Left (Scrollable Content) | Right (Sticky Purchase) */}
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-8 lg:pr-12">
              {/* What is Providence */}
              <OverviewSection />

              {/* Total Raise Target */}
              <RaiseTargetCard />

              {/* Recent Purchase Orders */}
              <LiveOrdersCard />

              {/* Sale Stats Cards */}
              <SaleStatsGrid />
            </div>

            {/* Right Column: Sticky Purchase Panel */}
            <div className="lg:w-[26rem] lg:flex-shrink-0">
              <div className="lg:sticky lg:top-24 space-y-6">
                <PurchasePanel />
                {/* Price Trajectory Chart - Under Purchase Panel */}
                <PriceTrajectoryCard />
              </div>
            </div>
          </div>

          {/* Investors Section */}
          <InvestorsSection />

          {/* Utility / How to use section */}
          <TokenUtilitySection />
        </div>
      </main>

      <Footer />
    </div>
  );
}
