import { Router } from "express";
import { createQuestion } from "./question.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { allowRoles} from "../../middlewares/role.middleware.js";

const router = Router();

router.post(
  "/create",
  authMiddleware,
  allowRoles("ADMIN", "TUTOR"),
  createQuestion
);

export default router;