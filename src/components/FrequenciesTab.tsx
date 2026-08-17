"use client";

import React, { useState } from "react";
import { useFarol } from "@/context/FarolContext";
import { CURATED_CATEGORIES } from "@/lib/curated-affirmations";
import {
  Shield,
  TrendingUp,
  HeartHandshake,
  Target,
  Activity,
  Zap,
  Sparkles,
  Compass,
  Radio,
  Volume2,
  ChevronDown,
  ChevronUp,
  Check,
  Play,
} from "lucide-react";

export default function FrequenciesTab() {
  const { activeCategory, setActiveCategory } = useFarol();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(activeCategory);
  const [speakingText, setSpeakingText] = useState<string | null>(null);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Shield":
        return Shield;
      case "TrendingUp":
        return TrendingUp;
      case "HeartHandshake":
        return HeartHandshake;
      case "Target":
        return Target;
      case "Activity":
        return Activity;
      case "Zap":
        return Zap;
      case "Sparkles":
        return Sparkles;
      case "Compass":
        return Compass;
      default:
        return Radio;
    }
  };

  const handleSpeak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (speakingText === text) {
      window.speechSynthesis.cancel();
      setSpeakingText(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 0.94;
    utterance.pitch = 0.90;

    utterance.onend = () => setSpeakingText(null);
    utterance.onerror = () => setSpeakingText(null);

    setSpeakingText(text);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 pt-2 pb-24 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-[var(--accent)] font-mono-tech text-xs tracking-wider">
          <Radio className="w-4 h-4" />
          VAULT DE TRANSMISSÕES // 8 FREQUÊNCIAS
        </div>
        <h1 className="text-xl font-bold font-space text-[#ECEFF3]">
          Espectro de Frequências
        </h1>
        <p className="text-xs text-[#8FA0B0] leading-relaxed">
          Selecione uma frequência para calibrar o transmissor principal. Cada canal
          possui afirmações robóticas curadas para reprogramar uma dimensão específica.
        </p>
      </div>

      {/* Categories Grid / Accordion */}
      <div className="flex flex-col gap-3">
        {Object.values(CURATED_CATEGORIES).map((cat) => {
          const Icon = getIcon(cat.iconName);
          const isCurrentActive = activeCategory === cat.key;
          const isExpanded = expandedCategory === cat.key;

          return (
            <div
              key={cat.key}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isCurrentActive
                  ? "bg-[#16202C] border-[var(--accent-border)] shadow-[0_0_15px_var(--accent-surface)]"
                  : "bg-[#16202C]/60 border-[#26333F] hover:border-[#37485A]"
              }`}
            >
              {/* Category Card Header */}
              <div className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 ${
                      isCurrentActive
                        ? "bg-[var(--accent-surface)] border-[var(--accent-border)] text-[var(--accent)]"
                        : "bg-[#1D2A38] border-[#26333F] text-[#8FA0B0]"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-space font-bold text-sm text-[#ECEFF3] truncate">
                        {cat.name}
                      </h3>
                      <span className="text-[10px] font-mono-tech px-1.5 py-0.5 rounded bg-[#1D2A38] border border-[#26333F] text-[var(--accent)] shrink-0">
                        {cat.frequency}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8FA0B0] truncate mt-0.5">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Tune Button */}
                  <button
                    onClick={() => setActiveCategory(cat.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-space font-semibold transition-all ${
                      isCurrentActive
                        ? "bg-[var(--accent)] text-[#0E1520] font-bold shadow-[0_0_8px_var(--accent-glow)]"
                        : "bg-[#1D2A38] hover:bg-[#243547] text-[#ECEFF3] border border-[#26333F]"
                    }`}
                  >
                    {isCurrentActive ? (
                      <span className="flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Sintonizado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Play className="w-3 h-3 text-[var(--accent)]" />
                        Sintonizar
                      </span>
                    )}
                  </button>

                  {/* Expand Toggle */}
                  <button
                    onClick={() =>
                      setExpandedCategory(isExpanded ? null : cat.key)
                    }
                    className="p-1.5 rounded-lg bg-[#1D2A38] text-[#8FA0B0] hover:text-[#ECEFF3] border border-[#26333F] transition-colors"
                    title={isExpanded ? "Recolher" : "Ver afirmações"}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Affirmations List */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-[#26333F] flex flex-col gap-2 bg-[#0E1520]/50">
                  <div className="flex items-center justify-between text-[10px] font-mono-tech text-[#8FA0B0] pb-1">
                    <span>TRANSMISSÕES CURADAS ({cat.affirmations.length})</span>
                    <span>VOZ ROBÓTICA DISPONÍVEL</span>
                  </div>

                  <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                    {cat.affirmations.map((text, idx) => {
                      const isSpeakingThis = speakingText === text;
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-[#16202C] border border-[#26333F] hover:border-[#37485A] transition-all"
                        >
                          <div className="flex items-start gap-2 min-w-0">
                            <span className="text-[10px] font-mono-tech text-[var(--accent)] mt-0.5 shrink-0">
                              #{String(idx + 1).padStart(2, "0")}
                            </span>
                            <p className="font-fraunces text-xs text-[#ECEFF3] italic leading-relaxed">
                              "{text}"
                            </p>
                          </div>

                          <button
                            onClick={() => handleSpeak(text)}
                            className={`p-1.5 rounded-md transition-all shrink-0 ${
                              isSpeakingThis
                                ? "bg-[var(--accent)] text-[#0E1520]"
                                : "bg-[#1D2A38] text-[#8FA0B0] hover:text-[var(--accent)]"
                            }`}
                            title="Ouvir"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
