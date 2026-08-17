import { PrismaClient } from "@prisma/client";
import { ALL_CURATED_AFFIRMATIONS } from "../src/lib/curated-affirmations";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Semeando banco de dados Farol com afirmações curadas...");

  // Remove existing global curated affirmations to avoid duplicates
  await prisma.affirmation.deleteMany({
    where: { userId: null, source: "curated" },
  });

  const created = await prisma.affirmation.createMany({
    data: ALL_CURATED_AFFIRMATIONS.map((item) => ({
      text: item.text,
      categoryKey: item.categoryKey,
      source: "curated",
      userId: null,
    })),
  });

  console.log(`✅ Sucesso: ${created.count} afirmações semeadas no banco global.`);
}

main()
  .catch((e) => {
    console.error("❌ Erro ao semear banco:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
