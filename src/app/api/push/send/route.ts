import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { prisma } from "@/lib/prisma";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT || "mailto:farol@estacao.local";

if (publicKey && privateKey) {
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { deviceId, signalText, categoryName } = body;

    if (!deviceId) {
      return NextResponse.json({ error: "deviceId obrigatório" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { deviceId },
      include: {
        pushSubscriptions: true,
        affirmations: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    if (user.pushSubscriptions.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma subscrição push encontrada para este dispositivo." },
        { status: 404 }
      );
    }

    const textToSend =
      signalText ||
      user.affirmations[0]?.text ||
      "Executo minha tarefa prioritária com foco e serenidade inabalável.";

    const category = categoryName || "Transmissão";

    const payload = JSON.stringify({
      title: `FAROL // ${category.toUpperCase()}`,
      body: textToSend,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/badge-72x72.png",
      data: {
        url: "/",
        timestamp: Date.now(),
      },
    });

    const results = await Promise.allSettled(
      user.pushSubscriptions.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };
        return webpush.sendNotification(pushSubscription, payload);
      })
    );

    const sentCount = results.filter((r) => r.status === "fulfilled").length;
    const failedCount = results.filter((r) => r.status === "rejected").length;

    // Clean up expired subscriptions
    for (let i = 0; i < results.length; i++) {
      if (results[i].status === "rejected") {
        const err: any = (results[i] as PromiseRejectedResult).reason;
        if (err?.statusCode === 410 || err?.statusCode === 404) {
          await prisma.pushSubscription.delete({
            where: { endpoint: user.pushSubscriptions[i].endpoint },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      sentCount,
      failedCount,
      message: `Transmissão enviada para ${sentCount} dispositivo(s).`,
    });
  } catch (error) {
    console.error("Erro ao enviar Web Push:", error);
    return NextResponse.json(
      { error: "Erro ao disparar notificação" },
      { status: 500 }
    );
  }
}
