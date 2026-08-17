"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { v4 as uuidv4 } from "uuid";
import confetti from "canvas-confetti";
import { CURATED_CATEGORIES, CuratedCategory } from "@/lib/curated-affirmations";

export type AccentColor = "amber" | "mint" | "pink";
export type SignalSource = "curated" | "ai" | "mixed";

export interface SignalItem {
  id: string;
  text: string;
  categoryKey: string | null;
  source: "curated" | "ai" | string;
  isFavorite: boolean;
}

export interface UserProfile {
  mood?: string;
  obstacles?: string[];
  desiredFeeling?: string;
  goalText?: string;
  category: string;
}

export interface ScheduleItem {
  id?: string;
  time: string;
  label?: string | null;
}

export interface CheckInItem {
  id: string;
  date: string;
  timestamp: string;
}

interface FarolContextType {
  deviceId: string;
  isOnboarded: boolean;
  isLoading: boolean;
  accentColor: AccentColor;
  signalSource: SignalSource;
  activeCategory: string;
  activeSignal: SignalItem | null;
  signalsPool: SignalItem[];
  isDecoding: boolean;
  isSpeaking: boolean;
  streak: number;
  checkedInToday: boolean;
  checkIns: CheckInItem[];
  userProfile: UserProfile | null;
  schedules: ScheduleItem[];
  nextTransmission: string | null;
  pushStatus: NotificationPermission | "unsupported";
  isPushSubscribed: boolean;
  isOnline: boolean;

  // Actions
  setAccentColor: (color: AccentColor) => void;
  setSignalSource: (source: SignalSource) => void;
  setActiveCategory: (cat: string) => void;
  cycleNewSignal: () => void;
  checkIn: () => Promise<{ success: boolean; alreadyCheckedIn?: boolean }>;
  toggleFavorite: (signalId: string) => Promise<void>;
  speakActiveSignal: () => void;
  stopSpeaking: () => void;
  completeOnboarding: (data: {
    mood: string;
    category: string;
    obstacles: string[];
    desiredFeeling: string;
    goalText: string;
    schedules: string[];
  }) => Promise<void>;
  subscribeToPush: () => Promise<boolean>;
  sendTestPush: () => Promise<boolean>;
  addSchedule: (time: string, label?: string) => Promise<void>;
  removeSchedule: (id: string) => Promise<void>;
  reloadSignals: () => Promise<void>;
  resetAccount: () => void;
}

const FarolContext = createContext<FarolContextType | null>(null);

