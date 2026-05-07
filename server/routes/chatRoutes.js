import { Router } from "express";
import validateChat from "../middleware/validateChat.js";
import chatController from "../controllers/chatController.js";

const router = Router();

router.post("/chat", validateChat, chatController);

export default router;
