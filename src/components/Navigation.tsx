"use client";

import React from "react";
import { Radio, Sparkles, SlidersHorizontal, BookOpen, Settings } from "lucide-react";

export type NavTab = "signal" | "create" | "frequencies" | "journal" | "station";

interface NavigationProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
}

export default function Navigation({ activeTab, onChangeTab }: NavigationProps) {
  const tabs = [
    {
      id: "signal" as NavTab,
      label: "Sinal",
      icon: Radio,
    },
    {
      id: "create" as NavTab,
      label: "Criar",
      icon: Sparkles,
    },
    {
      id: "frequencies" as NavTab,
      label: "Frequências",
      icon: SlidersHorizontal,
    },
    {
      id: "journal" as NavTab,
      label: "Diário",
      icon: BookOpen,
    },
    {
      id: "station" as NavTab,
      label: "Estação",
      icon: Settings,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 pb-safe px-4 pt-2 pb-3 bg-[#0E1520]/90 backdrop-blur-xl border-t border-[#26333F]">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all relative group ${
                isActive
                  ? "text-[var(--accent)] font-semibold"
                  : "text-[#8FA0B0] hover:text-[#ECEFF3]"
              }`}
            >
              {/* Active Indicator bar */}
              {isActive && (
                <span className="absolute -top-2 w-8 h-1 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent-glow-strong)] transition-all" />
              )}

              <div
                className={`p-1.5 rounded-lg transition-transform duration-200 ${
                  isActive
                    ? "bg-[var(--accent-surface)] scale-110"
                    : "group-hover:bg-[#16202C]"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <span className="text-[11px] font-space tracking-tight mt-0.5">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
