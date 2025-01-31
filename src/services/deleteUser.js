const jwt = require("jsonwebtoken");

const { PrismaClient } = require("@prisma/client");
const { message } = require("telegram/client");

const prisma = new PrismaClient();

class DeleteUser {
  async deleteUser(req, res) {
    const bearerToken = req.headers.authorization;
    const token =
      bearerToken && bearerToken.startsWith("Bearer ")
        ? bearerToken.slice(7)
        : null;
    const userId = jwt.decode(token);

    try {
      const user = await prisma.user.findFirst({
        where: {
          id: userId.id,
        },
      });
      const deletionDate = new Date();
      deletionDate.setDate(deletionDate.getDate() + 1);

      await prisma.user.update({
        where: { id: userId.id },
        data: { deletion_date: deletionDate },
      });

      return res
        .status(201)
        .json({ message: "Conta sera deletada em 30 dias" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao deletar usuario." });
    }
  }
}

module.exports = { DeleteUser };
