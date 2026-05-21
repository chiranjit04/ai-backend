import { createQuestionService } from "./question.service.js";

export const createQuestion = async (req, res) => {
  try {
    const result = await createQuestionService(req.body);

    res.status(201).json(result);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
};