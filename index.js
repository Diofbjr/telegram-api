const express = require("express");
const cors = require("cors");
const { initTelegramClient, sendCode, signIn } = require("./authManager");
const { PrismaClient } = require("@prisma/client");



const app = express();
app.use(express.json());
const prisma = new PrismaClient();
// Configurar CORS para permitir todas as origens
app.use(cors());

app.post("/signup", async (req, res)=>{
  const {email, password, name} = req.body;
  
  const user = await prisma.user.create({
    data:{
      name: name,
      email: email,
      password:password
    }
  })
  return res.status(201).json({user})
})

// Endpoint para enviar o código de verificação
app.post("/send-code", async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ error: "Número de telefone é obrigatório." });
  }

  try {
    const client = await initTelegramClient(phoneNumber);
    await sendCode(client, phoneNumber);
    res.status(200).json({ message: "Código de verificação enviado com sucesso." });
  } catch (error) {
    res.status(500).json({ error: `Erro ao enviar código: ${error.message}` });
  }
});

app.post("/signin", async (req, res)=>{

})

// Endpoint para realizar o login
app.post("/login", async (req, res) => {
  const { phoneNumber, code } = req.body;

  if (!phoneNumber || !code) {
    return res.status(400).json({ error: "Número de telefone e código são obrigatórios." });
  }

  try {
    const client = await initTelegramClient(phoneNumber);
    await signIn(client, phoneNumber, code);
    res.status(200).json({ message: "Login realizado com sucesso." });
  } catch (error) {
    res.status(500).json({ error: `Erro ao realizar login: ${error.message}` });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
