import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createConversationSchema = z.object({
    documentId: z
        .string()
        .regex(objectIdRegex, "Invalid document ID format")
});

export const sendMessageSchema = z.object({
    content: z
        .string()
        .min(1, "Message cannot be empty")
        .max(4000, "Message must be at most 4000 characters long")
});

export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20)
});

export const cursorPaginationSchema = z.object({
    cursor: z.string().regex(objectIdRegex, "Invalid cursor ID").optional(),
    limit: z.coerce.number().int().min(1).max(50).default(30)
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
