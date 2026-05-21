import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import userRoutes from "../modules/user/user.routes.js";
import examRoutes from "../modules/exam/exam.routes.js";
import chatRoutes from "../modules/chat/chat.routes.js";
import questionRoutes from "../modules/question/question.routes.js";
import domainRoutes from "../modules/domains/domain.routes.js";

const router = Router();

router.use("/users", userRoutes);
router.use("/domains", domainRoutes);

router.use("/chat", chatRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/exam", examRoutes);
router.use("/question", questionRoutes);

export default router;
