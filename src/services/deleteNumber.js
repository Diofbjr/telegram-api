const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const { number } = require("joi");

const prisma = new PrismaClient();

class DeleteNumber {
  async deleteNumber(req, res) {
    const { phoneNumber } = req.body;
    const bearerToken = req.headers.authorization;
    const token =
      bearerToken && bearerToken.startsWith("Bearer ")
        ? bearerToken.slice(7)
        : null;
    const userId = jwt.decode(token);
    const findNumber = await prisma.phone.findFirst({
      where: { number: phoneNumber },
      include: { user: true },
    });
    if (!findNumber) {
      return res.status(403).json({ message: "Numero não encontrado" });
    }

    if (findNumber.user.id != userId.id) {
      return res
        .status(403)
        .json({ message: "Esse numero não pertence a voce" });
    }
    await prisma.phone.delete({ where: { number: phoneNumber } });
    return res.status(202).json({ message: "Numero deletado" });
  }
}

module.exports = { DeleteNumber };
