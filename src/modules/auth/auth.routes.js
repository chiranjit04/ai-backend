import { Router } from "express";
import { register, login, resetPassword, forgotPassword } from "./auth.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/role.middleware.js";

const router = Router();

router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/reset-password",
  resetPassword
);

// ✅ PUBLIC LOGIN
router.post("/login", login);

// ✅ ADMIN can create TUTOR
router.post("/register", authMiddleware, allowRoles("ADMIN", "TUTOR"), register);

export default router;