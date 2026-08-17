import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const deviceId = searchParams.get("deviceId");
  const search = searchParams.get("search") || "";

  if (!deviceId) {
    return NextResponse.json({ error: "deviceId obrigatório" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { deviceId },
    });

    if (!user) {
      return NextResponse.json({ entries: [] });
    }

    const entries = await prisma.journalEntry.findMany({
      where: {
        userId: user.id,
        ...(search
          ? {
              text: {
                contains: search,
              },
            }
          : {}),
      },
      include: {
        linkedAffirmation: true,
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Erro ao buscar diário:", error);
    return NextResponse.json({ error: "Erro ao buscar entradas do diário" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { deviceId, id, text, date, linkedAffirmationId } = body;

    if (!deviceId || !text) {
      return NextResponse.json(
        { error: "deviceId e text são obrigatórios" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { deviceId },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const entryDate = date || new Date().toISOString().split("T")[0];

    let entry;
    if (id) {
      entry = await prisma.journalEntry.update({
        where: { id },
        data: {
          text,
          date: entryDate,
          linkedAffirmationId: linkedAffirmationId || null,
        },
        include: { linkedAffirmation: true },
      });
    } else {
      entry = await prisma.journalEntry.create({
        data: {
          userId: user.id,
          date: entryDate,
          text,
          linkedAffirmationId: linkedAffirmationId || null,
        },
        include: { linkedAffirmation: true },
      });
    }

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error("Erro ao salvar entrada no diário:", error);
    return NextResponse.json({ error: "Erro ao salvar no diário" }, { status: 500 });
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

    await prisma.journalEntry.delete({
      where: {
        id,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir entrada do diário:", error);
    return NextResponse.json({ error: "Erro ao excluir entrada" }, { status: 500 });
  }
}
