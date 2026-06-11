import { Router } from "express";

import {
  getExamList,
  createExam,
  getMyExam,
  submitExam,
  deleteExam,
  updateExam,
  getStudentExam,
  getExamQuestions
} from "./exam.controller.js";

import { authMiddleware } from "../../middlewares/auth.middleware.js";

import { allowRoles } from "../../middlewares/role.middleware.js";

const router = Router();

// =========================
// SUBMIT EXAM
// =========================

router.post(
  "/submitExam",
  authMiddleware,
  submitExam
);


// =========================
// STUDENT EXAM QUESTIONS
// =========================

router.get(
  "/:examId/questions",
  authMiddleware,
  getExamQuestions
);

// =========================
// CURRENT EXAM
// =========================

router.get(
  "/student/current",
  authMiddleware,
  getStudentExam
);

// =========================
// CREATE EXAM
// =========================

router.post(
  "/create",
  authMiddleware,
  allowRoles("ADMIN", "TUTOR"),
  createExam
);

// =========================
// GET ASSIGNED EXAM
// =========================

router.get(
  "/my-exam",
  authMiddleware,
  getMyExam
);

// =========================
// GET ALL EXAMS
// =========================

router.get(
  "/listOfExams",
  authMiddleware,
  allowRoles("ADMIN", "TUTOR"),
  getExamList
);

// ==============
// DELETE EXAM
// ==============

router.delete(
  "/:examId",
  authMiddleware,
  allowRoles(
    "ADMIN",
    "TUTOR"
  ),
  deleteExam
);

// =========================
// UPDATE EXAM
// =========================

router.put(
  "/:examId",
  authMiddleware,
  allowRoles("ADMIN", "TUTOR"),
  updateExam
);


export default router;