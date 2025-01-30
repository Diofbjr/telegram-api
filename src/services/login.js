const Joi = require("joi");
const jwt = require("jsonwebtoken");
const {
  initTelegramClient,
  sendCode,
  signIn,
} = require("../services/authManagerNumber");
const { PrismaClient } = require("@prisma/client");

const loginSchema = Joi.object({
  phoneNumber: Joi.string().min(8).required(),
  code: Joi.string().required(),
});

const prisma = new PrismaClient();

class Login {
  async login(req, res) {
    const data = req.body;
    const bearerToken = req.headers.authorization;
    // Verifica se o token existe e remove o prefixo "Bearer"
    const token =
      bearerToken && bearerToken.startsWith("Bearer ")
        ? bearerToken.slice(7)
        : null;
    const { error } = loginSchema.validate(data);

    if (error) {
      return res.status(404).json({ message: error.details[0].message });
    }

    const userId = jwt.decode(token);

    if (!data.phoneNumber || !data.code) {
      return res
        .status(400)
        .json({ error: "Número de telefone e código são obrigatórios." });
    }
    //Verifiações
    const user = await prisma.user.findFirst({
      where: { id: userId.id },
      include: { phone: true },
    });
    if (!user) {
      return res.status(404).json({ message: "User not founded" });
    }
    if (user.phone[0] != null) {
      if (user.premium === null) {
        return res.status(403).json({
          message: "Only premium users can register more than 1 number",
        });
      }
    }
    if (user.phone.length > 3) {
      return res.status(403).json({
        message: "you cannot register more than 3 numbers",
      });
    }
    const numberInUse = await prisma.phone.findFirst({
      where: { number: data.phoneNumber },
    });
    if (numberInUse) {
      return res.status(403).json({
        message: "Number in use",
      });
    }

    try {
      const client = await initTelegramClient(data.phoneNumber);

      const code = parseInt(data.code, 10);
      await signIn(client, data.phoneNumber, data.code);
      await prisma.user.update({
        where: { id: userId.id },
        data: {
          phone: {
            create: {
              number: data.phoneNumber,
              code: code,
            },
          },
        },
      });
      res.status(200).json({ message: "Login realizado com sucesso." });
    } catch (error) {
      res
        .status(500)
        .json({ error: `Erro ao realizar login: ${error.message}` });
    }
  }
}

module.exports = { Login };
