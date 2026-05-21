import axios from "axios";
import { readFileContent } from "../../utils/fileReader.js";

let history = [];

export const processChat = async ({ message, file }) => {
  try {
    let fileContent = "";

    // 📄 Read file content
    if (file) {
      fileContent = await readFileContent(file.path);
    }

    // 🧠 Push user message
    history.push({
      role: "user",
      content:
        message +
        (fileContent
          ? `\n\nContent of document:\n${fileContent}`
          : ""),
    });
console.log(history)
    // 🧠 Build prompt
    const prompt = history
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n");

    // Call Ollama (your existing API)
    const response = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "llama3.2:3b",
        prompt,
        stream: false,
      }
    );

    const reply = response.data.response;

    // 🧠 Save assistant reply
    history.push({ role: "assistant", content: reply });

    return reply;
  } catch (error) {
    console.error("Chat Service Error:", error);
    throw new Error("Ollama error");
  }
};