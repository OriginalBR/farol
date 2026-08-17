"use client";

import React, { useState } from "react";
import { useFarol } from "@/context/FarolContext";
import { Bell, X, Check } from "lucide-react";

export default function PushBanner() {
  const { pushStatus, subscribeToPush } = useFarol();
  const [dismissed, setDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (pushStatus === "granted" || pushStatus === "unsupported" || dismissed) {
    return null;
  }

  const handleSubscribe = async () => {
    setIsLoading(true);
    await subscribeToPush();
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 mb-2">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#16202C] to-[#1D2A38] border border-[var(--accent-border)] p-3.5 flex items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-lg bg-[var(--accent-surface)] text-[var(--accent)] shrink-0">
            <Bell className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <h4 className="font-space font-bold text-xs text-[#ECEFF3]">
              Ativar Notificações de Transmissão?
            </h4>
            <p className="text-[11px] text-[#8FA0B0] truncate">
              Receba os sinais nos seus horários com o app fechado.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="py-1.5 px-3 rounded-lg bg-[var(--accent)] text-[#0E1520] font-space font-bold text-xs hover:opacity-90 shadow-sm transition-all"
          >
            {isLoading ? "Ativando..." : "Ativar"}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-lg text-[#8FA0B0] hover:text-[#ECEFF3] transition-colors"
            title="Agora não"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
