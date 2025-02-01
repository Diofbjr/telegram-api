const express = require("express");
const cors = require("cors");
const { Authenticate } = require("../services/authenticate");
const authMiddleware = require("../middlewares/authmiddleware");
const { Signup } = require("../services/signup");
const { SendCode } = require("../services/sendCode");
const { Login } = require("../services/login");
const { UpdateUser } = require("../services/updateUser");
const { DeleteNumber } = require("../services/deleteNumber");
const { FindNumbers } = require("../services/findNumbers");
const { DeleteUser } = require("../services/deleteUser");
const { PasswordReset } = require("../services/resetPassword");

const router = express.Router(); // Use `router` para definir as rotas

const authenticate = new Authenticate();
const signup = new Signup();
const sendcode = new SendCode();
const login = new Login();
const updateUser = new UpdateUser();
const deleteNumber = new DeleteNumber();
const findNumbers = new FindNumbers();
const deleteUser = new DeleteUser();
const passwordReset = new PasswordReset();

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

router.delete("/delete-number", authMiddleware, async (req, res) => {
  try {
    await deleteNumber.deleteNumber(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
});

router.get("/find-numbers", authMiddleware, async (req, res) => {
  try {
    await findNumbers.findNumbers(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
});

router.delete("/delete-user", authMiddleware, async (req, res) => {
  try {
    await deleteUser.deleteUser(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
});

router.post("/reset-request", async (req, res) => {
  try {
    await passwordReset.requestReset(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    await passwordReset.resetPassword(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
});

module.exports = router; // Exporta as rotas