export function FarolProvider({ children }: { children: React.ReactNode }) {
  const [deviceId, setDeviceId] = useState<string>("");
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [accentColor, setAccentColorState] = useState<AccentColor>("amber");
  const [signalSource, setSignalSourceState] = useState<SignalSource>("mixed");
  const [activeCategory, setActiveCategoryState] = useState<string>("foco");
  const [activeSignal, setActiveSignal] = useState<SignalItem | null>(null);
  const [signalsPool, setSignalsPool] = useState<SignalItem[]>([]);
  const [isDecoding, setIsDecoding] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);
  const [checkedInToday, setCheckedInToday] = useState<boolean>(false);
  const [checkIns, setCheckIns] = useState<CheckInItem[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([
    { time: "08:00", label: "Manhã" },
    { time: "14:00", label: "Tarde" },
    { time: "21:00", label: "Noite" },
  ]);
  const [nextTransmission, setNextTransmission] = useState<string | null>(null);
  const [pushStatus, setPushStatus] = useState<NotificationPermission | "unsupported">("default");
  const [isPushSubscribed, setIsPushSubscribed] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Apply accent color to HTML attribute
  const applyAccentColor = useCallback((color: AccentColor) => {
    setAccentColorState(color);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-accent", color);
      localStorage.setItem("farol_accent", color);
    }
  }, []);

  // Compute next transmission time
  const computeNextTransmission = useCallback((scheds: ScheduleItem[]) => {
    if (!scheds || scheds.length === 0) {
      setNextTransmission(null);
      return;
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const sortedTimes = [...scheds]
      .map((s) => {
        const [h, m] = s.time.split(":").map(Number);
        return {
          original: s.time,
          label: s.label,
          minutes: h * 60 + m,
        };
      })
      .sort((a, b) => a.minutes - b.minutes);

    const nextUpcoming = sortedTimes.find((t) => t.minutes > currentMinutes);

    if (nextUpcoming) {
      setNextTransmission(nextUpcoming.original);
    } else if (sortedTimes.length > 0) {
      // First one tomorrow
      setNextTransmission(sortedTimes[0].original);
    }
  }, []);

  // Fetch signals pool
  const fetchSignals = useCallback(
    async (devId: string, category: string, src: SignalSource) => {
      try {
        const res = await fetch(
          `/api/signals?deviceId=${devId}&category=${category}&source=${src}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.signals && data.signals.length > 0) {
            setSignalsPool(data.signals);

            // Set first signal with decode animation if none or changed
            setIsDecoding(true);
            const randomIndex = Math.floor(Math.random() * data.signals.length);
            setActiveSignal(data.signals[randomIndex]);
            setTimeout(() => setIsDecoding(false), 500);
          }
        }
      } catch (err) {
        console.warn("Falha ao buscar sinais, usando fallback local:", err);
        const catObj = CURATED_CATEGORIES[category] || CURATED_CATEGORIES["foco"];
        const fallbackSignals: SignalItem[] = catObj.affirmations.map(
          (text, i) => ({
            id: `fallback-${category}-${i}`,
            text,
            categoryKey: category,
            source: "curated",
            isFavorite: false,
          })
        );
        setSignalsPool(fallbackSignals);
        setActiveSignal(fallbackSignals[0]);
      }
    },
    []
  );

  // Initialize Client App State
  useEffect(() => {
    // Online / Offline listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("Farol Service Worker registrado com sucesso:", reg.scope))
        .catch((err) => console.warn("Falha no registro do Service Worker:", err));
    }

    // Check Push Status
    if ("Notification" in window) {
      setPushStatus(Notification.permission);
    } else {
      setPushStatus("unsupported");
    }

    // Get or Create Device ID
    let currentDeviceId = localStorage.getItem("farol_device_id");
    if (!currentDeviceId) {
      currentDeviceId = uuidv4();
      localStorage.setItem("farol_device_id", currentDeviceId);
    }
    setDeviceId(currentDeviceId);

    // Saved Accent
    const savedAccent = (localStorage.getItem("farol_accent") as AccentColor) || "amber";
    applyAccentColor(savedAccent);

    // Fetch user from DB
    const initUser = async () => {
      try {
        const res = await fetch(`/api/user?deviceId=${currentDeviceId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            const u = data.user;
            setStreak(u.streak || 0);
            setCheckedInToday(!!u.checkedInToday);
            setCheckIns(u.checkIns || []);
            if (u.accentColor) applyAccentColor(u.accentColor);
            if (u.signalSource) setSignalSourceState(u.signalSource);

            if (u.profile) {
              const parsedProfile: UserProfile = {
                mood: u.profile.mood,
                obstacles: u.profile.obstacles ? JSON.parse(u.profile.obstacles) : [],
                desiredFeeling: u.profile.desiredFeeling,
                goalText: u.profile.goalText,
                category: u.profile.category || "foco",
              };
              setUserProfile(parsedProfile);
              setActiveCategoryState(parsedProfile.category);
              setIsOnboarded(true);
            }

            if (u.scheduleTimes && u.scheduleTimes.length > 0) {
              setSchedules(u.scheduleTimes);
              computeNextTransmission(u.scheduleTimes);
            }

            // Load signals
            await fetchSignals(
              currentDeviceId!,
              u.profile?.category || "foco",
              u.signalSource || "mixed"
            );
          } else {
            // Check local storage for offline onboarding fallback
            const localOnboarded = localStorage.getItem("farol_onboarded");
            if (localOnboarded === "true") {
              setIsOnboarded(true);
            }
            await fetchSignals(currentDeviceId!, "foco", "mixed");
          }
        }
      } catch (e) {
        console.warn("Erro ao carregar dados do usuário:", e);
        await fetchSignals(currentDeviceId!, "foco", "mixed");
      } finally {
        setIsLoading(false);
      }
    };

    initUser();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [applyAccentColor, computeNextTransmission, fetchSignals]);

  // Cycle to a new random signal from pool
  const cycleNewSignal = useCallback(() => {
    if (signalsPool.length === 0) return;
    setIsDecoding(true);
    let nextIdx = Math.floor(Math.random() * signalsPool.length);
    if (signalsPool.length > 1 && activeSignal) {
      while (signalsPool[nextIdx]?.id === activeSignal.id) {
        nextIdx = Math.floor(Math.random() * signalsPool.length);
      }
    }
    setActiveSignal(signalsPool[nextIdx]);
    setTimeout(() => setIsDecoding(false), 450);
  }, [signalsPool, activeSignal]);

  // Check In action
  const checkIn = useCallback(async () => {
    if (!deviceId) return { success: false };

    try {
      const res = await fetch("/api/signals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "checkin",
          deviceId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCheckedInToday(true);
        setStreak(data.streak);

        const todayStr = new Date().toISOString().split("T")[0];
        setCheckIns((prev) => [
          { id: `checkin-${Date.now()}`, date: todayStr, timestamp: new Date().toISOString() },
          ...prev.filter((c) => c.date !== todayStr),
        ]);

        // Trigger celebratory visual confetti
        try {
          const accentHex =
            accentColor === "mint"
              ? "#7FE7C4"
              : accentColor === "pink"
              ? "#F2879A"
              : "#F2A65A";

          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.8 },
            colors: [accentHex, "#ECEFF3", "#1D2A38"],
            disableForReducedMotion: true,
          });
        } catch {
          // ignore confetti errors
        }

        return { success: true, alreadyCheckedIn: data.alreadyCheckedIn };
      }
      return { success: false };
    } catch (e) {
      console.error("Erro ao realizar check-in:", e);
      return { success: false };
    }
  }, [deviceId, accentColor]);

  // Toggle favorite
  const toggleFavorite = useCallback(
    async (signalId: string) => {
      if (!activeSignal) return;

      const newFav = !activeSignal.isFavorite;
      setActiveSignal((prev) => (prev ? { ...prev, isFavorite: newFav } : null));
      setSignalsPool((prev) =>
        prev.map((s) => (s.id === signalId ? { ...s, isFavorite: newFav } : s))
      );

      try {
        await fetch("/api/signals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "favorite",
            deviceId,
            affirmationId: signalId,
            isFavorite: newFav,
          }),
        });
      } catch (e) {
        console.warn("Erro ao favoritar no backend:", e);
      }
    },
    [activeSignal, deviceId]
  );

  // Web Speech API (TTS)
  const speakActiveSignal = useCallback(() => {
    if (!activeSignal || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel(); // clear queue

    const utterance = new SpeechSynthesisUtterance(activeSignal.text);
    utterance.lang = "pt-BR";
    utterance.rate = 0.94; // slightly slower, measured cadence
    utterance.pitch = 0.90; // steady, slightly robotic tone

    // Try to find a good PT-BR voice
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(
      (v) =>
        v.lang === "pt-BR" ||
        v.lang.startsWith("pt") ||
        v.name.includes("Portuguese") ||
        v.name.includes("Brasil")
    );
    if (ptVoice) {
      utterance.voice = ptVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [activeSignal, isSpeaking]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Complete Onboarding
  const completeOnboarding = useCallback(
    async (data: {
      mood: string;
      category: string;
      obstacles: string[];
      desiredFeeling: string;
      goalText: string;
      schedules: string[];
    }) => {
      setIsLoading(true);
      try {
        const formattedProfile: UserProfile = {
          mood: data.mood,
          category: data.category,
          obstacles: data.obstacles,
          desiredFeeling: data.desiredFeeling,
          goalText: data.goalText,
        };

        const scheduleObjects = data.schedules.map((time) => ({
          time,
          label:
            time === "08:00"
              ? "Manhã"
              : time === "14:00"
              ? "Tarde"
              : time === "21:00"
              ? "Noite"
              : "Transmissão",
        }));

        // 1. Save User Profile to SQLite
        await fetch("/api/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deviceId,
            accentColor,
            signalSource: "mixed",
            profile: formattedProfile,
            scheduleTimes: scheduleObjects,
          }),
        });

        // 2. Trigger initial batch generation via AI backend
        try {
          await fetch("/api/ai/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              deviceId,
              category: data.category,
              mood: data.mood,
              obstacles: data.obstacles,
              desiredFeeling: data.desiredFeeling,
              customIntent: data.goalText,
            }),
          });
        } catch (genErr) {
          console.warn("Aviso na geração inicial de IA:", genErr);
        }

        setUserProfile(formattedProfile);
        setActiveCategoryState(data.category);
        setSchedules(scheduleObjects);
        computeNextTransmission(scheduleObjects);
        localStorage.setItem("farol_onboarded", "true");
        setIsOnboarded(true);

        // Fetch refreshed signal pool
        await fetchSignals(deviceId, data.category, "mixed");
      } catch (err) {
        console.error("Erro ao finalizar onboarding:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [deviceId, accentColor, computeNextTransmission, fetchSignals]
  );

  // Web Push Subscription
  const subscribeToPush = useCallback(async () => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("Notificações Push não são suportadas por este navegador.");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPushStatus(permission);

      if (permission !== "granted") {
        return false;
      }

      // Fetch public VAPID key
      const keyRes = await fetch("/api/push/public-key");
      const { publicKey } = await keyRes.json();

      if (!publicKey) {
        throw new Error("Chave pública VAPID não configurada no servidor.");
      }

      const registration = await navigator.serviceWorker.ready;

      // Convert VAPID key to Uint8Array
      const rawData = window.atob(
        publicKey.replace(/-/g, "+").replace(/_/g, "/")
      );
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: outputArray,
      });

      // Send to server
      const subRes = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId,
          subscription: subscription.toJSON(),
        }),
      });

      if (subRes.ok) {
        setIsPushSubscribed(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Erro ao se inscrever no Web Push:", err);
      return false;
    }
  }, [deviceId]);

  // Send Test Push
  const sendTestPush = useCallback(async () => {
    try {
      const res = await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId,
          signalText: activeSignal?.text,
          categoryName: CURATED_CATEGORIES[activeCategory]?.name || "Sinal Farol",
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }, [deviceId, activeSignal, activeCategory]);

  // Add schedule
  const addSchedule = useCallback(
    async (time: string, label?: string) => {
      const newSchedules = [...schedules, { time, label: label || "Customizado" }];
      setSchedules(newSchedules);
      computeNextTransmission(newSchedules);

      try {
        await fetch("/api/schedule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deviceId, time, label }),
        });
      } catch (err) {
        console.warn("Erro ao salvar horário:", err);
      }
    },
    [deviceId, schedules, computeNextTransmission]
  );

  // Remove schedule
  const removeSchedule = useCallback(
    async (idOrTime: string) => {
      const updated = schedules.filter((s) => s.id !== idOrTime && s.time !== idOrTime);
      setSchedules(updated);
      computeNextTransmission(updated);

      try {
        await fetch(`/api/schedule?deviceId=${deviceId}&id=${idOrTime}`, {
          method: "DELETE",
        });
      } catch (err) {
        console.warn("Erro ao remover horário:", err);
      }
    },
    [deviceId, schedules, computeNextTransmission]
  );

  // Set active category
  const setActiveCategory = useCallback(
    (cat: string) => {
      setActiveCategoryState(cat);
      fetchSignals(deviceId, cat, signalSource);
    },
    [deviceId, signalSource, fetchSignals]
  );

  // Set signal source
  const setSignalSource = useCallback(
    (src: SignalSource) => {
      setSignalSourceState(src);
      fetchSignals(deviceId, activeCategory, src);
      fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, signalSource: src }),
      }).catch(() => {});
    },
    [deviceId, activeCategory, fetchSignals]
  );

  // Set accent color
  const setAccentColor = useCallback(
    (color: AccentColor) => {
      applyAccentColor(color);
      fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, accentColor: color }),
      }).catch(() => {});
    },
    [deviceId, applyAccentColor]
  );

  // Reload signals
  const reloadSignals = useCallback(async () => {
    await fetchSignals(deviceId, activeCategory, signalSource);
  }, [deviceId, activeCategory, signalSource, fetchSignals]);

  // Reset account & local data
  const resetAccount = useCallback(() => {
    localStorage.clear();
    window.location.reload();
  }, []);

  return (
    <FarolContext.Provider
      value={{
        deviceId,
        isOnboarded,
        isLoading,
        accentColor,
        signalSource,
        activeCategory,
        activeSignal,
        signalsPool,
        isDecoding,
        isSpeaking,
        streak,
        checkedInToday,
        checkIns,
        userProfile,
        schedules,
        nextTransmission,
        pushStatus,
        isPushSubscribed,
        isOnline,
        setAccentColor,
        setSignalSource,
        setActiveCategory,
        cycleNewSignal,
        checkIn,
        toggleFavorite,
        speakActiveSignal,
        stopSpeaking,
        completeOnboarding,
        subscribeToPush,
        sendTestPush,
        addSchedule,
        removeSchedule,
        reloadSignals,
        resetAccount,
      }}
    >
      {children}
    </FarolContext.Provider>
  );
}

export function useFarol() {
  const context = useContext(FarolContext);
  if (!context) {
    throw new Error("useFarol must be used within a FarolProvider");
  }
  return context;
}
