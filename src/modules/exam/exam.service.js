import db from "../../config/db.js";
import { updateExamRepo, getStudentExamRepo, getExamQuestionsRepo, evaluateExamRepo, saveExamResultRepo } from "./exam.repository.js";


export const submitExamService = 
  async (
    payload,
    studentId
  ) => {

    const questions =
      await evaluateExamRepo(
        payload.exam_id
      );

    let score = 0;

    let totalMarks = 0;

    questions.forEach(
      (question) => {

        totalMarks +=
          Number(
            question.marks
          );

        const userAnswer =
          payload.answers[
            question.question_id
          ];

        if (
          userAnswer ===
          question.answer
        ) {

          score +=
            Number(
              question.marks
            );
        }
      }
    );

    try {

  await saveExamResultRepo(
    {
      exam_id:
        payload.exam_id,

      score,

      total_marks:
        totalMarks,
    },
    studentId
  );

} catch (err) {

  if (
    err.code ===
    "ER_DUP_ENTRY"
  ) {

    return {
      success: false,
      message:
        "You have already submitted this exam.",
    };
  }

  throw err;
}

    return {
      score,
      totalMarks,
    };
  };

export const getExamQuestionsService = async (examId) => {
  const questions = await getExamQuestionsRepo(examId);
  return questions;
};

export const getStudentExamService =
  async (studentId) => {

    const exam =
      await getStudentExamRepo(
        studentId
      );

    return exam;
  };

// export const submitExamService = async (payload, userId) => {
//   const connection = await db.getConnection();

//   try {
//     await connection.beginTransaction();

//     // =========================
//     // VALIDATE ENROLLMENT
//     // =========================

//     const [enrollmentRows] = await connection.execute(
//       `
//         SELECT *
//         FROM user_enrollments
//         WHERE user_id = ?
//         AND exam_id = UUID_TO_BIN(?)
//         AND status = 'ENROLLED'
//         LIMIT 1
//         `,
//       [userId, payload.exam_id],
//     );

//     const enrollment = enrollmentRows[0];

//     if (!enrollment) {
//       throw new Error("No active enrollment found");
//     }

//     // =========================
//     // CHECK PREVIOUS ATTEMPT
//     // =========================

//     const [attemptRows] = await connection.execute(
//       `
//         SELECT *
//         FROM exam_attempts
//         WHERE user_id = ?
//         AND exam_id = UUID_TO_BIN(?)
//         AND status = 'SUBMITTED'
//         LIMIT 1
//         `,
//       [userId, payload.exam_id],
//     );

//     if (attemptRows.length) {
//       throw new Error("Exam already submitted");
//     }

//     // =========================
//     // CREATE ATTEMPT
//     // =========================

//     const attemptId = generateUUIDBuffer();

//     // =========================
//     // TOTAL SCORE
//     // =========================

//     let totalScore = 0;

//     // =========================
//     // SAVE ANSWERS
//     // =========================

//     for (const answer of payload.answers) {
//       // FIND CORRECT OPTION

//       const [optionRows] = await connection.execute(
//         `
//           SELECT
//             is_correct,
//             marks
//           FROM question_options
//           WHERE option_id = UUID_TO_BIN(?)
//           LIMIT 1
//           `,
//         [answer.selected_option_id],
//       );

//       if (!optionRows.length) {
//         throw new Error("Invalid option selected");
//       }

//       const option = optionRows[0];

//       const obtainedMarks = option.is_correct ? Number(option.marks || 0) : 0;

//       totalScore += obtainedMarks;

//       // SAVE ANSWER

//       await connection.execute(
//         `
//         INSERT INTO exam_answers (
//           answer_id,
//           attempt_id,
//           question_id,
//           selected_option_id,
//           is_correct,
//           obtained_marks,
//           created_at
//         )
//         VALUES (?, ?, ?, ?, ?, ?, NOW())
//         `,
//         [
//           generateUUIDBuffer(),

//           attemptId,

//           uuidToBuffer(answer.question_id),

//           uuidToBuffer(answer.selected_option_id),

//           option.is_correct ? 1 : 0,

//           obtainedMarks,
//         ],
//       );
//     }

//     // =========================
//     // GET EXAM
//     // =========================

//     const [examRows] = await connection.execute(
//       `
//         SELECT
//           total_marks,
//           passing_marks
//         FROM exams
//         WHERE exam_id = UUID_TO_BIN(?)
//         LIMIT 1
//         `,
//       [payload.exam_id],
//     );

//     const exam = examRows[0];

