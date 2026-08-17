"use client";

import React, { useState, useEffect } from "react";
import { useFarol } from "@/context/FarolContext";
import { CURATED_CATEGORIES } from "@/lib/curated-affirmations";
import AudioVisualizer from "./AudioVisualizer";
import ShareModal from "./ShareModal";
import {
  Volume2,
  VolumeX,
  RotateCw,
  Star,
  Share2,
  CheckCircle2,
  Radio,
  Cpu,
  Bookmark,
} from "lucide-react";

export default function SignalCard() {
  const {
    activeSignal,
    activeCategory,
    isDecoding,
    isSpeaking,
    speakActiveSignal,
    stopSpeaking,
    cycleNewSignal,
    checkIn,
    checkedInToday,
    toggleFavorite,
    streak,
  } = useFarol();

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [isCheckinLoading, setIsCheckinLoading] = useState(false);

  // Progressive Typewriter / Decoding effect
  useEffect(() => {
    if (!activeSignal?.text) return;

    let index = 0;
    const fullText = activeSignal.text;
    setDisplayText("");

    const speed = Math.max(12, Math.floor(400 / fullText.length));
    const interval = setInterval(() => {
      index++;
      setDisplayText(fullText.slice(0, index));
      if (index >= fullText.length) {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [activeSignal?.text, isDecoding]);

  const category = activeSignal?.categoryKey
    ? CURATED_CATEGORIES[activeSignal.categoryKey] || CURATED_CATEGORIES[activeCategory]
    : CURATED_CATEGORIES[activeCategory] || { name: "Transmissão", frequency: "104.2 MHz" };

  const isAiSource = activeSignal?.source === "ai";

  const handleCheckinClick = async () => {
    if (checkedInToday || isCheckinLoading) return;
    setIsCheckinLoading(true);
    await checkIn();
    setIsCheckinLoading(false);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 pt-2 pb-24 flex flex-col gap-5">
      {/* Signal Station Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#16202C] via-[#1D2A38] to-[#121A24] border border-[#26333F] p-6 sm:p-8 shadow-2xl transition-all crt-grid">
        {/* Glowing Scanline */}
        <div className="animate-scanline" />

        {/* Top Header of Card */}
        <div className="flex items-center justify-between gap-2 pb-4 border-b border-[#26333F] text-[11px] font-mono-tech">
          {/* Signal Status */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#0E1520] border border-[#26333F] text-[var(--accent)] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
              SINAL ATIVO
            </span>
            <span className="text-[#8FA0B0] hidden sm:inline">
              FREQ: {category.frequency}
            </span>
          </div>

          {/* Source Indicator */}
          <div className="flex items-center gap-1.5">
            {isAiSource ? (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-700/60 text-indigo-300 font-medium">
                <Cpu className="w-3 h-3" />
                IA PERSONALIZADA
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#0E1520] border border-[#26333F] text-[#8FA0B0]">
                <Bookmark className="w-3 h-3 text-[var(--accent)]" />
                BANCO: {category.name.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Affirmation Text Body */}
        <div className="min-h-[160px] sm:min-h-[180px] flex items-center justify-center py-6 px-2">
          {activeSignal ? (
            <p className="font-fraunces text-2xl sm:text-3xl text-[#ECEFF3] leading-relaxed tracking-tight text-center italic transition-opacity">
              "{displayText}"
              {displayText.length < (activeSignal.text?.length || 0) && (
                <span className="inline-block w-2 h-6 bg-[var(--accent)] ml-1 animate-pulse" />
              )}
            </p>
          ) : (
            <div className="flex flex-col items-center gap-2 text-[#8FA0B0] font-mono-tech text-xs">
              <Radio className="w-6 h-6 animate-spin text-[var(--accent)]" />
              <span>SINTONIZANDO TRANSMISSÃO...</span>
            </div>
          )}
        </div>

        {/* Audio Equalizer (shown when playing) */}
        <div className="flex justify-center pb-2">
          <AudioVisualizer isPlaying={isSpeaking} />
        </div>

        {/* Card Lower Controls: TTS, Cycle, Favorite, Share */}
        <div className="flex items-center justify-between pt-4 border-t border-[#26333F] mt-2">
          {/* Audio TTS Button */}
          <button
            onClick={isSpeaking ? stopSpeaking : speakActiveSignal}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono-tech transition-all ${
              isSpeaking
                ? "bg-[var(--accent)] text-[#0E1520] font-bold shadow-[0_0_12px_var(--accent-glow)]"
                : "bg-[#0E1520] hover:bg-[#16202C] text-[#ECEFF3] border border-[#26333F]"
            }`}
            title="Ouvir transmissão em voz sintética"
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span>PARAR VOZ</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-[var(--accent)]" />
                <span>OUVIR SINAL</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-1.5">
            {/* Cycle New Signal */}
            <button
              onClick={cycleNewSignal}
              className="p-2.5 rounded-xl bg-[#0E1520] hover:bg-[#16202C] border border-[#26333F] text-[#ECEFF3] hover:text-[var(--accent)] transition-all"
              title="Sintonizar outro sinal do pool ativo"
            >
              <RotateCw
                className={`w-4 h-4 ${isDecoding ? "animate-spin text-[var(--accent)]" : ""}`}
              />
            </button>

            {/* Favorite Button */}
            <button
              onClick={() => activeSignal && toggleFavorite(activeSignal.id)}
              className={`p-2.5 rounded-xl border transition-all ${
                activeSignal?.isFavorite
                  ? "bg-amber-950/40 border-amber-500/60 text-amber-400"
                  : "bg-[#0E1520] hover:bg-[#16202C] border-[#26333F] text-[#8FA0B0] hover:text-[#ECEFF3]"
              }`}
              title="Favoritar afirmação"
            >
              <Star
                className={`w-4 h-4 ${
                  activeSignal?.isFavorite ? "fill-amber-400 text-amber-400" : ""
                }`}
              />
            </button>

            {/* Share Card */}
            <button
              onClick={() => setShareModalOpen(true)}
              className="p-2.5 rounded-xl bg-[#0E1520] hover:bg-[#16202C] border border-[#26333F] text-[#8FA0B0] hover:text-[#ECEFF3] transition-all"
              title="Compartilhar sinal"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary Action Button: "RECEBIDO" / Daily Check-in */}
      <button
        onClick={handleCheckinClick}
        disabled={checkedInToday || isCheckinLoading}
        className={`w-full relative overflow-hidden py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 ${
          checkedInToday
            ? "bg-[#16202C] border border-[var(--accent-border)] text-[var(--accent)] cursor-default shadow-sm"
            : "bg-[var(--accent)] hover:opacity-95 text-[#0E1520] font-bold shadow-[0_0_24px_var(--accent-glow)] active:scale-[0.98] cursor-pointer"
        }`}
      >
        {checkedInToday ? (
          <>
            <CheckCircle2 className="w-5 h-5 text-[var(--accent)]" />
            <div className="flex flex-col items-start text-left">
              <span className="font-space font-bold text-sm tracking-wide">
                SINAL RECEBIDO HOJE
              </span>
              <span className="text-[11px] font-mono-tech text-[#8FA0B0]">
                Sequência ativa: {streak} dia(s) consecutivos
              </span>
            </div>
          </>
        ) : (
          <>
            <span className="w-3 h-3 rounded-full bg-[#0E1520] animate-ping" />
            <span className="font-space font-extrabold text-base tracking-wider uppercase">
              {isCheckinLoading ? "CONFIRMANDO SINAL..." : "CONFIRMAR RECEBIMENTO"}
            </span>
          </>
        )}
      </button>

      {/* Sub-card: Station Guidance & Reprogramming Concept */}
      <div className="rounded-xl bg-[#16202C]/60 border border-[#26333F]/70 p-4 text-xs font-mono-tech text-[#8FA0B0] leading-relaxed flex items-start gap-3">
        <div className="w-2 h-2 rounded-full bg-[var(--accent)] mt-1 shrink-0" />
        <p>
          <strong className="text-[#ECEFF3]">PROTOCOLO DE TRANSMISSÃO:</strong> Leia a
          frase em silêncio uma vez. Repita-a mentalmente sem emoção forçada. A mente
          reprograma padrões através da declaração precisa e repetida, não do entusiasmo.
        </p>
      </div>

      {/* Share Modal */}
      <ShareModal
        signal={activeSignal}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />
    </div>
  );
}
