import db from "../../config/db.js";

export const findUserByEmail = async (email) => {
  const [rows] = await db.execute(
    "SELECT * FROM users WHERE email=? AND deleted=0",
    [email]
  );
  return rows[0];
};

export const insertUser = async (user) => {
  const [res] = await db.execute(
    `INSERT INTO users 
    (first_name, last_name, email, password, type, is_active, deleted, created_by)
    VALUES (?, ?, ?, ?, ?, 1, 0, ?)`,
    [
      user.first_name,
      user.last_name,
      user.email,
      user.password,
      user.type,
      user.created_by || null,
    ]
  );

  return { id: res.insertId, ...user };
};