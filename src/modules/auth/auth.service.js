import bcrypt from "bcrypt";
import {
  insertUser,
  findUserByEmail,
  getResetTokenRepo,
  updatePasswordRepo,
  deleteResetTokenRepo,
  saveResetTokenRepo
} from "./auth.repository.js";
import jwt from "jsonwebtoken";
import { ROLES, ROLE_MAP } from "../../constants/role.js";
import crypto from "crypto";

export const forgotPasswordService =
  async (email) => {

    const user =
      await findUserByEmail(
        email
      );

    if (!user) {

      throw new Error(
        "Email not found"
      );
    }

    const token =
      crypto
        .randomBytes(32)
        .toString("hex");

    await saveResetTokenRepo(
      user.id,
      token
    );

    return {
      token,
    };
  };

export const resetPasswordService =
  async (
    token,
    password
  ) => {

    const reset =
      await getResetTokenRepo(
        token
      );

    if (!reset) {

      throw new Error(
        "Invalid or expired token"
      );
    }

    const hash =
      await bcrypt.hash(
        password,
        10
      );

    await updatePasswordRepo(
      reset.user_id,
      hash
    );

    await deleteResetTokenRepo(
      token
    );

    return {
      message:
        "Password updated successfully",
    };
  };

export const registerUser = async ({
  first_name,
  last_name,
  email,
  password,
  type,
  creator,
}) => {

  const typeMap = {
    admin: "ADMIN",
    teacher: "TUTOR",
    student: "CANDIDATE",
  };

  const normalizedType = type?.toLowerCase().trim();

  if (!typeMap[normalizedType]) {
    throw new Error("Invalid user type");
  }

   const dbType = ROLE_MAP[normalizedType]; // ✅ FINAL VALUE

  // 🚨 ROLE RULES
  if (creator.type === ROLES.TUTOR && dbType !== ROLES.CANDIDATE) {
    throw new Error("Not allowed");
  }

  if (creator.type === ROLES.ADMIN && dbType !== ROLES.TUTOR) {
    throw new Error("Not allowed");
  }

  // 🔐 HASH PASSWORD
  const hashed = await bcrypt.hash(password, 10);

  // 🚨 IMPORTANT FIX HERE 👇
  const user = await insertUser({
    first_name,
    last_name,
    email,
    password: hashed,
    type: dbType, // ✅ MUST BE dbType (NOT type)
    created_by: dbType === ROLES.CANDIDATE
        ? creator.id
        : null,
  });

  return user;
};

export const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email);

  if (!user) throw new Error("User not found");

  if (!user.is_active) throw new Error("User inactive");

  const match = await bcrypt.compare(password, user.password);

  if (!match) throw new Error("Invalid password");
  
  const token = jwt.sign(
    { id: user.id, type: user.type },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return { token, user };
};