//     // =========================
//     // CALCULATE PERCENTAGE
//     // =========================

//     const percentage = (totalScore / Number(exam.total_marks)) * 100;

//     const resultStatus =
//       totalScore >= Number(exam.passing_marks) ? "PASS" : "FAIL";

//     // =========================
//     // CREATE ATTEMPT
//     // =========================

//     await connection.execute(
//       `
//       INSERT INTO exam_attempts (
//         attempt_id,
//         percentage,
//         result_status,
//         started_at,
//         status,
//         submitted_at,
//         time_spent_seconds,
//         total_score,
//         enrollment_id,
//         exam_id,
//         user_id
//       )
//       VALUES (
//         ?,
//         ?,
//         ?,
//         NOW(),
//         'SUBMITTED',
//         NOW(),
//         0,
//         ?,
//         ?,
//         ?,
//         ?
//       )
//       `,
//       [
//         attemptId,

//         percentage,

//         resultStatus,

//         totalScore,

//         enrollment.enrollment_id,

//         uuidToBuffer(payload.exam_id),

//         userId,
//       ],
//     );

//     // =========================
//     // COMPLETE ENROLLMENT
//     // =========================

//     await connection.execute(
//       `
//       UPDATE user_enrollments
//       SET status = 'COMPLETED'
//       WHERE enrollment_id = ?
//       `,
//       [enrollment.enrollment_id],
//     );

//     // =========================
//     // COMMIT
//     // =========================

//     await connection.commit();

//     return {
//       message: "Exam submitted successfully",

//       total_score: totalScore,

//       percentage,

//       result: resultStatus,
//     };
//   } catch (err) {
//     await connection.rollback();

//     throw err;
//   } finally {
//     connection.release();
//   }
// };

import { generateUUIDBuffer, uuidToBuffer } from "../../utils/uuid.js";

