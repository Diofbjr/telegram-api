const jwt = require("jsonwebtoken");

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class FindNumbers {
  async findNumbers(req, res) {
    const bearerToken = req.headers.authorization;
    const token =
      bearerToken && bearerToken.startsWith("Bearer ")
        ? bearerToken.slice(7)
        : null;
    const userId = jwt.decode(token);

    try {
      const numbers = await prisma.phone.findFirst({
        where: {
          userId: userId.id,
        },
      });

      return res.status(201).json({ numbers });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao achar numeros." });
    }
  }
}

module.exports = { FindNumbers };
