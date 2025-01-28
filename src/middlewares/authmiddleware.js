const { verify } = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.json({ message: "Token not provided" });
  }

  const [, token] = authorization.split(" ");

  try {
    const decoded = verify(token, process.env.SECRET);
    const { id } = decoded;

    req.headers["userId"] = id; // Adiciona o ID do usuário ao cabeçalho da requisição
    next(); // Chama o próximo middleware ou rota
  } catch (error) {
    return res.json({ message: "Invalid or expired token" });
  }
}

module.exports = authMiddleware;