export const createExamService = async (payload, userId) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // =========================
    // VALIDATIONS
    // =========================

    if (!payload.questions?.length) {
      throw new Error("Questions required");
    }

    if (!payload.participants?.length) {
      throw new Error("Participants required");
    }

    if (!payload.domain_id) {
      throw new Error("Domain required");
    }

    // =========================
    // VALIDATE STUDENTS
    // =========================

    for (const studentId of payload.participants) {
      // CHECK STUDENT BELONGS TO TEACHER

      const [studentRows] = await connection.execute(
        `
          SELECT id
          FROM users
          WHERE id = ?
          AND created_by = ?
          AND type = 'CANDIDATE'
          LIMIT 1
          `,
        [studentId, userId],
      );

      if (!studentRows.length) {
        throw new Error(
          `Student ${studentId} does not belong to current teacher`,
        );
      }

      // CHECK ACTIVE ENROLLMENT

      const [existingEnrollment] = await connection.execute(
        `
          SELECT enrollment_id
          FROM user_enrollments
          WHERE user_id = ?
          AND status = 'ENROLLED'
          LIMIT 1
          `,
        [studentId],
      );

      if (existingEnrollment.length) {
        throw new Error(`Student ${studentId} already assigned to active exam`);
      }
    }

    // =========================
    // CREATE EXAM
    // =========================

    const examId = generateUUIDBuffer();

    await connection.execute(
      `
      INSERT INTO exams (
        exam_id,
        title,
        description,
        duration_minutes,
        total_marks,
        passing_marks,

        start_time,
        end_time,

        status,

        is_published,

        randomize_questions,
        randomize_options,

        allow_pause_resume,
        auto_submit_on_timeup,

        negative_marking,
        partial_marking_enabled,

        attempt_limit,
        allow_late_entry_minutes,

        created_at,
        updated_at,

        created_by,
        domain_id
      )
      VALUES (
        ?, ?, ?, ?, ?, ?,
        NOW(),
        DATE_ADD(
          NOW(),
          INTERVAL 1 DAY
        ),

        ?,

        1,

        1,
        1,

        1,
        1,

        ?,
        0,

        1,
        10,

        NOW(),
        NOW(),

        ?,
        ?
      )
      `,
      [
        examId,

        payload.title ?? "Generated Test",

        payload.description ?? "",

        Number(payload.duration_minutes ?? 60),

        Number(payload.total_marks ?? 100),

        Number(payload.passing_marks ?? 40),

        payload.status ?? "ACTIVE",

        Number(payload.negative_marking ?? 0),

        userId,

        uuidToBuffer(payload.domain_id),
      ],
    );

    // =========================
    // QUESTIONS
    // =========================

    for (let index = 0; index < payload.questions.length; index++) {
      const question = payload.questions[index];

      if (!question.options?.length) {
        throw new Error(`Options missing for question ${index + 1}`);
      }

      const questionId = generateUUIDBuffer();

      // =========================
      // CREATE QUESTION
      // =========================

      await connection.execute(
        `
        INSERT INTO questions (
          question_id,
          created_at,
          difficulty,
          explanation,
          is_active,
          marks,
          negative_marks,
          tags,
          text,
          type,
          updated_at,
          domain_id
        )
        VALUES (
          ?,
          NOW(),
          ?,
          ?,
          1,
          ?,
          ?,
          ?,
          ?,
          ?,
          NOW(),
          ?
        )
        `,
        [
          questionId,

          "EASY",

          question.explanation ?? "",

          Number(question.marks ?? 1),

          Number(question.negative_marks ?? 0),

          JSON.stringify(question.tags || []),

          question.text ?? "",

          question.type ?? "MCQ_SINGLE",

          uuidToBuffer(payload.domain_id),
        ],
      );

      // =========================
      // OPTIONS
      // =========================

      let correctFound = false;

      for (
        let optionIndex = 0;
        optionIndex < question.options.length;
        optionIndex++
      ) {
        const option = question.options[optionIndex];

        if (option.is_correct) {
          correctFound = true;
        }

        await connection.execute(
          `
          INSERT INTO question_options (
            option_id,
            is_correct,
            marks,
            sequence,
            text,
            question_id
          )
          VALUES (
            ?, ?, ?, ?, ?, ?
          )
          `,
          [
            generateUUIDBuffer(),

            option.is_correct ? 1 : 0,

            Number(option.marks ?? 0),

            Number(option.sequence ?? optionIndex + 1),

            option.text ?? "",

            questionId,
          ],
        );
      }

      if (!correctFound) {
        throw new Error(`No correct option in question ${index + 1}`);
      }

      // =========================
      // ATTACH QUESTION TO EXAM
      // =========================

      await connection.execute(
        `
        INSERT INTO exam_questions (
          exam_id,
          question_id,
          marks_override,
          sequence,
          section_id
        )
        VALUES (
          ?, ?, ?, ?, ?
        )
        `,
        [examId, questionId, Number(question.marks ?? 1), index + 1, null],
      );
    }

    // =========================
    // ENROLL STUDENTS
    // =========================

    for (const studentId of payload.participants) {
      await connection.execute(
        `
        INSERT INTO user_enrollments (
          enrollment_id,
          attempts_used,
          created_at,
          enrolled_at,
          expires_at,
          has_attempted,
          status,
          updated_at,
          exam_id,
          user_id
        )
        VALUES (
          ?,
          0,
          NOW(),
          NOW(),
          NULL,
          0,
          'ENROLLED',
          NOW(),
          ?,
          ?
        )
        `,
        [generateUUIDBuffer(), examId, studentId],
      );
    }

    // =========================
    // COMMIT
    // =========================

    await connection.commit();

    return {
      message: "Exam created successfully",
    };
  } catch (err) {
    await connection.rollback();

    throw err;
  } finally {
    connection.release();
  }
};

export const deleteExamService = async (examId, userId) => {
  const result = await deleteExamRepo(examId, userId);

  if (!result.affectedRows) {
    throw new Error("Exam not found or access denied");
  }

  return {
    message: "Exam deleted successfully",
  };
};

export const updateExamService = async (examId, payload, userId) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    await updateExamRepo(examId, payload, userId, connection);

    // Remove current enrollments

    await connection.execute(
      `
        DELETE FROM user_enrollments
        WHERE exam_id =
          UUID_TO_BIN(?)
        `,
      [examId],
    );

    // Add selected students

    for (const studentId of payload.participants) {
      await connection.execute(
        `
          INSERT INTO user_enrollments(
            enrollment_id,
            exam_id,
            user_id,
            status,
            attempts_used,
            has_attempted,
            created_at,
            updated_at,
            enrolled_at
          )
          VALUES(
            ?,
            UUID_TO_BIN(?),
            ?,
            'ENROLLED',
            0,
            0,
            NOW(),
            NOW(),
            NOW()
          )
          `,
        [generateUUIDBuffer(), examId, studentId],
      );
    }

    await connection.commit();

    return {
      message: "Exam updated successfully",
    };
  } catch (err) {
    await connection.rollback();

    throw err;
  } finally {
    connection.release();
  }
};
