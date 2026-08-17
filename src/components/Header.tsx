"use client";

import React from "react";
import { useFarol } from "@/context/FarolContext";
import { CURATED_CATEGORIES } from "@/lib/curated-affirmations";
import { Radio, Flame, Volume2, VolumeX, Wifi, WifiOff } from "lucide-react";

export default function Header() {
  const {
    activeCategory,
    streak,
    checkedInToday,
    isSpeaking,
    stopSpeaking,
    isOnline,
    nextTransmission,
  } = useFarol();

  const category = CURATED_CATEGORIES[activeCategory] || {
    name: "Frequência Base",
    frequency: "100.0 MHz",
  };

  return (
    <header className="w-full max-w-xl mx-auto pt-4 pb-2 px-4 flex items-center justify-between z-20">
      {/* Station ID / Live indicator */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-[#16202C] border border-[#26333F] text-[var(--accent)] shadow-sm">
          <Radio className="w-4 h-4 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[var(--accent)] animate-pulse-live" />
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold tracking-wider font-space text-[#ECEFF3] uppercase">
              FAROL
            </span>
            <span className="inline-block text-[10px] font-mono-tech px-1.5 py-0.5 rounded bg-[#1D2A38] border border-[#26333F] text-[var(--accent)]">
              {category.frequency}
            </span>
          </div>
          <p className="text-[11px] font-mono-tech text-[#8FA0B0] truncate max-w-[140px]">
            CANAL: {category.name.toUpperCase()}
          </p>
        </div>
      </div>

      {/* Right controls: Next schedule, Audio state, Streak */}
      <div className="flex items-center gap-2">
        {/* Audio active indicator */}
        {isSpeaking && (
          <button
            onClick={stopSpeaking}
            title="Parar áudio"
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--accent-surface)] border border-[var(--accent-border)] text-[var(--accent)] text-xs font-mono-tech transition-all animate-pulse"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>TOCANDO</span>
          </button>
        )}

        {/* Offline indicator if disconnected */}
        {!isOnline && (
          <div
            title="Modo offline: sinais em cache"
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-950/40 border border-amber-800/60 text-amber-300 text-[10px] font-mono-tech"
          >
            <WifiOff className="w-3 h-3" />
            <span>OFFLINE</span>
          </div>
        )}

        {/* Next Transmission readout */}
        {nextTransmission && (
          <div className="hidden sm:flex flex-col items-end px-2 py-0.5 rounded bg-[#16202C] border border-[#26333F]">
            <span className="text-[9px] font-mono-tech text-[#8FA0B0]">PRÓXIMO SINAL</span>
            <span className="text-[11px] font-mono-tech font-semibold text-[var(--accent)]">
              {nextTransmission}
            </span>
          </div>
        )}

        {/* Streak Badge */}
        <div
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-mono-tech text-xs font-semibold transition-all ${
            checkedInToday
              ? "bg-[var(--accent-surface)] border-[var(--accent-border)] text-[var(--accent)] shadow-[0_0_12px_var(--accent-glow)]"
              : "bg-[#16202C] border-[#26333F] text-[#8FA0B0]"
          }`}
          title={
            checkedInToday
              ? `Check-in ativo hoje! Sequência de ${streak} dia(s).`
              : `Sequência de ${streak} dia(s). Faça o check-in hoje!`
          }
        >
          <Flame
            className={`w-4 h-4 ${
              checkedInToday
                ? "text-[var(--accent)] fill-[var(--accent)] animate-bounce"
                : "text-[#8FA0B0]"
            }`}
          />
          <span>{streak}d</span>
        </div>
      </div>
    </header>
  );
}
