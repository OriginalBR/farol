"use client";

import React, { useState } from "react";
import { useFarol, SignalItem } from "@/context/FarolContext";
import { CURATED_CATEGORIES } from "@/lib/curated-affirmations";
import {
  Sparkles,
  Cpu,
  Radio,
  Play,
  Volume2,
  Star,
  Trash2,
  Check,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

export default function AICreatorTab() {
  const {
    deviceId,
    activeCategory,
    userProfile,
    setActiveCategory,
    activeSignal,
    speakActiveSignal,
    reloadSignals,
  } = useFarol();

  const [intentText, setIntentText] = useState("");
  const [selectedFeeling, setSelectedFeeling] = useState(
    userProfile?.desiredFeeling || "foco"
  );
  const [selectedCategory, setSelectedCategory] = useState(activeCategory || "foco");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSignals, setGeneratedSignals] = useState<SignalItem[]>([]);
  const [previewSpeakingId, setPreviewSpeakingId] = useState<string | null>(null);
  const [usedSignalId, setUsedSignalId] = useState<string | null>(null);

  const feelings = [
    { id: "calma", label: "Calma & Serenidade" },
    { id: "confiança", label: "Confiança Inabalável" },
    { id: "foco", label: "Foco & Disciplina" },
    { id: "clareza", label: "Clareza de Decisão" },
    { id: "coragem", label: "Coragem para Agir" },
    { id: "leveza", label: "Leveza sem Cobrança" },
    { id: "força", label: "Força sob Pressão" },
    { id: "prosperidade", label: "Prosperidade Real" },
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating) return;

    setIsGenerating(true);
    setGeneratedSignals([]);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId,
          customIntent: intentText,
          desiredFeeling: selectedFeeling,
          category: selectedCategory,
          mood: userProfile?.mood,
          obstacles: userProfile?.obstacles,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.affirmations) {
          setGeneratedSignals(data.affirmations);
          await reloadSignals();
        }
      }
    } catch (err) {
      console.error("Erro ao gerar sinais:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSpeak = (text: string, id: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (previewSpeakingId === id) {
      window.speechSynthesis.cancel();
      setPreviewSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 0.94;
    utterance.pitch = 0.90;

    utterance.onend = () => setPreviewSpeakingId(null);
    utterance.onerror = () => setPreviewSpeakingId(null);

    setPreviewSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleUseNow = (sig: SignalItem) => {
    setUsedSignalId(sig.id);
    setActiveCategory(sig.categoryKey || selectedCategory);
    setTimeout(() => setUsedSignalId(null), 2500);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 pt-2 pb-24 flex flex-col gap-6">
      {/* Tab Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-[var(--accent)] font-mono-tech text-xs tracking-wider">
          <Cpu className="w-4 h-4" />
          SINTONIZADOR DE IA // GERAÇÃO PERSONALIZADA
        </div>
        <h1 className="text-xl font-bold font-space text-[#ECEFF3]">
          Calibrar Novo Lote de Sinais
        </h1>
        <p className="text-xs text-[#8FA0B0] leading-relaxed">
          Gere afirmações robóticas e declarativas personalizadas para sua situação atual.
          Sem clichês de autoajuda — comandos diretos para reprogramar padrões mentais.
        </p>
      </div>

      {/* Generation Form */}
      <form onSubmit={handleGenerate} className="flex flex-col gap-4">
        {/* Intent Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono-tech text-[#ECEFF3] flex items-center justify-between">
            <span>O QUE VOCÊ PRECISA REPROGRAMAR OU ATINGIR AGORA?</span>
            <span className="text-[10px] text-[#8FA0B0]">(OPCIONAL)</span>
          </label>
          <textarea
            value={intentText}
            onChange={(e) => setIntentText(e.target.value)}
            placeholder="Ex: Não hesitar ao tomar decisões difíceis no trabalho; manter foco total no projeto sem checar redes..."
            rows={3}
            className="w-full p-3.5 rounded-xl bg-[#16202C] border border-[#26333F] text-sm text-[#ECEFF3] placeholder-[#52667A] focus:outline-none focus:border-[var(--accent)] transition-all resize-none"
          />
        </div>

        {/* Category & Feeling Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Target Frequency */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono-tech text-[#8FA0B0]">
              FREQUÊNCIA DE ANCORAGEM
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#16202C] border border-[#26333F] text-xs text-[#ECEFF3] focus:outline-none focus:border-[var(--accent)] font-mono-tech"
            >
              {Object.values(CURATED_CATEGORIES).map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.name} ({cat.frequency})
                </option>
              ))}
            </select>
          </div>

          {/* Desired Feeling */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono-tech text-[#8FA0B0]">
              ESTADO DESEJADO APÓS O SINAL
            </label>
            <select
              value={selectedFeeling}
              onChange={(e) => setSelectedFeeling(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#16202C] border border-[#26333F] text-xs text-[#ECEFF3] focus:outline-none focus:border-[var(--accent)] font-mono-tech"
            >
              {feelings.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isGenerating}
          className="w-full py-3.5 px-5 rounded-xl bg-[var(--accent)] hover:opacity-95 text-[#0E1520] font-space font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-[0_0_20px_var(--accent-glow)] transition-all cursor-pointer disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-[#0E1520]" />
              <span>DECODIFICANDO E SINTONIZANDO SINAIS...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>GERAR LOTE DE 6 AFIRMAÇÕES</span>
            </>
          )}
        </button>
      </form>

      {/* Generated Signals List */}
      {isGenerating && (
        <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-[#16202C]/60 border border-[#26333F] gap-3">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <Radio className="w-8 h-8 text-[var(--accent)] animate-spin" />
          </div>
          <p className="font-mono-tech text-xs text-[#ECEFF3]">
            SINTONIZANDO MOTOR IA (CLAUDE SONNET 4.6)
          </p>
          <p className="text-[11px] text-[#8FA0B0] text-center max-w-xs">
            Aplicando restrições de tempo presente, primeira pessoa e eliminação de clichês...
          </p>
        </div>
      )}

      {generatedSignals.length > 0 && !isGenerating && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-mono-tech text-[#8FA0B0] pb-1 border-b border-[#26333F]">
            <span className="text-[var(--accent)] font-semibold">
              TRANSMISSÕES GERADAS // {generatedSignals.length} SINAIS
            </span>
            <span>POOL PESSOAL ATIVO</span>
          </div>

          <div className="flex flex-col gap-2.5">
            {generatedSignals.map((sig, idx) => {
              const isUsed = usedSignalId === sig.id;
              const isSpeakingThis = previewSpeakingId === sig.id;

              return (
                <div
                  key={sig.id || idx}
                  className="relative overflow-hidden rounded-xl bg-[#16202C] border border-[#26333F] p-4 flex flex-col gap-3 hover:border-[#37485A] transition-all"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono-tech text-[#8FA0B0]">
                    <span className="text-[var(--accent)]">SINAL #{idx + 1}</span>
                    <span>IA PERSONALIZADA</span>
                  </div>

                  <p className="font-fraunces text-base text-[#ECEFF3] italic leading-relaxed">
                    "{sig.text}"
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-[#26333F]/70">
                    <button
                      onClick={() => handleSpeak(sig.text, sig.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono-tech transition-all ${
                        isSpeakingThis
                          ? "bg-[var(--accent)] text-[#0E1520] font-bold"
                          : "bg-[#1D2A38] text-[#ECEFF3] hover:text-[var(--accent)]"
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isSpeakingThis ? "Ouvindo" : "Ouvir"}</span>
                    </button>

                    <button
                      onClick={() => handleUseNow(sig)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-space font-semibold transition-all ${
                        isUsed
                          ? "bg-emerald-900/60 border border-emerald-500 text-emerald-300"
                          : "bg-[var(--accent-surface)] border border-[var(--accent-border)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[#0E1520]"
                      }`}
                    >
                      {isUsed ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Sinal Ativado!</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>Usar no Farol</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
