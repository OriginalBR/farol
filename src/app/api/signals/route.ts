import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ALL_CURATED_AFFIRMATIONS } from "@/lib/curated-affirmations";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const deviceId = searchParams.get("deviceId");
  const category = searchParams.get("category");
  const source = searchParams.get("source") || "mixed"; // "curated" | "ai" | "mixed"

  try {
    let user = null;
    if (deviceId) {
      user = await prisma.user.findUnique({
        where: { deviceId },
        include: { profile: true },
      });
    }

    const activeCategory = category || user?.profile?.category || "foco";

    let curatedList: Array<{
      id: string;
      text: string;
      categoryKey: string | null;
      source: string;
      isFavorite: boolean;
    }> = [];

    let userAiList: Array<{
      id: string;
      text: string;
      categoryKey: string | null;
      source: string;
      isFavorite: boolean;
    }> = [];

    // Fetch curated from DB (fallback to in-memory list if DB empty)
    if (source === "curated" || source === "mixed") {
      const dbCurated = await prisma.affirmation.findMany({
        where: {
          userId: null,
          source: "curated",
          ...(activeCategory ? { categoryKey: activeCategory } : {}),
        },
      });

      if (dbCurated.length > 0) {
        curatedList = dbCurated.map((a) => ({
          id: a.id,
          text: a.text,
          categoryKey: a.categoryKey,
          source: "curated",
          isFavorite: a.isFavorite,
        }));
      } else {
        // In-memory fallback
        const filtered = ALL_CURATED_AFFIRMATIONS.filter(
          (a) => !activeCategory || a.categoryKey === activeCategory
        );
        curatedList = (filtered.length > 0 ? filtered : ALL_CURATED_AFFIRMATIONS).map(
          (a, idx) => ({
            id: `curated-${activeCategory}-${idx}`,
            text: a.text,
            categoryKey: a.categoryKey,
            source: "curated",
            isFavorite: false,
          })
        );
      }
    }

    // Fetch user AI affirmations if user exists
    if (user && (source === "ai" || source === "mixed")) {
      const userAffirmations = await prisma.affirmation.findMany({
        where: {
          userId: user.id,
          source: "ai",
        },
        orderBy: { createdAt: "desc" },
      });

      userAiList = userAffirmations.map((a) => ({
        id: a.id,
        text: a.text,
        categoryKey: a.categoryKey,
        source: "ai",
        isFavorite: a.isFavorite,
      }));
    }

    let combinedPool = [];
    if (source === "ai" && userAiList.length > 0) {
      combinedPool = userAiList;
    } else if (source === "curated" || userAiList.length === 0) {
      combinedPool = curatedList;
    } else {
      // Mixed: combine both with slight weight to AI
      combinedPool = [...userAiList, ...curatedList];
    }

    return NextResponse.json({
      category: activeCategory,
      signals: combinedPool,
      count: combinedPool.length,
    });
  } catch (error) {
    console.error("Erro ao buscar sinais:", error);
    return NextResponse.json({ error: "Erro ao buscar sinais" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, deviceId, affirmationId, isFavorite } = body;

    if (!deviceId) {
      return NextResponse.json({ error: "deviceId obrigatório" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { deviceId },
      include: {
        checkIns: {
          orderBy: { date: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Action: Check-in
    if (action === "checkin") {
      const today = new Date().toISOString().split("T")[0];

      // Check if already checked in today
      const alreadyCheckedIn = user.checkIns.some((c) => c.date === today);
      if (alreadyCheckedIn) {
        return NextResponse.json({
          success: true,
          alreadyCheckedIn: true,
          streak: user.streak,
        });
      }

      // Calculate streak: check if yesterday was checked in
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      const checkedInYesterday = user.checkIns.some((c) => c.date === yesterdayStr);
      const newStreak = checkedInYesterday ? user.streak + 1 : 1;

      // Save check-in record
      await prisma.checkIn.create({
        data: {
          userId: user.id,
          date: today,
        },
      });

      // Update user streak & lastCheckin
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          streak: newStreak,
          lastCheckin: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        alreadyCheckedIn: false,
        streak: updatedUser.streak,
        date: today,
      });
    }

    // Action: Toggle Favorite
    if (action === "favorite" && affirmationId) {
      // If it exists in DB, update
      const existing = await prisma.affirmation.findUnique({
        where: { id: affirmationId },
      });

      if (existing) {
        const updated = await prisma.affirmation.update({
          where: { id: affirmationId },
          data: { isFavorite: isFavorite ?? !existing.isFavorite },
        });
        return NextResponse.json({ success: true, affirmation: updated });
      }

      return NextResponse.json({ success: true, isFavorite });
    }

    return NextResponse.json({ error: "Ação desconhecida" }, { status: 400 });
  } catch (error) {
    console.error("Erro no processamento de sinais:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
