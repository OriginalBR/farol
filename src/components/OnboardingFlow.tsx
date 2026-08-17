"use client";

import React, { useState } from "react";
import { useFarol } from "@/context/FarolContext";
import { CURATED_CATEGORIES } from "@/lib/curated-affirmations";
import {
  Radio,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Shield,
  TrendingUp,
  HeartHandshake,
  Target,
  Activity,
  Zap,
  Compass,
  Clock,
  Volume2,
  Cpu,
} from "lucide-react";

export default function OnboardingFlow() {
  const { completeOnboarding } = useFarol();

  const [step, setStep] = useState(1);
  const totalSteps = 8;

  // Answers State
  const [selectedMood, setSelectedMood] = useState("foco");
  const [selectedCategory, setSelectedCategory] = useState("foco");
  const [selectedObstacles, setSelectedObstacles] = useState<string[]>([]);
  const [customObstacle, setCustomObstacle] = useState("");
  const [selectedFeeling, setSelectedFeeling] = useState("clareza");
  const [goalText, setGoalText] = useState("");
  const [selectedSchedules, setSelectedSchedules] = useState<string[]>([
    "08:00",
    "14:00",
    "21:00",
  ]);
  const [customTime, setCustomTime] = useState("");
  const [isTuning, setIsTuning] = useState(false);

  // Step 2: Baseline Moods
  const moods = [
    {
      id: "dispersao",
      title: "Névoa Mental & Dispersão",
      desc: "Dificuldade de concentração e atenção fragmentada.",
    },
    {
      id: "sobrecarga",
      title: "Sobrecarga de Demandas",
      desc: "Excesso de tarefas e sensação de urgência contínua.",
    },
    {
      id: "transicao",
      title: "Transição & Incerteza",
      desc: "Mudança de ciclo ou decisões estratégicas pela frente.",
    },
    {
      id: "impulso",
      title: "Em Busca de Tração & Maestria",
      desc: "Vontade de elevar consistência e execução ao próximo nível.",
    },
  ];

  // Step 4: Obstacles
  const defaultObstacles = [
    "Ansiedade e ruminação mental",
    "Procrastinação em tarefas-chave",
    "Comparação e ruído de redes",
    "Autocobrança excessiva",
    "Medo de errar ou hesitação",
    "Cansaço biológico e mental",
    "Insegurança ao me posicionar",
    "Falta de direção de longo prazo",
  ];

  // Step 5: Target Feelings
  const feelings = [
    { id: "calma", label: "Calma Lúcida", desc: "Mente serena e desacelerada" },
    { id: "confiança", label: "Confiança Firme", desc: "Autoridade e presença segura" },
    { id: "coragem", label: "Coragem Prática", desc: "Ação imediata sem paralisia" },
    { id: "foco", label: "Foco Absoluto", desc: "Atenção ancorada na prioridade" },
    { id: "leveza", label: "Leveza sem Cobrança", desc: "Fluidez sem peso emocional" },
    { id: "gratidao", label: "Gratidão Ancorada", desc: "Reconhecimento do momento real" },
    { id: "clareza", label: "Clareza de Decisão", desc: "Visão desobstruída do caminho" },
    { id: "força", label: "Força sob Pressão", desc: "Resiliência perante o atrito" },
  ];

  const toggleObstacle = (obs: string) => {
    if (selectedObstacles.includes(obs)) {
      setSelectedObstacles(selectedObstacles.filter((o) => o !== obs));
    } else {
      setSelectedObstacles([...selectedObstacles, obs]);
    }
  };

  const toggleSchedule = (time: string) => {
    if (selectedSchedules.includes(time)) {
      if (selectedSchedules.length > 1) {
        setSelectedSchedules(selectedSchedules.filter((t) => t !== time));
      }
    } else {
      setSelectedSchedules([...selectedSchedules, time]);
    }
  };

  const handleAddCustomTime = () => {
    if (customTime && !selectedSchedules.includes(customTime)) {
      setSelectedSchedules([...selectedSchedules, customTime]);
      setCustomTime("");
    }
  };

  const handleFinalize = async () => {
    setIsTuning(true);

    const allObstacles = [...selectedObstacles];
    if (customObstacle.trim()) {
      allObstacles.push(customObstacle.trim());
    }

    await completeOnboarding({
      mood: selectedMood,
      category: selectedCategory,
      obstacles: allObstacles,
      desiredFeeling: selectedFeeling,
      goalText: goalText.trim(),
      schedules: selectedSchedules,
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between max-w-lg mx-auto p-4 sm:p-6">
      {/* Top Header & Progress */}
      <div className="flex flex-col gap-3 pt-2">
        <div className="flex items-center justify-between text-[11px] font-mono-tech text-[#8FA0B0]">
          <span className="flex items-center gap-1.5 text-[var(--accent)] font-semibold">
            <Radio className="w-4 h-4" />
            CALIBRAÇÃO DE ESTAÇÃO
          </span>
          <span>
            ETAPA {step} DE {totalSteps}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full bg-[#16202C] overflow-hidden border border-[#26333F]">
          <div
            className="h-full bg-[var(--accent)] transition-all duration-300 shadow-[0_0_8px_var(--accent-glow)]"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Step Content */}
      <div className="py-6 flex-1 flex flex-col justify-center">
        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="flex flex-col gap-5 text-center animate-in fade-in duration-300">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-[#16202C] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] shadow-[0_0_24px_var(--accent-glow)]">
              <Radio className="w-8 h-8 animate-pulse" />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-mono-tech text-[var(--accent)] tracking-widest uppercase">
                ESTAÇÃO TRANSMISSORA DE SINAIS
              </span>
              <h1 className="text-3xl font-bold font-space text-[#ECEFF3] tracking-tight">
                Bem-vindo ao Farol.
              </h1>
            </div>

            <p className="font-fraunces text-base sm:text-lg text-[#8FA0B0] leading-relaxed italic max-w-md mx-auto">
              "Aqui, afirmações não são frases motivacionais efusivas. São sinais
              declarativos, curtos e em primeira pessoa — comandos calmos para
              reprogramar seus padrões mentais com constância."
            </p>

            <div className="p-4 rounded-xl bg-[#16202C] border border-[#26333F] text-xs font-mono-tech text-[#8FA0B0] text-left">
              <p>
                ✓ Sem paywalls ou anúncios
                <br />
                ✓ Sinais personalizados por IA (Claude Sonnet 4.6)
                <br />✓ Transmissões diárias diretas nos seus horários
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Baseline Mood */}
        {step === 2 && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-300">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-mono-tech text-[var(--accent)]">
                FASE 01 // LEITURA DO ESTADO ATUAL
              </span>
              <h2 className="text-xl font-bold font-space text-[#ECEFF3]">
                Como está seu momento agora?
              </h2>
              <p className="text-xs text-[#8FA0B0]">
                Identifique a frequência predominante da sua mente hoje.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              {moods.map((m) => {
                const isSelected = selectedMood === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMood(m.id)}
                    className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-[var(--accent-surface)] border-[var(--accent-border)] text-[#ECEFF3] shadow-[0_0_12px_var(--accent-surface)]"
                        : "bg-[#16202C] border-[#26333F] text-[#8FA0B0] hover:border-[#37485A]"
                    }`}
                  >
                    <div>
                      <h4 className="font-space font-bold text-sm text-[#ECEFF3]">
                        {m.title}
                      </h4>
                      <p className="text-xs text-[#8FA0B0] mt-0.5">{m.desc}</p>
                    </div>
                    {isSelected && (
                      <Check className="w-5 h-5 text-[var(--accent)] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Priority Category */}
        {step === 3 && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-300">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-mono-tech text-[var(--accent)]">
                FASE 02 // SINTONIZAÇÃO PRINCIPAL
              </span>
              <h2 className="text-xl font-bold font-space text-[#ECEFF3]">
                Qual área pede mais atenção agora?
              </h2>
              <p className="text-xs text-[#8FA0B0]">
                Esta será sua frequência padrão para o sinal diário.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {Object.values(CURATED_CATEGORIES).map((cat) => {
                const isSelected = selectedCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between min-h-[90px] transition-all ${
                      isSelected
                        ? "bg-[var(--accent-surface)] border-[var(--accent-border)] text-[#ECEFF3] shadow-[0_0_12px_var(--accent-surface)]"
                        : "bg-[#16202C] border-[#26333F] text-[#8FA0B0] hover:border-[#37485A]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono-tech text-[var(--accent)]">
                        {cat.frequency}
                      </span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-[var(--accent)]" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-space font-bold text-xs text-[#ECEFF3]">
                        {cat.name}
                      </h4>
                      <p className="text-[10px] text-[#8FA0B0] truncate mt-0.5">
                        {cat.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Obstacles */}
        {step === 4 && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-300">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-mono-tech text-[var(--accent)]">
                FASE 03 // FILTRO DE RUÍDOS
              </span>
              <h2 className="text-xl font-bold font-space text-[#ECEFF3]">
                O que mais pesa para você agora?
              </h2>
              <p className="text-xs text-[#8FA0B0]">
                Selecione os atritos que o sinal deve neutralizar (múltipla escolha).
              </p>
            </div>

            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
              {defaultObstacles.map((obs) => {
                const isSelected = selectedObstacles.includes(obs);
                return (
                  <button
                    key={obs}
                    onClick={() => toggleObstacle(obs)}
                    className={`p-3 rounded-xl border text-left text-xs font-space flex items-center justify-between transition-all ${
                      isSelected
                        ? "bg-[var(--accent-surface)] border-[var(--accent-border)] text-[#ECEFF3]"
                        : "bg-[#16202C] border-[#26333F] text-[#8FA0B0] hover:border-[#37485A]"
                    }`}
                  >
                    <span>{obs}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[var(--accent)]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Obstacle */}
            <input
              type="text"
              value={customObstacle}
              onChange={(e) => setCustomObstacle(e.target.value)}
              placeholder="Outro obstáculo específico (opcional)..."
              className="p-3 rounded-xl bg-[#16202C] border border-[#26333F] text-xs text-[#ECEFF3] placeholder-[#52667A] focus:outline-none focus:border-[var(--accent)] font-mono-tech"
            />
          </div>
        )}

        {/* Step 5: Target Feeling */}
        {step === 5 && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-300">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-mono-tech text-[var(--accent)]">
                FASE 04 // ALVO NEURAL
              </span>
              <h2 className="text-xl font-bold font-space text-[#ECEFF3]">
                Como você quer se sentir após o sinal?
              </h2>
              <p className="text-xs text-[#8FA0B0]">
                A sensação que cada afirmação ajudará a ancorar.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {feelings.map((f) => {
                const isSelected = selectedFeeling === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFeeling(f.id)}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? "bg-[var(--accent-surface)] border-[var(--accent-border)] text-[#ECEFF3] shadow-[0_0_12px_var(--accent-surface)]"
                        : "bg-[#16202C] border-[#26333F] text-[#8FA0B0] hover:border-[#37485A]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-space font-bold text-xs text-[#ECEFF3]">
                        {f.label}
                      </span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-[var(--accent)]" />
                      )}
                    </div>
                    <p className="text-[10px] text-[#8FA0B0] mt-1">{f.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 6: Goal / Manifestation Intent */}
        {step === 6 && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-300">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-mono-tech text-[var(--accent)]">
                FASE 05 // DIRETRIZ PESSOAL
              </span>
              <h2 className="text-xl font-bold font-space text-[#ECEFF3]">
                Tem algo específico que quer manifestar ou alcançar?
              </h2>
              <p className="text-xs text-[#8FA0B0]">
                Opcional. A IA do Farol usará este contexto para calibrar suas
                transmissões.
              </p>
            </div>

            <textarea
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              placeholder="Ex: Concluir o lançamento do projeto sem hesitação; manter disciplina de exercícios às 6h da manhã; falar com segurança em reuniões executivas..."
              rows={4}
              className="w-full p-4 rounded-xl bg-[#16202C] border border-[#26333F] text-sm text-[#ECEFF3] placeholder-[#52667A] focus:outline-none focus:border-[var(--accent)] resize-none font-space leading-relaxed"
            />
          </div>
        )}

        {/* Step 7: Transmission Schedules */}
        {step === 7 && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-300">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-mono-tech text-[var(--accent)]">
                FASE 06 // CRONOGRAMA DE ONDAS
              </span>
              <h2 className="text-xl font-bold font-space text-[#ECEFF3]">
                Horários de transmissão diária
              </h2>
              <p className="text-xs text-[#8FA0B0]">
                Em quais momentos do dia você deseja sintonizar o Farol?
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {[
                { time: "08:00", label: "Manhã" },
                { time: "14:00", label: "Tarde" },
                { time: "21:00", label: "Noite" },
              ].map((p) => {
                const isSelected = selectedSchedules.includes(p.time);
                return (
                  <button
                    key={p.time}
                    onClick={() => toggleSchedule(p.time)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      isSelected
                        ? "bg-[var(--accent-surface)] border-[var(--accent-border)] text-[#ECEFF3]"
                        : "bg-[#16202C] border-[#26333F] text-[#8FA0B0]"
                    }`}
                  >
                    <Clock className="w-4 h-4 text-[var(--accent)]" />
                    <span className="font-mono-tech text-xs font-bold">
                      {p.time}
                    </span>
                    <span className="text-[10px] text-[#8FA0B0]">{p.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Time */}
            <div className="flex gap-2 pt-2">
              <input
                type="time"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="p-2.5 rounded-xl bg-[#16202C] border border-[#26333F] text-xs text-[#ECEFF3] font-mono-tech focus:outline-none focus:border-[var(--accent)]"
              />
              <button
                type="button"
                onClick={handleAddCustomTime}
                disabled={!customTime}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#1D2A38] hover:bg-[#243547] border border-[#37485A] text-xs font-space font-medium text-[#ECEFF3] disabled:opacity-40"
              >
                + Adicionar Horário Customizado
              </button>
            </div>
          </div>
        )}

        {/* Step 8: Tuning & Launch Animation */}
        {step === 8 && (
          <div className="flex flex-col items-center justify-center text-center gap-6 py-6 animate-in fade-in duration-300">
            {isTuning ? (
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-[var(--accent)] animate-ping opacity-30" />
                  <div className="w-16 h-16 rounded-full bg-[#16202C] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] shadow-[0_0_30px_var(--accent-glow-strong)]">
                    <Radio className="w-8 h-8 animate-spin" />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-mono-tech text-[var(--accent)] tracking-wider">
                    SINTONIZANDO FREQUÊNCIAS...
                  </span>
                  <h3 className="text-lg font-bold font-space text-[#ECEFF3]">
                    Gerando primeiros sinais no Claude Sonnet 4.6
                  </h3>
                  <p className="text-xs text-[#8FA0B0] max-w-xs mx-auto">
                    Gravando perfil criptografado no SQLite e calibrando o transmissor.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#16202C] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] shadow-[0_0_24px_var(--accent-glow)]">
                  <Sparkles className="w-8 h-8" />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-mono-tech text-[var(--accent)]">
                    CALIBRAÇÃO COMPLETA
                  </span>
                  <h2 className="text-2xl font-bold font-space text-[#ECEFF3]">
                    Sua Estação Está Pronta
                  </h2>
                  <p className="text-xs text-[#8FA0B0] max-w-sm mx-auto leading-relaxed">
                    Clique abaixo para sintonizar seu primeiro sinal ativo e iniciar sua
                    sequência diária de constância.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#26333F]">
        {step > 1 && !isTuning ? (
          <button
            onClick={() => setStep(step - 1)}
            className="py-3 px-4 rounded-xl bg-[#16202C] hover:bg-[#1D2A38] border border-[#26333F] text-xs font-space font-medium text-[#ECEFF3] flex items-center gap-1.5 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>
        ) : (
          <div />
        )}

        {step < totalSteps ? (
          <button
            onClick={() => setStep(step + 1)}
            className="py-3 px-6 rounded-xl bg-[var(--accent)] hover:opacity-95 text-[#0E1520] font-space font-bold text-xs shadow-[0_0_15px_var(--accent-glow)] flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>Avançar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleFinalize}
            disabled={isTuning}
            className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-[var(--accent)] hover:opacity-95 text-[#0E1520] font-space font-extrabold text-sm shadow-[0_0_24px_var(--accent-glow)] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Radio className="w-4 h-4" />
            <span>Sintonizar Farol</span>
          </button>
        )}
      </div>
    </div>
  );
}
