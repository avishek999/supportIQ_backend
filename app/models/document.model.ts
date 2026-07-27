import mongoose, { Schema, Document } from "mongoose";
import { IDocument } from "../types/document.type";

const documentSchema = new Schema<IDocument>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        title: { type: String, required: true },
        mimeType: { type: String, required: true },
        totalChunks: { type: Number, default: 0 }
    },
    { timestamps: true }
);
export const DocumentModel = mongoose.model<IDocument>("Document", documentSchema);