import db from "../../config/db.js";

export const saveResetTokenRepo =
  async (
    userId,
    token
  ) => {

    await db.execute(
      `
      INSERT INTO
      password_resets
      (
        user_id,
        token,
        expires_at
      )
      VALUES
      (
        ?,
        ?,
        DATE_ADD(
          NOW(),
          INTERVAL 15 MINUTE
        )
      )
      `,
      [
        userId,
        token,
      ]
    );
  };

export const getResetTokenRepo =
  async (token) => {

    const [rows] =
      await db.execute(
        `
        SELECT
          user_id
        FROM password_resets
        WHERE token = ?
        AND expires_at > NOW()
        LIMIT 1
        `,
        [token]
      );

    return rows[0];
  };

  export const updatePasswordRepo =
  async (
    userId,
    hash
  ) => {

    await db.execute(
      `
      UPDATE users
      SET password = ?
      WHERE id = ?
      `,
      [
        hash,
        userId,
      ]
    );
  };

  export const deleteResetTokenRepo =
  async (token) => {

    await db.execute(
      `
      DELETE FROM password_resets
      WHERE token = ?
      `,
      [token]
    );
  };

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