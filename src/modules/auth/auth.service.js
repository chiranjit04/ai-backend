import bcrypt from "bcrypt";
import { insertUser, findUserByEmail } from "./auth.repository.js";
import jwt from "jsonwebtoken";
import { ROLES, ROLE_MAP } from "../../constants/role.js";

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