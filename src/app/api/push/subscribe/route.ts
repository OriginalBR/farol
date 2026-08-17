import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { deviceId, subscription } = body;

    if (!deviceId || !subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: "deviceId e subscription são obrigatórios" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { deviceId },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const { endpoint, keys } = subscription;
    const p256dh = keys?.p256dh || "";
    const auth = keys?.auth || "";

    const saved = await prisma.pushSubscription.upsert({
      where: { endpoint },
      create: {
        userId: user.id,
        endpoint,
        p256dh,
        auth,
      },
      update: {
        userId: user.id,
        p256dh,
        auth,
      },
    });

    return NextResponse.json({ success: true, subscriptionId: saved.id });
  } catch (error) {
    console.error("Erro ao salvar inscrição push:", error);
    return NextResponse.json(
      { error: "Erro ao registrar subscrição push" },
      { status: 500 }
    );
  }
}
