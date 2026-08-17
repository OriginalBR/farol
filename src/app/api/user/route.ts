import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const deviceId = searchParams.get("deviceId");

  if (!deviceId) {
    return NextResponse.json({ error: "deviceId obrigatório" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { deviceId },
      include: {
        profile: true,
        scheduleTimes: true,
        checkIns: {
          orderBy: { timestamp: "desc" },
          take: 60,
        },
        affirmations: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ user: null });
    }

    // Check if user checked in today
    const today = new Date().toISOString().split("T")[0];
    const checkedInToday = user.checkIns.some((c) => c.date === today);

    return NextResponse.json({
      user: {
        ...user,
        checkedInToday,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      deviceId,
      accentColor,
      signalSource,
      profile,
      scheduleTimes,
    } = body;

    if (!deviceId) {
      return NextResponse.json({ error: "deviceId obrigatório" }, { status: 400 });
    }

    // Upsert user
    const user = await prisma.user.upsert({
      where: { deviceId },
      create: {
        deviceId,
        accentColor: accentColor || "amber",
        signalSource: signalSource || "mixed",
      },
      update: {
        ...(accentColor ? { accentColor } : {}),
        ...(signalSource ? { signalSource } : {}),
      },
    });

    // Upsert Profile if provided
    if (profile) {
      await prisma.profile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          mood: profile.mood || null,
          obstacles: JSON.stringify(profile.obstacles || []),
          desiredFeeling: profile.desiredFeeling || null,
          goalText: profile.goalText || null,
          category: profile.category || "foco",
        },
        update: {
          mood: profile.mood || null,
          obstacles: JSON.stringify(profile.obstacles || []),
          desiredFeeling: profile.desiredFeeling || null,
          goalText: profile.goalText || null,
          category: profile.category || "foco",
        },
      });
    }

    // Set default schedule times if provided
    if (Array.isArray(scheduleTimes) && scheduleTimes.length > 0) {
      await prisma.scheduleTime.deleteMany({
        where: { userId: user.id },
      });

      await prisma.scheduleTime.createMany({
        data: scheduleTimes.map((item: string | { time: string; label?: string }) => ({
          userId: user.id,
          time: typeof item === "string" ? item : item.time,
          label: typeof item === "string" ? null : item.label || null,
        })),
      });
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        profile: true,
        scheduleTimes: true,
        checkIns: true,
        affirmations: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Erro ao salvar usuário:", error);
    return NextResponse.json({ error: "Erro ao salvar perfil do usuário" }, { status: 500 });
  }
}
