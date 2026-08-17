"use client";

import React, { useState } from "react";
import { FarolProvider, useFarol } from "@/context/FarolContext";
import Header from "@/components/Header";
import Navigation, { NavTab } from "@/components/Navigation";
import SignalCard from "@/components/SignalCard";
import AICreatorTab from "@/components/AICreatorTab";
import FrequenciesTab from "@/components/FrequenciesTab";
import JournalTab from "@/components/JournalTab";
import StationTab from "@/components/StationTab";
import OnboardingFlow from "@/components/OnboardingFlow";
import PushBanner from "@/components/PushBanner";
import { Radio } from "lucide-react";

function FarolApp() {
  const { isOnboarded, isLoading } = useFarol();
  const [activeTab, setActiveTab] = useState<NavTab>("signal");

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0E1520] text-[#ECEFF3] gap-4 p-4">
        <div className="relative w-16 h-16 rounded-2xl bg-[#16202C] border border-[#26333F] flex items-center justify-center text-[var(--accent)] shadow-[0_0_30px_var(--accent-glow)]">
          <Radio className="w-8 h-8 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[var(--accent)] animate-ping" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-mono-tech text-[var(--accent)] tracking-widest uppercase">
            FAROL // ESTAÇÃO ATIVA
          </span>
          <span className="text-sm font-space text-[#8FA0B0]">
            Sintonizando frequências mentais...
          </span>
        </div>
      </div>
    );
  }

  if (!isOnboarded) {
    return <OnboardingFlow />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0E1520] text-[#ECEFF3]">
      {/* Top Station Header */}
      <Header />

      {/* Main Tab View */}
      <main className="flex-1 w-full flex flex-col pt-2">
        {activeTab === "signal" && (
          <>
            <PushBanner />
            <SignalCard />
          </>
        )}
        {activeTab === "create" && <AICreatorTab />}
        {activeTab === "frequencies" && <FrequenciesTab />}
        {activeTab === "journal" && <JournalTab />}
        {activeTab === "station" && <StationTab />}
      </main>

      {/* Persistent Bottom Tactile Navigation */}
      <Navigation activeTab={activeTab} onChangeTab={setActiveTab} />
    </div>
  );
}

export default function HomePage() {
  return (
    <FarolProvider>
      <FarolApp />
    </FarolProvider>
  );
}
