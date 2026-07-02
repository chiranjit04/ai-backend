import db from "../../config/db.js";

export const deleteStudentRepo =
  async (userId) => {

    await db.execute(
      `
      UPDATE users
      SET deleted = 1
      WHERE id = ?
      AND type = 'CANDIDATE'
      `,
      [userId]
    );
  };

  export const deleteStudentService =
  async (userId) => {

    await deleteStudentRepo(
      userId
    );

    return {
      message:
        "Student deleted successfully",
    };
  };

export const getStudentsByTeacher = async (teacherId) => {

  const [rows] = await db.execute(
    `
    SELECT
      u.id,
      u.first_name,
      u.last_name,
      u.email,

      CASE
        WHEN COUNT(e.exam_id) > 0
        THEN 1
        ELSE 0
      END AS assigned

    FROM users u

    LEFT JOIN user_enrollments ue
      ON ue.user_id = u.id
      AND ue.status IN (
        'ENROLLED',
        'IN_PROGRESS'
      )

    LEFT JOIN exams e
      ON ue.exam_id = e.exam_id
      AND e.deleted = 0

    WHERE u.created_by = ?
      AND u.type = 'CANDIDATE'
      AND u.deleted = 0

    GROUP BY
      u.id,
      u.first_name,
      u.last_name,
      u.email

    ORDER BY u.first_name
    `,
    [teacherId]
  );

  return rows;
};

export const getTeachersRepo = async () => {
  const [rows] = await db.execute(
    `
    SELECT
      id,
      first_name,
      last_name,
      email,
      mobile_number,
      created_at
    FROM users
    WHERE type = 'TUTOR'
    AND deleted = 0
    ORDER BY created_at DESC
    `
  );

  return rows;
};