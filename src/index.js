const express = require("express");
const cors = require("cors");
const routes = require("./routes/routes"); // Importa o arquivo routes.js

const app = express();
app.use(express.json());

// Configurar CORS para permitir todas as origens
app.use(cors());

// Conectar as rotas
app.use("/api", routes);

// Configurar a porta
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
