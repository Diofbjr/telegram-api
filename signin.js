const Joi = require("joi");
const { compare } = require("bcrypt");
const { sign } = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const UserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const prisma = new PrismaClient();

class Authenticate {
  async auth(req, res) {
    const data = req.body;

    const { error } = UserSchema.validate(data);

    if (error) {
      return res.status(404).json({ message: error.details[0].message });
    }

    const userExists = await prisma.user.findFirst({
      where: { email: data.email },
    });
    if (!userExists) {
      return res.status(404).json({ message: "User not exists" });
    }

    const isvaluePassword = await compare(data.password, userExists.password);

    if (!isvaluePassword) {
      return res.status(404).json({ message: "Password invalid" });
    }

    const token = sign({ id: userExists.id }, process.env.SECRET, {
      expiresIn: "1h",
    });

    return res.status(200).json({ userExists, token });
  }
}

module.exports = { Authenticate };
