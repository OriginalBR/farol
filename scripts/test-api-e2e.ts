import { v4 as uuidv4 } from "uuid";

const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("==================================================");
  console.log("📡 FAROL — TESTES END-TO-END DE INTEGRAÇÃO");
  console.log("==================================================");

  const testDeviceId = `test-farol-${Date.now()}`;
  let passed = 0;
  let failed = 0;

  async function assert(name: string, fn: () => Promise<boolean | void>) {
    try {
      const result = await fn();
      if (result === false) {
        console.error(`❌ FALHA: ${name}`);
        failed++;
      } else {
        console.log(`✅ SUCESSO: ${name}`);
        passed++;
      }
    } catch (e: any) {
      console.error(`❌ ERRO: ${name} ->`, e.message || e);
      failed++;
    }
  }

  // 1. Root & Static Files
  await assert("GET / (HTML principal)", async () => {
    const res = await fetch(`${BASE_URL}/`);
    if (!res.ok) return false;
    const text = await res.text();
    return text.includes("Farol") || text.includes("html");
  });

  await assert("GET /manifest.json (PWA Manifest)", async () => {
    const res = await fetch(`${BASE_URL}/manifest.json`);
    if (!res.ok) return false;
    const json = await res.json();
    return json.short_name === "Farol" && json.display === "standalone";
  });

  await assert("GET /sw.js (Service Worker)", async () => {
    const res = await fetch(`${BASE_URL}/sw.js`);
    if (!res.ok) return false;
    const text = await res.text();
    return text.includes("farol-signal") && text.includes("notificationclick");
  });

  // 2. User & Profile API
  await assert("POST /api/user (Criar usuário e perfil de onboarding)", async () => {
    const res = await fetch(`${BASE_URL}/api/user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId: testDeviceId,
        accentColor: "mint",
        signalSource: "mixed",
        profile: {
          mood: "impulso",
          category: "foco",
          obstacles: ["Procrastinação em tarefas-chave", "Autocobrança excessiva"],
          desiredFeeling: "clareza",
          goalText: "Executar prioridades diárias com foco inabalável",
        },
        scheduleTimes: [
          { time: "08:00", label: "Manhã" },
          { time: "14:00", label: "Tarde" },
          { time: "21:00", label: "Noite" },
        ],
      }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return (
      data.user?.deviceId === testDeviceId &&
      data.user?.accentColor === "mint" &&
      data.user?.profile?.category === "foco"
    );
  });

  await assert("GET /api/user (Recuperar dados persistidos)", async () => {
    const res = await fetch(`${BASE_URL}/api/user?deviceId=${testDeviceId}`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.user?.profile?.desiredFeeling === "clareza";
  });

  // 3. Signals API
  let activeSignalId = "";
  await assert("GET /api/signals (Buscar pool de sinais curados e IA)", async () => {
    const res = await fetch(`${BASE_URL}/api/signals?deviceId=${testDeviceId}&category=foco&source=mixed`);
    if (!res.ok) return false;
    const data = await res.json();
    if (data.signals && data.signals.length > 0) {
      activeSignalId = data.signals[0].id;
      return true;
    }
    return false;
  });

  // 4. Check-in & Streak
  await assert("POST /api/signals (Realizar Check-in diário e calcular streak)", async () => {
    const res = await fetch(`${BASE_URL}/api/signals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "checkin",
        deviceId: testDeviceId,
      }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.success === true && data.streak === 1;
  });

  // 5. Toggle Favorite
  await assert("POST /api/signals (Favoritar sinal)", async () => {
    if (!activeSignalId) return true;
    const res = await fetch(`${BASE_URL}/api/signals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "favorite",
        deviceId: testDeviceId,
        affirmationId: activeSignalId,
        isFavorite: true,
      }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.success === true;
  });

  // 6. AI Generator API
  await assert("POST /api/ai/generate (Gerar lote de 6 afirmações robóticas)", async () => {
    const res = await fetch(`${BASE_URL}/api/ai/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId: testDeviceId,
        customIntent: "Concluir as tarefas com velocidade e sem distrações",
        desiredFeeling: "foco",
        category: "foco",
        mood: "impulso",
        obstacles: ["Procrastinação"],
      }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.affirmations && data.affirmations.length === 6;
  });

  // 7. Journal API
  let createdEntryId = "";
  await assert("POST /api/journal (Registrar reflexão diária)", async () => {
    const res = await fetch(`${BASE_URL}/api/journal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId: testDeviceId,
        text: "Hoje mantive foco na prioridade 1 durante a manhã inteira.",
        linkedAffirmationId: activeSignalId || null,
      }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.entry?.id) {
      createdEntryId = data.entry.id;
      return true;
    }
    return false;
  });

  await assert("GET /api/journal (Listar entradas do diário com busca)", async () => {
    const res = await fetch(`${BASE_URL}/api/journal?deviceId=${testDeviceId}&search=prioridade`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.entries && data.entries.length > 0;
  });

  // 8. Push VAPID Public Key
  await assert("GET /api/push/public-key (Obter chave pública VAPID)", async () => {
    const res = await fetch(`${BASE_URL}/api/push/public-key`);
    if (!res.ok) return false;
    const data = await res.json();
    return typeof data.publicKey === "string" && data.publicKey.length > 20;
  });

  // 9. Schedule API
  await assert("POST /api/schedule (Adicionar horário customizado)", async () => {
    const res = await fetch(`${BASE_URL}/api/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId: testDeviceId,
        time: "17:30",
        label: "Fim de Tarde",
      }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.schedule?.time === "17:30";
  });

  console.log("==================================================");
  console.log(`🏁 RESULTADOS: ${passed} PASSARAM | ${failed} FALHARAM`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
