import mongoose, { Schema } from "mongoose";
import { IMessage } from "../types/conversation.type";

const messageSchema = new Schema<IMessage>(
    {
        conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
        role: { type: String, enum: ["user", "assistant"], required: true },
        content: { type: String, required: true }
    },
    { timestamps: true }
);

export const Message = mongoose.model<IMessage>("Message", messageSchema);
