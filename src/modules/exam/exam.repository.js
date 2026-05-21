import db from "../../config/db.js";

export const getStudentExamRepo = async (userId) => {
  console.log(userId)
  const [rows] = await db.execute(
    `
    SELECT
      BIN_TO_UUID(e.exam_id) AS exam_id,
      e.title,
      e.description,
      e.duration_minutes
    FROM user_enrollments ue

    JOIN exams e
      ON ue.exam_id = e.exam_id

    WHERE ue.user_id = ?
    AND ue.status = 'ENROLLED'

    LIMIT 1
    `,
    [userId]
  );

  return rows[0];
};

export const createExamRepo = async (exam) => {
  const [res] = await db.execute(
    `INSERT INTO exams (title, domain, duration, created_by, status)
     VALUES (?, ?, ?, ?, 'pending')`,
    [exam.title, exam.domain, exam.duration, exam.created_by]
  );
  return res.insertId;
};

export const assignStudentsRepo = async (examId, students) => {
  const values = students.map((s) => [examId, s]);
  await db.query(
    "INSERT INTO exam_participants (exam_id, student_id) VALUES ?",
    [values]
  );
};

export const addQuestionsRepo = async (examId, questionIds) => {
  const values = questionIds.map((q) => [examId, q]);
  await db.query(
    "INSERT INTO exam_questions (exam_id, question_id) VALUES ?",
    [values]
  );
};

export const getExamsForStudent = async (studentId) => {
  const [rows] = await db.execute(
    `SELECT e.* FROM exams e
     JOIN exam_participants ep ON e.id = ep.exam_id
     WHERE ep.student_id = ?`,
    [studentId]
  );
  return rows;
};

export const getExamListRepo = async () => {
  const [rows] = await db.execute(`
    SELECT
      BIN_TO_UUID(exam_id) AS exam_id,
      title,
      description,
      duration_minutes,
      total_marks,
      status,
      start_time,
      end_time,
      is_published
    FROM exams
    ORDER BY created_at DESC
  `);

  return rows;
};

export const getExamQuestionsRepo = async (examId) => {
  const [questions] = await db.execute(
    `
    SELECT
      BIN_TO_UUID(q.question_id) AS question_id,
      q.text,
      q.marks,
      q.type
    FROM exam_questions eq
    JOIN questions q
      ON eq.question_id = q.question_id
    WHERE eq.exam_id = UUID_TO_BIN(?)
    `,
    [examId]
  );

  return questions;
};

export const getQuestionOptionsRepo = async (questionId) => {
  const [options] = await db.execute(
    `
    SELECT
      BIN_TO_UUID(option_id) AS option_id,
      text,
      sequence
    FROM question_options
    WHERE question_id = UUID_TO_BIN(?)
    ORDER BY sequence ASC
    `,
    [questionId]
  );

  return options;
};