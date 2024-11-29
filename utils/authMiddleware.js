function authMiddleware(req, res, next) {
  const accessToken = req.header("Access-Token");

  // Verifique se o token está presente
  if (!accessToken) {
    return res.status(401).json({ error: "Access Token is required" });
  }

  // Compare com o valor configurado no .env
  if (accessToken !== process.env.AUTH_TOKEN) {
    return res.status(403).json({ error: "Invalid Access Token" });
  }

  next(); // Continue para a próxima rota
}

module.exports = { authMiddleware };
