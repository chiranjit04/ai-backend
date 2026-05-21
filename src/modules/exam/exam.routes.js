import { Router } from "express";

import {
  getExamList,
  createExam,
  assignStudents,
  addQuestions,
  myExams,
  getExamQuestions,
  getMyExam
} from "./exam.controller.js";

import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/role.middleware.js";

const router = Router();

router.get(
  "/my-exam",
  authMiddleware,
  getMyExam
);

router.get("/listOfExams", authMiddleware, allowRoles("ADMIN", "TUTOR"), getExamList);

router.post(
  "/questions",
  authMiddleware,
  getExamQuestions
);

router.post(
  "/create",
  authMiddleware,
  allowRoles("ADMIN", "TUTOR"),
  createExam
);

router.post("/", authMiddleware, createExam);

router.post(
  "/assign",
  authMiddleware,
  allowRoles("ADMIN", "TUTOR"),
  assignStudents
);

router.post(
  "/questions",
  authMiddleware,
  allowRoles("ADMIN", "TUTOR"),
  addQuestions
);

router.get(
  "/my-exams",
  authMiddleware,
  allowRoles("ADMIN", "TUTOR"),
  myExams
);

export default router;