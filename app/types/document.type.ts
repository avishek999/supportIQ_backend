import mongoose, { Document } from "mongoose";

export interface IDocument extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    mimeType: string;
    totalChunks: number;
}

export interface ProcessedChunk {
    chunkIndex: number;
    text: string;
    characterCount: number;
}

export interface ProcessedDocumentResult {
    documentId: string;
    filename: string;
    mimeType: string;
    totalCharacters: number;
    totalChunks: number;
    chunks: ProcessedChunk[];
}



