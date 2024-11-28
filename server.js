require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const { readFile } = require("./utils/readFile");
const { authMiddleware } = require("./utils/authMiddleware");

const app = express();
const upload = multer({ dest: "uploads/" });

// Middleware
app.use(bodyParser.json());

// Rotas
// 1) Receber arquivo Base64 e extrair texto
app.post("/extract-text", authMiddleware, upload.single("file"), async (req, res) => {
  const { base64, fileType } = req.body;

  if (!base64 || !fileType) {
    return res.status(400).json({ error: "base64 and fileType are required" });
  }

  // Salvar o arquivo recebido
  const buffer = Buffer.from(base64, "base64");
  const filePath = `uploads/${Date.now()}`;
  require("fs").writeFileSync(filePath, buffer);

  try {
    const extractedText = await readFile(filePath, fileType);
    res.json({ text: extractedText });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2) Receber arquivo Base64 e salvar localmente
app.post("/save-file", authMiddleware, (req, res) => {
  const { base64, fileType } = req.body;

  if (!base64 || !fileType) {
    return res.status(400).json({ error: "base64 and fileType are required" });
  }

  // Salvar o arquivo
  const buffer = Buffer.from(base64, "base64");
  const fileName = `uploads/${Date.now()}.${fileType.split("/")[1]}`;
  require("fs").writeFileSync(fileName, buffer);

  res.json({ link: `${req.protocol}://${req.get("host")}/${fileName}` });
});

// 3) Rota de status
app.get("/status", (req, res) => {
  res.json({ status: "API is running", port: process.env.PORT });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
