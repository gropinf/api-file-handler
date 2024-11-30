require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const { readFile } = require("./utils/readFile");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid"); // Para gerar IDs únicos
const { authMiddleware } = require("./utils/authMiddleware");

const app = express();

// Configurações
const PORT = process.env.PORT || 3000;
const uploadFolder = path.join(__dirname, "uploads");

// Garantir que a pasta de uploads exista
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

// Middleware global
app.use(bodyParser.json({ limit: "10mb" }));

// Middleware para servir arquivos estáticos
app.use("/uploads", express.static(uploadFolder));

// 1) Endpoint para upload de arquivos Base64
app.post("/upload", authMiddleware, (req, res) => {
  try {
    const { base64, fileName } = req.body;

    // Verificar se os dados foram enviados corretamente
    if (!base64 || !fileName) {
      return res.status(400).json({ error: "upload = Base64 e fileName são obrigatórios" });
    }

    // Decodificar o Base64 e salvar o arquivo
    const fileExtension = path.extname(fileName); // Extrai a extensão do arquivo
    const uniqueName = `${uuidv4()}${fileExtension}`; // Nome único para evitar conflitos
    const filePath = path.join(uploadFolder, uniqueName);
    //console.log(`fileExtension = ${fileExtension}`);
    //console.log(`uniqueName = ${uniqueName}`);
    //console.log(`filePath = ${filePath}`);

    // Escreve o arquivo decodificado na pasta
    const fileData = base64.split(";base64,").pop(); // Remove o prefixo Base64
    fs.writeFileSync(filePath, fileData, { encoding: "base64" });

    // Retorna o link para acessar o arquivo
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${uniqueName}`;
    res.json({ message: "Arquivo salvo com sucesso!", fileUrl });
  } catch (error) {
    console.error("Erro ao salvar o arquivo:", error);
    res.status(500).json({ error: "Erro ao salvar o arquivo" });
  }
});

// 2) Rota de extração de texto de arquivos (base64)
app.post("/extract-text", authMiddleware, async (req, res) => {
  const { base64, fileType } = req.body;

  if (!base64 || !fileType) {
    return res.status(400).json({ error: "extract-text = Base64 e fileType são obrigatórios" });

  }

  const buffer = Buffer.from(base64, "base64");
  const filePath = `uploads/${Date.now()}`;
  fs.writeFileSync(filePath, buffer);

  try {
    const extractedText = await readFile(filePath, fileType); // Implemente o readFile na pasta utils
    res.json({ text: extractedText });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3) Rota de status (sem autenticação)
app.get("/status", (req, res) => {
  res.json({ status: "API is running", port: PORT });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
