const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const cors = require("cors");
const { Authenticate } = require("./signin");
const { initTelegramClient, sendCode, signIn } = require("./authManager");
const Joi = require("joi");
const jwt = require("jsonwebtoken");

const router = express.Router(); // Use `router` para definir as rotas
const prisma = new PrismaClient();
const salt = 10;
const authenticate = new Authenticate();

// Middleware CORS
router.use(cors());

// Rota de cadastro
router.post("/signup", async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
      },
    });

    return res.status(201).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar usuário." });
  }
});

// Rota de login
router.post("/signin", async (req, res) => {
  try {
    await authenticate.auth(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
});

// Rota para enviar código de verificação
router.post("/send-code", async (req, res) => {
  const loginSchema = Joi.object({
    token: Joi.string().required(),
    phoneNumber: Joi.string().min(8).required(),
  });
  const data = req.body;
  console.log(data);
  const { error } = loginSchema.validate(data);

  if (error) {
    return res.status(404).json({ message: error.details[0].message });
  }
  const userId = jwt.decode(data.token);
  console.log(userId);

  if (!data.phoneNumber) {
    return res.status(400).json({ error: "Número de telefone é obrigatório." });
  }

  try {
    const client = await initTelegramClient(data.phoneNumber);
    await sendCode(client, data.phoneNumber);
    res
      .status(200)
      .json({ message: "Código de verificação enviado com sucesso." });
  } catch (error) {
    res.status(500).json({ error: `Erro ao enviar código: ${error.message}` });
  }
});

// Rota para login com código de verificação
router.post("/login", async (req, res) => {
  const loginSchema = Joi.object({
    token: Joi.string().required(),
    phoneNumber: Joi.string().min(8).required(),
    code: Joi.string().required(),
  });
  const data = req.body;
  const { error } = loginSchema.validate(data);

  if (error) {
    return res.status(404).json({ message: error.details[0].message });
  }
  const userId = jwt.decode(data.token);

  if (!data.phoneNumber || !data.code) {
    return res
      .status(400)
      .json({ error: "Número de telefone e código são obrigatórios." });
  }
  const user = await prisma.user.findFirst({ where: { id: userId.id } });
  if (!user) {
    return res.status(404).json({ message: "User not founded" });
  }
  try {
    const client = await initTelegramClient(data.phoneNumber);
    console.log(client);
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
    res.status(500).json({ error: `Erro ao realizar login: ${error.message}` });
  }
});

module.exports = router; // Exporta as rotas
