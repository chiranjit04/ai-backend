import {
  insertQuestion,
  insertOption,
  attachQuestionToExam,
} from "./question.repository.js";

import { generateUUIDBuffer } from "../../utils/uuid.js";
import { uuidToBuffer } from "../../utils/uuid.js";

export const createQuestionService = async (payload) => {
  // ✅ Generate Question UUID
  const questionId = generateUUIDBuffer();

  // ✅ Insert Question
  await insertQuestion({
    question_id: questionId,

    text: payload.text,

    difficulty: payload.difficulty,

    explanation: payload.explanation,

    marks: payload.marks,

    negative_marks: payload.negative_marks,

    tags: payload.tags,

    type: payload.type,

    domain_id: uuidToBuffer(payload.domain_id),
  });

  // ✅ Insert Options
  for (const option of payload.options) {
    await insertOption({
      option_id: generateUUIDBuffer(),

      is_correct: option.is_correct,

      marks: option.marks || 0,

      sequence: option.sequence,

      text: option.text,

      question_id: questionId,
    });
  }

  // ✅ Attach Question To Exam
  await attachQuestionToExam({
    exam_id: uuidToBuffer(payload.exam_id),

    question_id: questionId,

    marks_override: payload.marks,

    sequence: payload.sequence || 1,

    section_id: payload.section_id
      ? uuidToBuffer(payload.section_id)
      : null,
  });

  return {
    message: "Question created successfully",
  };
};