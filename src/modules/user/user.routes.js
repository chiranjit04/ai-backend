import { Router } from "express";
import { getMyStudents, getTeachers } from "./user.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/students", authMiddleware, getMyStudents);
router.get("/teachers", authMiddleware, getTeachers);

export default router;