const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

const salt = 10;

class PasswordReset {
  // Função para solicitar o reset de senha
  async requestReset(req, res) {
    const { email } = req.body;

    try {
      // Verifica se o usuário existe
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      // Gerar um token único para reset
      const resetToken = crypto.randomBytes(32).toString("hex");

      // Definir o tempo de expiração (1 hora)
      const resetTokenExpiry = new Date();
      resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1);

      // Salvar o token e a data de expiração no banco de dados
      await prisma.user.update({
        where: { email },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      });

      // -------------------
      // Envio de e-mail comentado para futura implementação
      // -------------------
      /*
      const resetLink = `http://seusite.com/reset-password?token=${resetToken}`;
      await sendEmail(email, "Redefinição de Senha", `Clique no link para redefinir sua senha: ${resetLink}`);
      */

      // Retornar o token no JSON para testes
      return res
        .status(200)
        .json({ message: "Token de reset gerado com sucesso", resetToken });
    } catch (error) {
      console.error("Erro ao solicitar reset de senha:", error);
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  // Função para redefinir a senha
  async resetPassword(req, res) {
    const { token, newPassword } = req.body;

    try {
      // Procurar o usuário com o token fornecido
      const user = await prisma.user.findFirst({
        where: {
          resetToken: token,
          resetTokenExpiry: {
            gte: new Date(), // Verifica se o token ainda é válido
          },
        },
      });

      if (!user) {
        return res.status(400).json({ message: "Token inválido ou expirado" });
      }
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      // Atualiza a senha e remove o token de reset
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword, // Aqui você deve hashear a senha antes de salvar
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      return res.status(200).json({ message: "Senha redefinida com sucesso" });
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
}

module.exports = { PasswordReset };
