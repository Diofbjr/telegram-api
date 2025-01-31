const cron = require("node-cron");
const { PrismaClient } = require("@prisma/client");
const cron = require("./cron");

const prisma = new PrismaClient();

// Cron job para rodar todos os dias à meia-noite
cron.schedule("0 0 * * *", async () => {
  const now = new Date();

  try {
    const usersToDelete = await prisma.user.findMany({
      where: {
        deletion_date: {
          lte: now,
        },
      },
    });

    for (const user of usersToDelete) {
      await prisma.user.delete({
        where: { id: user.id },
      });
    }

    console.log(`${usersToDelete.length} contas deletadas`);
  } catch (error) {
    console.error("Erro ao deletar contas:", error);
  }
});

module.exports = cron;
