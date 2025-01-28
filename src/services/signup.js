const Joi = require("joi");
const bcrypt = require("bcrypt");
const { compare } = require("bcrypt");
const { sign } = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const UserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const prisma = new PrismaClient();
const salt = 10;

class Signup {
  async signup(req, res) {
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
  }
}

module.exports = { Signup };
