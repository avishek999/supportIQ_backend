import mongoose from "mongoose";
import { Conversation } from "../models/conversation.model";
import { Message } from "../models/message.model";
import { DocumentModel } from "../models/document.model";
import { VectorService } from "./vector.service";
import { ChatService } from "./chat.service";
import { ChatMessage } from "../types/conversation.type";

// Max number of prior messages to include as conversation history for the LLM
const MAX_HISTORY_MESSAGES = 10;

export class ConversationService {
    /**
     * Creates a new conversation linked to a document.
     * Sets the title to the document's filename.
     */
    static async createConversation(userId: string, documentId: string) {
        // Verify document exists and belongs to this user
        const document = await DocumentModel.findOne({
            _id: documentId,
            userId
        });

        if (!document) {
            throw new Error("Document not found or you don't have access to it");
        }

        const conversation = await Conversation.create({
            userId: new mongoose.Types.ObjectId(userId),
            documentId: new mongoose.Types.ObjectId(documentId),
            title: document.title,
            lastMessageAt: new Date()
        });

        return conversation;
    }

    /**
     * Returns a paginated list of the user's conversations,
     * sorted by most recently active first (for the left sidebar).
     */
    static async getUserConversations(userId: string, page: number, limit: number) {
        const skip = (page - 1) * limit;

        const [conversations, total] = await Promise.all([
            Conversation.find({ userId })
                .sort({ lastMessageAt: -1 })
                .skip(skip)
                .limit(limit)
                .select({ userId: 0, __v: 0 })
                .lean(),
            Conversation.countDocuments({ userId })
        ]);

        return {
            conversations,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: page * limit < total
            }
        };
    }

    /**
     * Returns messages for a conversation with cursor-based pagination.
     * Loads older messages (scrolling up) — newest messages first when no cursor.
     */
    static async getMessages(
        conversationId: string,
        userId: string,
        cursor?: string,
        limit: number = 30
    ) {
        // Verify conversation belongs to this user
        const conversation = await Conversation.findOne({
            _id: conversationId,
            userId
        });

        if (!conversation) {
            throw new Error("Conversation not found or you don't have access to it");
        }

        // Build query — if cursor provided, load messages older than cursor
        const query: any = { conversationId: new mongoose.Types.ObjectId(conversationId) };
        if (cursor) {
            query._id = { $lt: new mongoose.Types.ObjectId(cursor) };
        }

        const messages = await Message.find(query)
            .sort({ _id: -1 }) // Newest first (frontend reverses for display)
            .limit(limit + 1) // Fetch one extra to check if there are more
            .select({ conversationId: 0, __v: 0 })
            .lean();

        const hasMore = messages.length > limit;
        if (hasMore) messages.pop(); // Remove the extra one

        return {
            messages: messages.reverse(), // Return in chronological order
            pagination: {
                nextCursor: hasMore ? messages[0]?._id?.toString() : null,
                hasMore
            }
        };
    }

    /**
     * Core conversation flow:
     * 1. Save user's message
     * 2. Load conversation history
     * 3. Vector search the linked document
     * 4. Call LLM with context + history
     * 5. Save AI's response
     * 6. Update lastMessageAt
     */
    static async sendMessage(conversationId: string, userId: string, content: string) {
        // Verify conversation belongs to this user
        const conversation = await Conversation.findOne({
            _id: conversationId,
            userId
        });

        if (!conversation) {
            throw new Error("Conversation not found or you don't have access to it");
        }

        // 1. Save user's message
        const userMessage = await Message.create({
            conversationId: new mongoose.Types.ObjectId(conversationId),
            role: "user",
            content
        });

        // 2. Load recent conversation history (for LLM context)
        const recentMessages = await Message.find({
            conversationId: new mongoose.Types.ObjectId(conversationId),
            _id: { $lt: userMessage._id } // Messages before the current one
        })
            .sort({ _id: -1 })
            .limit(MAX_HISTORY_MESSAGES)
            .lean();

        // Convert to ChatMessage format in chronological order
        const history: ChatMessage[] = recentMessages
            .reverse()
            .map((msg) => ({
                role: msg.role as "user" | "assistant",
                content: msg.content
            }));

        // 3. Vector search the linked document for relevant context
        const contextChunks = await VectorService.findRelevantChunks(
            content,
            conversation.documentId.toString()
        );

        // 4. Call LLM with context + conversation history
        const { answer } = await ChatService.generateConversationAnswer(
            content,
            contextChunks,
            history
        );

        // 5. Save AI's response
        const aiMessage = await Message.create({
            conversationId: new mongoose.Types.ObjectId(conversationId),
            role: "assistant",
            content: answer
        });

        // 6. Update lastMessageAt on the conversation
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessageAt: new Date()
        });

        return { userMessage, aiMessage };
    }
}
