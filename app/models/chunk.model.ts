import mongoose, { Schema, Document } from "mongoose";
import { IChunk } from "../types/chunking.type";


const chunkSchema = new Schema<IChunk>(
    {
        documentId: { type: Schema.Types.ObjectId, ref: "Document", required: true, index: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        documentName: { type: String, required: true },
        chunkIndex: { type: Number, required: true },
        text: { type: String, required: true },
        embedding: { type: [Number], required: true }
    },
    { timestamps: true }
);

export const Chunk = mongoose.model<IChunk>("Chunk", chunkSchema);
