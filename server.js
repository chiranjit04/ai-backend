// server.js
import express from "express";
import axios from "axios";
import cors from "cors";
import OpenAI from "openai";
import { readFileContent } from "./fileReader.js";
import multer from "multer";
const app = express();
app.use(cors());
app.use(express.json());
let history = [];
const upload = multer({ dest: "uploads/" });
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY | '',
});
// Test route
app.get("/", (req, res) => {
  res.send("Server is working 🚀");
});
// Chat route
app.post("/api/chat", upload.single("file"), async (req, res) => {
   console.log("Reques body............23:", history);
   
  try {
    const { message } = req.body;
    const file = req.file;
    const fileContent = await readFileContent(file);
    console.log(fileContent)

    history.push({ role: "user",  content: message + (fileContent ? `\n\nContent of document:\n${fileContent}` : "") });
    const prompt = history
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n");
    const response = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "llama3.2:3b",
        prompt: prompt,
        stream: false,
      }
    );
    const reply = response.data.response;
    // Save assistant reply
    history.push({ role: "assistant", content: reply });
    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ollama error" });
  }
});

app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});