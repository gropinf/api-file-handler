const fs = require("fs");
const pdfParse = require("pdf-parse");
const Tesseract = require("tesseract.js");

async function readFile(filePath, fileType) {
  if (fileType === "pdf") {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    return pdfData.text;
  } else if (fileType.startsWith("image/")) {
    const { data: { text } } = await Tesseract.recognize(filePath, "eng");
    return text;
  } else {
    throw new Error("Unsupported file type");
  }
}

module.exports = { readFile };
