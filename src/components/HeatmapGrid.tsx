"use client";

import React from "react";
import { CheckInItem } from "@/context/FarolContext";

interface HeatmapGridProps {
  checkIns: CheckInItem[];
  daysCount?: number;
}

export default function HeatmapGrid({
  checkIns,
  daysCount = 28,
}: HeatmapGridProps) {
  const checkInDatesSet = new Set(checkIns.map((c) => c.date));

  // Generate last N days ending today
  const days = Array.from({ length: daysCount })
    .map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (daysCount - 1 - i));
      const dateStr = d.toISOString().split("T")[0];
      const hasCheckedIn = checkInDatesSet.has(dateStr);
      return {
        dateStr,
        dayNumber: d.getDate(),
        monthNumber: d.getMonth() + 1,
        dayOfWeek: d.toLocaleDateString("pt-BR", { weekday: "short" }),
        hasCheckedIn,
      };
    });

  const totalActive = days.filter((d) => d.hasCheckedIn).length;
  const consistencyRate = Math.round((totalActive / daysCount) * 100);

  return (
    <div className="flex flex-col gap-3 p-4 rounded-2xl bg-[#16202C] border border-[#26333F]">
      <div className="flex items-center justify-between text-xs font-mono-tech text-[#8FA0B0]">
        <span>RADAR DE CONSTÂNCIA // ÚLTIMOS {daysCount} DIAS</span>
        <span className="text-[var(--accent)] font-semibold">
          {consistencyRate}% EFICIÊNCIA ({totalActive}/{daysCount})
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-1">
        {days.map((day) => (
          <div
            key={day.dateStr}
            title={`${day.dateStr}: ${day.hasCheckedIn ? "Sinal Recebido" : "Sem transmissão"}`}
            className={`h-9 sm:h-10 rounded-lg flex flex-col items-center justify-center text-[10px] font-mono-tech transition-all border ${
              day.hasCheckedIn
                ? "bg-[var(--accent)] border-[var(--accent)] text-[#0E1520] font-bold shadow-[0_0_8px_var(--accent-glow)] scale-[1.02]"
                : "bg-[#0E1520] border-[#26333F] text-[#52667A] hover:border-[#37485A]"
            }`}
          >
            <span>{day.dayNumber}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono-tech text-[#8FA0B0] pt-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-[#0E1520] border border-[#26333F]" />
          <span>Vazio</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-[var(--accent)] shadow-sm" />
          <span>Sinal Confirmado</span>
        </div>
      </div>
    </div>
  );
}
