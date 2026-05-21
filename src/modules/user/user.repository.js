import db from "../../config/db.js";

export const getStudentsByTeacher = async (teacherId) => {
  const [rows] = await db.execute(
    `SELECT id, first_name, last_name, email 
     FROM users 
     WHERE created_by = ? 
     AND type = 'CANDIDATE' 
     AND deleted = 0`,
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