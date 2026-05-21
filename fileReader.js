import fs from "fs";
import path from "path";
import mammoth from "mammoth";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

// ✅ stable import
const pdfParse = require("pdf-parse");

export const readFileContent = async (file) => {
  if (!file) return "";

  const filePath = file.path;
  const ext = path.extname(file.originalname).toLowerCase();

  let content = "";

  try {
    // 📄 TXT
    if (ext === ".txt") {
      content = fs.readFileSync(filePath, "utf-8");
    }

    // 📄 PDF (🔥 FINAL WORKING)
    else if (ext === ".pdf") {
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);

      content = data.text;
    }

    // 📄 DOCX
    else if (ext === ".docx") {
      const result = await mammoth.extractRawText({ path: filePath });
      content = result.value;
    }

    else {
      content = `Unsupported file type: ${ext}`;
    }

  } catch (error) {
    console.error("❌ File reading error:", error);
    content = "Error reading file";
  }

  // 🔥 Clean text
  content = content
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 5000);

  // 🧹 delete file
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.warn("Cleanup failed:", err.message);
  }

  return content;
};
import fs from "fs";
import path from "path";
import mammoth from "mammoth";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

// ✅ stable import
const pdfParse = require("pdf-parse");

export const readFileContent = async (file) => {
  if (!file) return "";

  const filePath = file.path;
  const ext = path.extname(file.originalname).toLowerCase();

  let content = "";

  try {
    // 📄 TXT
    if (ext === ".txt") {
      content = fs.readFileSync(filePath, "utf-8");
    }

    // 📄 PDF (🔥 FINAL WORKING)
    else if (ext === ".pdf") {
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);

      content = data.text;
    }

    // 📄 DOCX
    else if (ext === ".docx") {
      const result = await mammoth.extractRawText({ path: filePath });
      content = result.value;
    }

    else {
      content = `Unsupported file type: ${ext}`;
    }

  } catch (error) {
    console.error("❌ File reading error:", error);
    content = "Error reading file";
  }

  // 🔥 Clean text
  content = content
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 5000);

  // 🧹 delete file
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.warn("Cleanup failed:", err.message);
  }

  return content;
};