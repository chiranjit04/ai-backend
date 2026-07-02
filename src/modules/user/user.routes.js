import { Router } from "express";
import { getMyStudents, getTeachers,deleteStudent } from "./user.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/students", authMiddleware, getMyStudents);
router.get("/teachers", authMiddleware, getTeachers);
router.delete("/students/:id", authMiddleware, deleteStudent);

export default router;