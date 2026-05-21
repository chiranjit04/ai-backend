import { processChat } from "./chat.service.js";

export const chatHandler = async (req, res) => {
  try {
    const reply = await processChat({
      message: req.body.message,
      file: req.file,
    });

    res.json({ reply });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};