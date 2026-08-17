"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useFarol } from "@/context/FarolContext";
import {
  BookOpen,
  Plus,
  Search,
  Trash2,
  Bookmark,
  Calendar,
  Send,
  Radio,
  FileText,
} from "lucide-react";

interface JournalEntryItem {
  id: string;
  date: string;
  text: string;
  linkedAffirmation?: {
    id: string;
    text: string;
  } | null;
  createdAt: string;
}

export default function JournalTab() {
  const { deviceId, activeSignal } = useFarol();
  const [entries, setEntries] = useState<JournalEntryItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [linkCurrentSignal, setLinkCurrentSignal] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEntries = useCallback(
    async (query = "") => {
      if (!deviceId) return;
      try {
        const res = await fetch(
          `/api/journal?deviceId=${deviceId}&search=${encodeURIComponent(query)}`
        );
        if (res.ok) {
          const data = await res.json();
          setEntries(data.entries || []);
        }
      } catch (err) {
        console.warn("Erro ao buscar entradas do diário:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [deviceId]
  );

  useEffect(() => {
    fetchEntries(searchQuery);
  }, [fetchEntries, searchQuery]);

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSaving) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId,
          text: inputText.trim(),
          date: new Date().toISOString().split("T")[0],
          linkedAffirmationId:
            linkCurrentSignal && activeSignal ? activeSignal.id : null,
        }),
      });

      if (res.ok) {
        setInputText("");
        await fetchEntries(searchQuery);
      }
    } catch (err) {
      console.error("Erro ao salvar diário:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/journal?deviceId=${deviceId}&id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setEntries((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error("Erro ao excluir entrada:", err);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split("-");
      return `${d}/${m}/${y}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 pt-2 pb-24 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-[var(--accent)] font-mono-tech text-xs tracking-wider">
          <BookOpen className="w-4 h-4" />
          DIÁRIO DE BORDO // REGISTRO DE LUCIDEZ
        </div>
        <h1 className="text-xl font-bold font-space text-[#ECEFF3]">
          Reflexões e Padrões Observados
        </h1>
        <p className="text-xs text-[#8FA0B0] leading-relaxed">
          Registre como o sinal operou na sua mente hoje. Acompanhe a mudança de
          narrativa interna com o passar dos dias.
        </p>
      </div>

      {/* New Entry Form */}
      <form
        onSubmit={handleSaveEntry}
        className="rounded-2xl bg-[#16202C] border border-[#26333F] p-4 flex flex-col gap-3 shadow-lg"
      >
        <div className="flex items-center justify-between text-xs font-mono-tech text-[#8FA0B0]">
          <span className="text-[#ECEFF3] flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[var(--accent)]" />
            HOJE // {formatDate(new Date().toISOString().split("T")[0])}
          </span>

          {activeSignal && (
            <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px] text-[var(--accent)] hover:underline">
              <input
                type="checkbox"
                checked={linkCurrentSignal}
                onChange={(e) => setLinkCurrentSignal(e.target.checked)}
                className="rounded accent-[var(--accent)]"
              />
              <span>Vincular ao sinal ativo</span>
            </label>
          )}
        </div>

        {linkCurrentSignal && activeSignal && (
          <div className="p-2.5 rounded-lg bg-[#1D2A38] border border-[#26333F] text-xs font-fraunces italic text-[#8FA0B0] leading-relaxed truncate">
            Sinal vinculado: "{activeSignal.text}"
          </div>
        )}

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="O que você observou na sua execução hoje? Quais pensamentos automáticos foram interrompidos?"
          rows={3}
          className="w-full p-3 rounded-xl bg-[#0E1520] border border-[#26333F] text-sm text-[#ECEFF3] placeholder-[#52667A] focus:outline-none focus:border-[var(--accent)] resize-none"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!inputText.trim() || isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] hover:opacity-95 text-[#0E1520] font-space font-bold text-xs shadow-[0_0_12px_var(--accent-glow)] transition-all cursor-pointer disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSaving ? "Gravando..." : "Gravar Reflexão"}</span>
          </button>
        </div>
      </form>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#8FA0B0] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar no diário..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#16202C] border border-[#26333F] text-xs text-[#ECEFF3] placeholder-[#52667A] focus:outline-none focus:border-[var(--accent)] font-mono-tech"
        />
      </div>

      {/* Entries List */}
      <div className="flex flex-col gap-3">
        {isLoading ? (
          <div className="text-center py-8 text-xs font-mono-tech text-[#8FA0B0]">
            CARREGANDO DIÁRIO DE TRANSMISSÕES...
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-[#16202C]/40 border border-dashed border-[#26333F] gap-2 text-center">
            <FileText className="w-8 h-8 text-[#52667A]" />
            <p className="font-space text-sm text-[#ECEFF3]">
              Nenhuma reflexão registrada ainda
            </p>
            <p className="text-xs text-[#8FA0B0] max-w-xs">
              Use o campo acima para gravar insights e acompanhar a constância mental do Farol.
            </p>
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-2xl bg-[#16202C] border border-[#26333F] p-4 flex flex-col gap-3 hover:border-[#37485A] transition-all"
            >
              <div className="flex items-center justify-between text-[11px] font-mono-tech text-[#8FA0B0]">
                <span className="flex items-center gap-1.5 text-[var(--accent)] font-semibold">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(entry.date)}
                </span>

                <button
                  onClick={() => handleDelete(entry.id)}
                  className="p-1 rounded text-[#8FA0B0] hover:text-rose-400 transition-colors"
                  title="Excluir entrada"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-sm text-[#ECEFF3] leading-relaxed whitespace-pre-wrap">
                {entry.text}
              </p>

              {entry.linkedAffirmation && (
                <div className="pt-2 border-t border-[#26333F]/70 flex items-start gap-2">
                  <Bookmark className="w-3.5 h-3.5 text-[var(--accent)] mt-0.5 shrink-0" />
                  <p className="text-xs font-fraunces italic text-[#8FA0B0]">
                    "{entry.linkedAffirmation.text}"
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
