const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function activateVip(userId, days) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000); // Adiciona `days` em milissegundos

  await prisma.user.update({
    where: { id: userId },
    data: {
      premium: true,
      expires_at: expiresAt,
    },
  });

  console.log(`VIP ativado até ${expiresAt}`);
}
