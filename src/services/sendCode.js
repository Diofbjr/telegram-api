const Joi = require("joi");
const jwt = require("jsonwebtoken");
const {
  initTelegramClient,
  sendCode,
  signIn,
} = require("../services/authManagerNumber");

const loginSchema = Joi.object({
  phoneNumber: Joi.string().min(8).required(),
});

class SendCode {
  async sendcode(req, res) {
    const bearerToken = req.headers.authorization;
    // Verifica se o token existe e remove o prefixo "Bearer"
    const token =
      bearerToken && bearerToken.startsWith("Bearer ")
        ? bearerToken.slice(7)
        : null;
    const data = req.body;

    const { error } = loginSchema.validate(data);

    if (error) {
      return res.status(404).json({ message: error.details[0].message });
    }
    const userId = jwt.decode(token);

    if (!data.phoneNumber) {
      return res
        .status(400)
        .json({ error: "Número de telefone é obrigatório." });
    }

    try {
      const client = await initTelegramClient(data.phoneNumber);
      await sendCode(client, data.phoneNumber);
      res
        .status(200)
        .json({ message: "Código de verificação enviado com sucesso." });
    } catch (error) {
      res
        .status(500)
        .json({ error: `Erro ao enviar código: ${error.message}` });
    }
  }
}

module.exports = { SendCode };
