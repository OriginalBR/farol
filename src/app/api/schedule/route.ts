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
      include: { scheduleTimes: { orderBy: { time: "asc" } } },
    });

    if (!user) {
      return NextResponse.json({ schedules: [] });
    }

    return NextResponse.json({ schedules: user.scheduleTimes });
  } catch (error) {
    console.error("Erro ao buscar horários:", error);
    return NextResponse.json({ error: "Erro ao buscar horários" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { deviceId, time, label } = body;

    if (!deviceId || !time) {
      return NextResponse.json(
        { error: "deviceId e time são obrigatórios" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { deviceId },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const schedule = await prisma.scheduleTime.create({
      data: {
        userId: user.id,
        time,
        label: label || null,
      },
    });

    return NextResponse.json({ success: true, schedule });
  } catch (error) {
    console.error("Erro ao adicionar horário:", error);
    return NextResponse.json({ error: "Erro ao salvar horário" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const deviceId = searchParams.get("deviceId");

    if (!id || !deviceId) {
      return NextResponse.json({ error: "id e deviceId são obrigatórios" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { deviceId },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    await prisma.scheduleTime.delete({
      where: {
        id,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir horário:", error);
    return NextResponse.json({ error: "Erro ao excluir horário" }, { status: 500 });
  }
}
