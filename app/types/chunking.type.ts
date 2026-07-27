import mongoose from "mongoose";

export interface ChunkOptions {
    chunkSize?: number;     // Maximum characters per chunk (default: 500)
    chunkOverlap?: number;  // Character overlap between adjacent chunks (default: 100)
}

export interface IChunk extends Document {
    documentId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    documentName: string;
    chunkIndex: number;
    text: string;
    embedding: number[];
}