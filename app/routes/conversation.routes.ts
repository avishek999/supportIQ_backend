import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware";
import {
    createConversation,
    getUserConversations,
    getConversationMessages,
    sendMessage
} from "../controller/conversation.controller";

const router = Router();

// POST   /api/conversations                          → Create new conversation
router.post("/", authenticateUser, createConversation);

// GET    /api/conversations                          → List user's conversations (paginated)
router.get("/", authenticateUser, getUserConversations);

// GET    /api/conversations/:conversationId/messages  → Get messages (cursor paginated)
router.get("/:conversationId/messages", authenticateUser, getConversationMessages);

// POST   /api/conversations/:conversationId/messages  → Send message & get AI response
router.post("/:conversationId/messages", authenticateUser, sendMessage);

export default router;
