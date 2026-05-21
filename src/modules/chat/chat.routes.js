import { Router } from "express";
import { chatHandler } from "./chat.controller.js";
import { upload } from "../../middlewares/upload.middleware.js";

const router = Router();

router.post("/", upload.single("file"), chatHandler);

export default router;