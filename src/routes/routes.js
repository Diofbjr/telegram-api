const express = require("express");
const cors = require("cors");
const { Authenticate } = require("../services/authenticate");
const authMiddleware = require("../middlewares/authmiddleware");
const { Signup } = require("../services/signup");
const { SendCode } = require("../services/sendCode");
const { Login } = require("../services/login");
const { UpdateUser } = require("../services/updateUser");

const router = express.Router(); // Use `router` para definir as rotas

const authenticate = new Authenticate();
const signup = new Signup();
const sendcode = new SendCode();
const login = new Login();
const updateUser = new UpdateUser();

// Middleware CORS
router.use(cors());

// Rota de cadastro
router.post("/signup", async (req, res) => {
  try {
    await signup.signup(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro interno no servidor." });
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
router.post("/send-code", authMiddleware, async (req, res) => {
  try {
    await sendcode.sendcode(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
});

// Rota para login com código de verificação
router.post("/login", authMiddleware, async (req, res) => {
  try {
    await login.login(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
});

router.put("/update-user", authMiddleware, async (req, res) => {
  try {
    await updateUser.updateuser(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
});

module.exports = router; // Exporta as rotas
