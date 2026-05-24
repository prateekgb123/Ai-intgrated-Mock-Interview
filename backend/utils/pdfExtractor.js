const fs = require("fs");
const pdfParse = require("pdf-parse");

const extractPDFText = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);

  const pdfData = await pdfParse(dataBuffer);

  return pdfData.text;
};

module.exports = extractPDFText;