import db from "../../config/db.js";
import {
  generateUUIDBuffer,
} from "../../utils/uuid.js";

export const saveExamResultRepo =
  async (
    payload,
    studentId
  ) => {

    const [result] =
      await db.execute(
        `
        INSERT INTO exam_results
        (
          result_id,
          exam_id,
          student_id,
          score,
          total_marks,
          submitted_at
        )
        VALUES
        (
          ?,
          UUID_TO_BIN(?),
          ?,
          ?,
          ?,
          NOW()
        )
        `,
        [
          generateUUIDBuffer(),
          payload.exam_id,
          studentId,
          payload.score,
          payload.total_marks,
        ]
      );

    return result;
  };

export const evaluateExamRepo =
  async (
    examId
  ) => {

    const [rows] =
      await db.execute(
        `
        SELECT
          BIN_TO_UUID(
            q.question_id
          ) AS question_id,

          q.marks,

          qo.text AS answer

        FROM exam_questions eq

        INNER JOIN questions q
          ON eq.question_id =
             q.question_id

        INNER JOIN question_options qo
          ON qo.question_id =
             q.question_id
          AND qo.is_correct = 1

        WHERE eq.exam_id =
          UUID_TO_BIN(?)
        `,
        [examId]
      );

    return rows;
  };

export const getExamQuestionsRepo = async (examId) => {
  const [rows] = await db.execute(
    `   SELECT
          BIN_TO_UUID(q.question_id) AS id,
          q.text AS question,

          qo.text AS option_text,
          qo.is_correct,
          qo.sequence,
          qo.marks

        FROM exam_questions eq

        INNER JOIN questions q
          ON eq.question_id =
            q.question_id

        LEFT JOIN question_options qo
          ON q.question_id =
            qo.question_id

        WHERE eq.exam_id =
          UUID_TO_BIN(?)

        ORDER BY
          q.question_id,
          qo.sequence
        `,
    [examId],
  );

  const questionMap = {};

  rows.forEach((row) => {
    if (!questionMap[row.id]) {
      questionMap[row.id] = {
        id: row.id,
        question: row.question,
        options: [],
        answer: null,
        marks: row.marks,
      };
    }

    if (row.option_text) {
      questionMap[row.id].options.push(row.option_text);

      if (row.is_correct) {
        questionMap[row.id].answer = row.option_text;
      }
    }
  });

  return Object.values(questionMap);
};

export const getEnrollmentRepo = async (
  userId,
  examId
) => {
  const [rows] = await db.execute(
    `
    SELECT *
    FROM user_enrollments
    WHERE user_id = ?
    AND exam_id = UUID_TO_BIN(?)
    AND status = 'ENROLLED'
    LIMIT 1
    `,
    [userId, examId]
  );

  return rows[0];
};

// export const getStudentExamRepo = async (userId) => {
//   console.log(userId)
//   const [rows] = await db.execute(
//     `
//     SELECT
//       BIN_TO_UUID(e.exam_id) AS exam_id,
//       e.title,
//       e.description,
//       e.duration_minutes
//     FROM user_enrollments ue

//     JOIN exams e
//       ON ue.exam_id = e.exam_id

//     WHERE ue.user_id = ?
//     AND ue.status = 'ENROLLED'

//     LIMIT 1
//     `,
//     [userId]
//   );

//   return rows[0];
// };

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

export const getStudentExamRepo =
  async (studentId) => {

    const [rows] =
      await db.execute(
        `
        SELECT
          BIN_TO_UUID(e.exam_id)
            AS exam_id,
          e.title,
          e.description,
          e.duration_minutes,
          e.total_marks,
          e.start_time,
          e.end_time

        FROM user_enrollments ue

        INNER JOIN exams e
          ON ue.exam_id =
             e.exam_id

        WHERE ue.user_id = ?
          AND ue.status =
              'ENROLLED'
          AND e.deleted = 0

        LIMIT 1
        `,
        [studentId]
      );

    if (!rows.length) {

      throw new Error(
        "No exam assigned"
      );
    }

    return rows[0];
  };

export const deleteExamRepo = async (
  examId,
  userId
) => {

  const [result] =
    await db.execute(
      `
      UPDATE exams
      SET
        deleted = 1,
        updated_at = NOW()

      WHERE exam_id = UUID_TO_BIN(?)
      AND created_by = ?
      AND deleted = 0
      `,
      [
        examId,
        userId,
      ]
    );

  return result;
};

export const updateExamRepo = async (
  examId,
  payload,
  userId,
  connection
) => {

  const [result] =
    await connection.execute(
      `
      UPDATE exams
      SET
        title = ?,
        description = ?,
        duration_minutes = ?,
        total_marks = ?,
        domain_id = UUID_TO_BIN(?),
        updated_at = NOW()

      WHERE exam_id = UUID_TO_BIN(?)
      AND created_by = ?
      AND deleted = 0
      `,
      [
        payload.title,
        payload.description,
        payload.duration_minutes,
        payload.total_marks,
        payload.domain_id,
        examId,
        userId,
      ]
    );

  return result;
};

export const getExamListRepo = async (userId) => {
  const [rows] = await db.execute(`
      
      SELECT
        BIN_TO_UUID(e.exam_id) AS exam_id,
        e.title,
        e.description,
        e.duration_minutes,
        e.total_marks,
        e.status,
        e.start_time,
        BIN_TO_UUID(e.domain_id) AS domain_id,
        e.end_time,
        e.is_published,
        u.id AS student_id,
        CONCAT(
          u.first_name,
          ' ',
          u.last_name
        ) AS student_name

      FROM exams e
      LEFT JOIN user_enrollments ue
        ON e.exam_id = ue.exam_id

      LEFT JOIN users u
        ON ue.user_id = u.id
      
      WHERE e.deleted = 0

      ORDER BY e.created_at DESC
    `, [userId]);

  // GROUP STUDENTS BY EXAM

  const examMap = {};

  for (const row of rows) {
    if (!examMap[row.exam_id]) {
      examMap[row.exam_id] = {
        exam_id: row.exam_id,
        title: row.title,
        domain_id: row.domain_id,
        description: row.description,
        duration_minutes: row.duration_minutes,
        total_marks: row.total_marks,
        status: row.status,
        start_time: row.start_time,
        end_time: row.end_time,
        is_published: row.is_published,
        students: [],
      };
    }

    // ADD STUDENT

    if (row.student_id) {
      examMap[row.exam_id].students.push({
        id: row.student_id,
        name: row.student_name,
      });
    }
  }

  return Object.values(examMap);
};

// export const getExamQuestionsRepo = async (examId) => {
//   const [questions] = await db.execute(
//     `
//     SELECT
//       BIN_TO_UUID(q.question_id) AS question_id,
//       q.text,
//       q.marks,
//       q.type
//     FROM exam_questions eq
//     JOIN questions q
//       ON eq.question_id = q.question_id
//     WHERE eq.exam_id = UUID_TO_BIN(?)
//     `,
//     [examId]
//   );

//   return questions;
// };

export const getQuestionOptionsRepo = async (questionId) => {
  const [options] = await db.execute(
    `
    SELECT
      BIN_TO_UUID(option_id) AS option_id,
      text,
      marks,
      sequence
    FROM question_options
    WHERE question_id = UUID_TO_BIN(?)
    ORDER BY sequence ASC
    `,
    [questionId]
  );

  return options;
};