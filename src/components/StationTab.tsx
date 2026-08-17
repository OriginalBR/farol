"use client";

import React, { useState } from "react";
import { useFarol, AccentColor, SignalSource } from "@/context/FarolContext";
import HeatmapGrid from "./HeatmapGrid";
import {
  Settings,
  Bell,
  Clock,
  Palette,
  Sliders,
  Download,
  Trash2,
  Check,
  Send,
  Plus,
  Flame,
  Award,
  Radio,
  Sparkles,
} from "lucide-react";

export default function StationTab() {
  const {
    deviceId,
    accentColor,
    setAccentColor,
    signalSource,
    setSignalSource,
    schedules,
    addSchedule,
    removeSchedule,
    pushStatus,
    isPushSubscribed,
    subscribeToPush,
    sendTestPush,
    streak,
    checkIns,
    userProfile,
    resetAccount,
  } = useFarol();

  const [newTime, setNewTime] = useState("08:00");
  const [newLabel, setNewLabel] = useState("Manhã");
  const [isPushLoading, setIsPushLoading] = useState(false);
  const [testPushStatus, setTestPushStatus] = useState<string | null>(null);

  const colors: Array<{ id: AccentColor; name: string; hex: string }> = [
    { id: "amber", name: "Âmbar Solar", hex: "#F2A65A" },
    { id: "mint", name: "Menta Cibernético", hex: "#7FE7C4" },
    { id: "pink", name: "Rosa Neon", hex: "#F2879A" },
  ];

  const milestones = [
    { days: 7, label: "Sinal Firme", desc: "Primeira semana de ancoragem" },
    { days: 30, label: "Reprogramação Ativa", desc: "Um mês de constância neuroplástica" },
    { days: 100, label: "Maestria de Frequência", desc: "Padrão mental consolidado" },
  ];

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTime) return;
    await addSchedule(newTime, newLabel);
  };

  const handleEnablePush = async () => {
    setIsPushLoading(true);
    const success = await subscribeToPush();
    setIsPushLoading(false);
    if (!success) {
      alert("Não foi possível ativar as notificações push. Verifique as permissões do navegador.");
    }
  };

  const handleTestPush = async () => {
    setTestPushStatus("Enviando...");
    const success = await sendTestPush();
    setTestPushStatus(success ? "Enviado com sucesso!" : "Falha no envio.");
    setTimeout(() => setTestPushStatus(null), 3000);
  };

  const handleExportData = async () => {
    try {
      const res = await fetch(`/api/user?deviceId=${deviceId}`);
      const userData = res.ok ? await res.json() : {};

      const journalRes = await fetch(`/api/journal?deviceId=${deviceId}`);
      const journalData = journalRes.ok ? await journalRes.json() : {};

      const fullExport = {
        exportDate: new Date().toISOString(),
        deviceId,
        user: userData.user,
        journal: journalData.entries,
      };

      const blob = new Blob([JSON.stringify(fullExport, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `farol-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Erro ao exportar dados:", e);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 pt-2 pb-24 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-[var(--accent)] font-mono-tech text-xs tracking-wider">
          <Settings className="w-4 h-4" />
          PAINEL DE CONTROLE // ESTAÇÃO FAROL
        </div>
        <h1 className="text-xl font-bold font-space text-[#ECEFF3]">
          Configurações e Consistência
        </h1>
        <p className="text-xs text-[#8FA0B0]">
          Gerencie a telemetria da estação, horários de transmissão e preferências.
        </p>
      </div>

      {/* Consistency Radar Heatmap */}
      <HeatmapGrid checkIns={checkIns} daysCount={28} />

      {/* Milestones Card */}
      <div className="rounded-2xl bg-[#16202C] border border-[#26333F] p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-mono-tech text-[#8FA0B0]">
          <span className="flex items-center gap-1.5 text-[#ECEFF3]">
            <Award className="w-4 h-4 text-[var(--accent)]" />
            MARCOS DE CONSTÂNCIA
          </span>
          <span className="text-[var(--accent)] font-semibold">{streak} DIAS ATIVOS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          {milestones.map((m) => {
            const isAchieved = streak >= m.days;
            return (
              <div
                key={m.days}
                className={`p-3 rounded-xl border flex flex-col gap-1 transition-all ${
                  isAchieved
                    ? "bg-[var(--accent-surface)] border-[var(--accent-border)] text-[#ECEFF3]"
                    : "bg-[#0E1520] border-[#26333F] text-[#52667A]"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono-tech">
                  <span className={isAchieved ? "text-[var(--accent)] font-bold" : ""}>
                    {m.days} DIAS
                  </span>
                  {isAchieved && <Check className="w-3.5 h-3.5 text-[var(--accent)]" />}
                </div>
                <span className="text-xs font-space font-bold">{m.label}</span>
                <span className="text-[10px] leading-tight opacity-80">{m.desc}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transmission Schedules Section */}
      <div className="rounded-2xl bg-[#16202C] border border-[#26333F] p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between text-xs font-mono-tech text-[#8FA0B0]">
          <span className="flex items-center gap-1.5 text-[#ECEFF3]">
            <Clock className="w-4 h-4 text-[var(--accent)]" />
            HORÁRIOS DE TRANSMISSÃO
          </span>
          <span>{schedules.length} PROGRAMADOS</span>
        </div>

        {/* Existing Schedules */}
        <div className="flex flex-wrap gap-2">
          {schedules.map((s) => (
            <div
              key={s.id || s.time}
              className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-[#0E1520] border border-[#26333F] text-xs font-mono-tech text-[#ECEFF3]"
            >
              <span className="text-[var(--accent)] font-bold">{s.time}</span>
              {s.label && <span className="text-[#8FA0B0]">({s.label})</span>}
              <button
                onClick={() => removeSchedule(s.id || s.time)}
                className="text-[#8FA0B0] hover:text-rose-400 p-0.5 ml-1 transition-colors"
                title="Remover horário"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Schedule Form */}
        <form onSubmit={handleAddSchedule} className="flex gap-2 pt-2 border-t border-[#26333F]">
          <input
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="p-2 rounded-xl bg-[#0E1520] border border-[#26333F] text-xs text-[#ECEFF3] font-mono-tech focus:outline-none focus:border-[var(--accent)]"
          />
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Rótulo (ex: Manhã)"
            className="flex-1 p-2 rounded-xl bg-[#0E1520] border border-[#26333F] text-xs text-[#ECEFF3] font-mono-tech focus:outline-none focus:border-[var(--accent)]"
          />
          <button
            type="submit"
            className="px-3 py-2 rounded-xl bg-[#1D2A38] hover:bg-[#243547] border border-[#37485A] text-[#ECEFF3] text-xs font-space font-semibold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar</span>
          </button>
        </form>
      </div>

      {/* Web Push Notifications */}
      <div className="rounded-2xl bg-[#16202C] border border-[#26333F] p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-mono-tech text-[#8FA0B0]">
          <span className="flex items-center gap-1.5 text-[#ECEFF3]">
            <Bell className="w-4 h-4 text-[var(--accent)]" />
            NOTIFICAÇÕES WEB PUSH (VAPID)
          </span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono-tech ${
              pushStatus === "granted"
                ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800"
                : "bg-[#0E1520] text-[#8FA0B0]"
            }`}
          >
            {pushStatus === "granted" ? "ATIVADO" : "NÃO ATIVADO"}
          </span>
        </div>

        <p className="text-xs text-[#8FA0B0] leading-relaxed">
          Receba sinais diretamente na tela do seu celular ou computador nos horários
          agendados, mesmo com o aplicativo fechado.
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {pushStatus !== "granted" ? (
            <button
              onClick={handleEnablePush}
              disabled={isPushLoading}
              className="py-2.5 px-4 rounded-xl bg-[var(--accent)] text-[#0E1520] font-space font-bold text-xs shadow-[0_0_12px_var(--accent-glow)] hover:opacity-95 transition-all"
            >
              {isPushLoading ? "Registrando no Navegador..." : "Ativar Notificações Push"}
            </button>
          ) : (
            <button
              onClick={handleTestPush}
              className="py-2 px-3 rounded-xl bg-[#1D2A38] hover:bg-[#243547] border border-[#37485A] text-[#ECEFF3] font-mono-tech text-xs flex items-center gap-1.5 transition-all"
            >
              <Send className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>{testPushStatus || "Testar Transmissão Imediata"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Visual Accent Theme Selector */}
      <div className="rounded-2xl bg-[#16202C] border border-[#26333F] p-4 flex flex-col gap-3">
        <div className="flex items-center gap-1.5 text-xs font-mono-tech text-[#ECEFF3]">
          <Palette className="w-4 h-4 text-[var(--accent)]" />
          COR DE DESTAQUE DO TRANSMISSOR
        </div>

        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {colors.map((c) => {
            const isSelected = accentColor === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setAccentColor(c.id)}
                className={`py-3 px-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  isSelected
                    ? "bg-[#1D2A38] border-[var(--accent)] shadow-[0_0_12px_var(--accent-glow)]"
                    : "bg-[#0E1520] border-[#26333F] hover:border-[#37485A]"
                }`}
              >
                <span
                  className="w-5 h-5 rounded-full shadow-md"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="text-[11px] font-space font-medium text-[#ECEFF3]">
                  {c.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Signal Source Selector */}
      <div className="rounded-2xl bg-[#16202C] border border-[#26333F] p-4 flex flex-col gap-3">
        <div className="flex items-center gap-1.5 text-xs font-mono-tech text-[#ECEFF3]">
          <Sliders className="w-4 h-4 text-[var(--accent)]" />
          FONTE PRIMÁRIA DE SINAIS
        </div>

        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { id: "mixed", label: "Misto", desc: "Curado + IA" },
              { id: "curated", label: "Banco Curado", desc: "8 Frequências" },
              { id: "ai", label: "Apenas IA", desc: "Pool Pessoal" },
            ] as const
          ).map((src) => {
            const isSelected = signalSource === src.id;
            return (
              <button
                key={src.id}
                onClick={() => setSignalSource(src.id as SignalSource)}
                className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                  isSelected
                    ? "bg-[var(--accent-surface)] border-[var(--accent-border)] text-[var(--accent)]"
                    : "bg-[#0E1520] border-[#26333F] text-[#8FA0B0] hover:border-[#37485A]"
                }`}
              >
                <span className="text-xs font-space font-bold">{src.label}</span>
                <span className="text-[10px] opacity-75">{src.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Export & Data Management */}
      <div className="rounded-2xl bg-[#16202C] border border-[#26333F] p-4 flex flex-col gap-3">
        <div className="text-xs font-mono-tech text-[#ECEFF3]">
          GESTÃO DE DADOS & PRIVACIDADE
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <button
            onClick={handleExportData}
            className="flex-1 py-2.5 px-3 rounded-xl bg-[#1D2A38] hover:bg-[#243547] border border-[#37485A] text-[#ECEFF3] text-xs font-space font-medium flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-[var(--accent)]" />
            <span>Exportar Diário (JSON)</span>
          </button>

          <button
            onClick={() => {
              if (
                confirm(
                  "Tem certeza que deseja apagar todos os dados locais e reiniciar o Farol?"
                )
              ) {
                resetAccount();
              }
            }}
            className="py-2.5 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900 text-rose-300 text-xs font-space font-medium flex items-center justify-center gap-2 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Limpar Dados Locais</span>
          </button>
        </div>
      </div>

      {/* Device Telemetry Readout */}
      <div className="text-[10px] font-mono-tech text-[#52667A] text-center flex flex-col gap-0.5">
        <span>DEVICE ID: {deviceId || "ANON-STATION"}</span>
        <span>FAROL TRANSMITTER ENGINE v1.0 // NO PAYWALL // NO TRACKING</span>
      </div>
    </div>
  );
}
