import { Response } from "express";
import { AuthenticatedRequest } from "../types/user.types";
import { ConversationService } from "../services/conversation.service";
import {
    createConversationSchema,
    sendMessageSchema,
    paginationSchema,
    cursorPaginationSchema
} from "../dto/conversation.dto";

/**
 * POST /api/conversations — Create a new conversation linked to a document
 */
export const createConversation = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized user" });
        }

        const { documentId } = createConversationSchema.parse(req.body);
        const conversation = await ConversationService.createConversation(req.user.id, documentId);

        return res.status(201).json({
            message: "Conversation created successfully",
            data: conversation
        });
    } catch (error: any) {
        if (error.name === "ZodError") {
            return res.status(400).json({ message: "Validation error", errors: error.errors });
        }
        if (error.message.includes("not found")) {
            return res.status(404).json({ message: error.message });
        }
        return res.status(500).json({ message: error.message || "Failed to create conversation" });
    }
};

/**
 * GET /api/conversations — List user's conversations with offset pagination
 */
export const getUserConversations = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized user" });
        }

        const { page, limit } = paginationSchema.parse(req.query);
        const result = await ConversationService.getUserConversations(req.user.id, page, limit);

        return res.status(200).json({
            message: "Conversations retrieved successfully",
            data: result
        });
    } catch (error: any) {
        if (error.name === "ZodError") {
            return res.status(400).json({ message: "Validation error", errors: error.errors });
        }
        return res.status(500).json({ message: error.message || "Failed to fetch conversations" });
    }
};

/**
 * GET /api/conversations/:conversationId/messages — Get messages with cursor pagination
 */
export const getConversationMessages = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized user" });
        }

        const conversationId = req.params.conversationId as string;
        const { cursor, limit } = cursorPaginationSchema.parse(req.query);

        const result = await ConversationService.getMessages(
            conversationId,
            req.user.id,
            cursor,
            limit
        );

        return res.status(200).json({
            message: "Messages retrieved successfully",
            data: result
        });
    } catch (error: any) {
        if (error.name === "ZodError") {
            return res.status(400).json({ message: "Validation error", errors: error.errors });
        }
        if (error.message.includes("not found")) {
            return res.status(404).json({ message: error.message });
        }
        return res.status(500).json({ message: error.message || "Failed to fetch messages" });
    }
};

/**
 * POST /api/conversations/:conversationId/messages — Send a message and get AI response
 */
export const sendMessage = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized user" });
        }

        const conversationId = req.params.conversationId as string;
        const { content } = sendMessageSchema.parse(req.body);

        const result = await ConversationService.sendMessage(
            conversationId,
            req.user.id,
            content
        );

        return res.status(200).json({
            message: "Message sent successfully",
            data: result
        });
    } catch (error: any) {
        if (error.name === "ZodError") {
            return res.status(400).json({ message: "Validation error", errors: error.errors });
        }
        if (error.message.includes("not found")) {
            return res.status(404).json({ message: error.message });
        }
        return res.status(500).json({ message: error.message || "Failed to send message" });
    }
};
