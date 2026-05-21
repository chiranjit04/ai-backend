import db from "../../config/db.js";

export const insertQuestion = async (payload) => {
  const [result] = await db.execute(
    `
    INSERT INTO questions (
      question_id,
      text,
      explanation,
      is_active,
      marks,
      type,
      domain_id,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `,
    [
      payload.question_id,
      payload.text,
      payload.explanation,
      1,
      payload.marks,
      payload.type,
      payload.domain_id,
    ]
  );

  return result;
};

export const insertOption = async (payload) => {
  const [result] = await db.execute(
    `
    INSERT INTO question_options (
      option_id,
      is_correct,
      marks,
      sequence,
      text,
      question_id
    )
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      payload.option_id,
      payload.is_correct,
      payload.marks,
      payload.sequence,
      payload.text,
      payload.question_id,
    ]
  );

  return result;
};

export const attachQuestionToExam = async (payload) => {
  const [result] = await db.execute(
    `
    INSERT INTO exam_questions (
      exam_id,
      question_id,
      marks_override,
      sequence,
      section_id
    )
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      payload.exam_id,
      payload.question_id,
      payload.marks_override,
      payload.sequence,
      payload.section_id,
    ]
  );

  return result;
};