"use client";

import React, { useState } from "react";
import { SignalItem } from "@/context/FarolContext";
import { CURATED_CATEGORIES } from "@/lib/curated-affirmations";
import { X, Copy, Check, Radio, Share2 } from "lucide-react";

interface ShareModalProps {
  signal: SignalItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareModal({ signal, isOpen, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !signal) return null;

  const category = signal.categoryKey
    ? CURATED_CATEGORIES[signal.categoryKey] || { name: "Farol", frequency: "104.2 MHz" }
    : { name: "Personalizado", frequency: "AI-SYNTH" };

  const shareText = `📡 FAROL // TRANSMISSÃO [${category.frequency}]\n"${signal.text}"\n\n— Sintonizado no Farol`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Farol — Sinal Diário",
          text: `"${signal.text}"`,
          url: window.location.origin,
        });
      } catch {
        // Share cancelled or failed
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#16202C] border border-[#26333F] rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-[#1D2A38] text-[#8FA0B0] hover:text-[#ECEFF3] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-sm font-mono-tech text-[var(--accent)] tracking-wider mb-4 flex items-center gap-2">
          <Radio className="w-4 h-4" />
          CARTÃO DE TRANSMISSÃO
        </h3>

        {/* Visual Shareable Card Preview */}
        <div
          id="shareable-signal-card"
          className="relative overflow-hidden rounded-xl bg-gradient-to-b from-[#1D2A38] to-[#0E1520] border border-[#37485A] p-6 shadow-lg mb-6 crt-grid"
        >
          <div className="animate-scanline" />

          <div className="flex items-center justify-between text-[11px] font-mono-tech text-[#8FA0B0] mb-4 pb-3 border-b border-[#26333F]">
            <span className="flex items-center gap-1 text-[var(--accent)]">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-ping" />
              FAROL // ESTAÇÃO ATIVA
            </span>
            <span>{category.frequency}</span>
          </div>

          <p className="font-fraunces text-xl sm:text-2xl text-[#ECEFF3] leading-relaxed italic text-center py-4">
            "{signal.text}"
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-[#26333F] text-[10px] font-mono-tech text-[#8FA0B0]">
            <span>CANAL: {category.name.toUpperCase()}</span>
            <span className="text-[var(--accent)]">REPROGRAMAÇÃO MENTAL</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1D2A38] hover:bg-[#243547] border border-[#37485A] text-[#ECEFF3] font-space text-sm font-medium transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[var(--accent)]" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Sinal</span>
              </>
            )}
          </button>

          <button
            onClick={handleNativeShare}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[var(--accent)] hover:opacity-90 text-[#0E1520] font-space text-sm font-bold shadow-[0_0_15px_var(--accent-glow)] transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>Compartilhar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
