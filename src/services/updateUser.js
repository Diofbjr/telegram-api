const jwt = require("jsonwebtoken");

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class UpdateUser {
  async updateuser(req, res) {
    const { name } = req.body;
    const bearerToken = req.headers.authorization;
    if (!name) {
      return res.status(400).json({ message: "Faltando o nome" });
    }
    const token =
      bearerToken && bearerToken.startsWith("Bearer ")
        ? bearerToken.slice(7)
        : null;
    const userId = jwt.decode(token);

    try {
      const user = await prisma.user.update({
        where: {
          id: userId.id,
        },
        data: {
          name: name,
        },
      });

      return res.status(201).json({ user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao atualizar usuário." });
    }
  }
}

module.exports = { UpdateUser };
