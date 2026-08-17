import { NextRequest, NextResponse } from "next/server";
import { Anthropic } from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

// Algorithmic fallback generator tailored to the exact robotic style
function generateAlgorithmicFallbacks(
  intent: string,
  feeling: string,
  mood: string,
  obstacles: string[] = []
): string[] {
  const cleanIntent = intent?.trim() || "foco e clareza de execução";
  const targetFeeling = feeling || "clareza";
  const obstacleText = obstacles.length > 0 ? obstacles[0].toLowerCase() : "distrações";

  const templates = [
    `Direciono minha atenção para ${cleanIntent} sem abrir espaço para ${obstacleText}.`,
    `Minha mente sustenta ${targetFeeling} e descarta ruídos imediatos com firmeza.`,
    `Executo minhas ações diárias com método, constância e foco deliberado.`,
    `Rejeito a hesitação e opero com precisão diante de cada demanda.`,
    `Minha capacidade de realização permanece inabalável perante qualquer pressão.`,
    `Ancoro meu ritmo no presente e concluo o que decidi priorizar.`,
  ];

  return templates;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      deviceId,
      customIntent,
      desiredFeeling,
      category,
      mood,
      obstacles,
      apiKeyOverride,
    } = body;

    // Retrieve user & profile if deviceId is provided
    let user = null;
    if (deviceId) {
      user = await prisma.user.findUnique({
        where: { deviceId },
        include: { profile: true },
      });
    }

    const activeProfile = user?.profile;
    const finalFeeling = desiredFeeling || activeProfile?.desiredFeeling || "clareza";
    const finalMood = mood || activeProfile?.mood || "transição";
    const rawObstacles = obstacles || (activeProfile?.obstacles ? JSON.parse(activeProfile.obstacles) : []);
    const finalCategory = category || activeProfile?.category || "foco";
    const finalIntent = customIntent || activeProfile?.goalText || "";

    const apiKey = apiKeyOverride || process.env.ANTHROPIC_API_KEY;
    const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

    let affirmations: string[] = [];

    if (apiKey && apiKey.trim() !== "") {
      try {
        const anthropic = new Anthropic({ apiKey });

        const systemPrompt = `Você é o motor central de transmissões do Farol, uma estação transmissora de afirmações diárias para reprogramação mental.
Sua função é gerar sinais mentais diretos, íntimos e levemente futuristas no formato de "afirmações robóticas".

DIRETRIZES FUNDAMENTAIS DE ESTILO:
1. SEMPRE em primeira pessoa do singular ("Eu...", "Minha mente...", "Executo...", "Decido...", "Mantenho...", "Habito...").
2. SEMPRE no tempo presente.
3. SEM exclamações (nunca use o caractere '!').
4. SEM emojis.
5. SEM clichês de autoajuda ou frases motivacionais efusivas (proibido usar termos como "luz do universo", "você consegue tudo", "abrace sua essência").
6. Seja declarativo, sóbrio, cirúrgico, quase um comando calmo que a mente aceita sem resistência.
7. Máximo de 18 palavras por afirmação.
8. Idioma: Português do Brasil (pt-BR).

FORMATO DE RESPOSTA OBRIGATÓRIO:
Responda EXCLUSIVAMENTE com um JSON array de 6 strings. Não adicione texto antes ou depois, sem markdown fences, apenas o array JSON válido.
Exemplo:
["Executo minha prioridade antes de qualquer distração.", "Minha atenção permanece ancorada no que posso controlar.", "Rejeito cobranças irreais e mantenho meu ritmo constante.", "Decido sem hesitação retroativa.", "Minha presença é firme e segura.", "Concluo cada ciclo com método e clareza."]`;

        const userPrompt = `Gere 6 afirmações robóticas com o seguinte contexto do usuário:
- Área de foco/frequência: ${finalCategory}
- Momento emocional atual: ${finalMood}
- Obstáculos a dissolver: ${rawObstacles.join(", ") || "autocobrança, cansaço"}
- Sensação-alvo desejada: ${finalFeeling}
- Intenção ou objetivo específico: ${finalIntent || "Manter consistência diária e foco inabalável"}`;

        const response = await anthropic.messages.create({
          model,
          max_tokens: 500,
          temperature: 0.7,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        });

        const textContent = response.content[0].type === "text" ? response.content[0].text : "";
        const cleanJson = textContent.replace(/```json/g, "").replace(/```/g, "").trim();

        try {
          const parsed = JSON.parse(cleanJson);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Sanitize affirmations (strip exclamation marks, enforce max length)
            affirmations = parsed
              .map((str: any) => String(str).replace(/!/g, ".").trim())
              .filter((str: string) => str.length > 0)
              .slice(0, 6);
          }
        } catch (parseError) {
          console.warn("Falha ao parsear JSON da Anthropic, aplicando fallback:", parseError);
        }
      } catch (anthropicError) {
        console.warn("Erro na chamada Anthropic API, aplicando fallback silencioso:", anthropicError);
      }
    }

    // Fallback if AI wasn't called or returned empty
    if (!affirmations || affirmations.length === 0) {
      affirmations = generateAlgorithmicFallbacks(
        finalIntent,
        finalFeeling,
        finalMood,
        rawObstacles
      );
    }

    // Persist to user's personal pool if user exists
    let savedAffirmations: any[] = [];
    if (user && affirmations.length > 0) {
      // Save affirmations in SQLite
      const created = await Promise.all(
        affirmations.map((text) =>
          prisma.affirmation.create({
            data: {
              userId: user.id,
              source: "ai",
              categoryKey: finalCategory,
              text,
            },
          })
        )
      );
      savedAffirmations = created;
    } else {
      savedAffirmations = affirmations.map((text, idx) => ({
        id: `ai-gen-${Date.now()}-${idx}`,
        text,
        source: "ai",
        categoryKey: finalCategory,
        isFavorite: false,
        createdAt: new Date().toISOString(),
      }));
    }

    return NextResponse.json({
      success: true,
      source: apiKey ? "anthropic-claude" : "algorithmic-fallback",
      affirmations: savedAffirmations,
    });
  } catch (error) {
    console.error("Erro geral na geração de IA:", error);
    return NextResponse.json(
      { error: "Falha ao gerar afirmações" },
      { status: 500 }
    );
  }
}
