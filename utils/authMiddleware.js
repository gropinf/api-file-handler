const basicAuth = require("basic-auth");

function authMiddleware(req, res, next) {
  const credentials = basicAuth(req);
  if (!credentials || credentials.name !== process.env.AUTH_USER || credentials.pass !== process.env.AUTH_PASS) {
    res.status(401).send("Access Denied");
    return;
  }
  next();
}

module.exports = { authMiddleware };
