import mongoose, { Schema } from "mongoose";
import { IConversation } from "../types/conversation.type";

const conversationSchema = new Schema<IConversation>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        documentId: { type: Schema.Types.ObjectId, ref: "Document", required: true },
        title: { type: String, required: true },
        lastMessageAt: { type: Date, default: Date.now, index: true }
    },
    { timestamps: true }
);

// Compound index for efficient user conversation listing sorted by recency
conversationSchema.index({ userId: 1, lastMessageAt: -1 });

export const Conversation = mongoose.model<IConversation>("Conversation", conversationSchema);
