import mongoose, { Document } from "mongoose";

export interface IConversation extends Document {
    userId: mongoose.Types.ObjectId;
    documentId: mongoose.Types.ObjectId;
    title: string;
    lastMessageAt: Date;
}

export interface IMessage extends Document {
    conversationId: mongoose.Types.ObjectId;
    role: "user" | "assistant";
    content: string;
}

export interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}
