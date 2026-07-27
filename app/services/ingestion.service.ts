import mongoose from "mongoose";
import { DocumentService } from "./document.service";
import { ChunkingService } from "./chunking.service";
import { EmbeddingService } from "./embedding.service";
import { DocumentModel } from "../models/document.model";
import { Chunk } from "../models/chunk.model";
import { TextCleanerHelper } from "../helpers/textCleaner.helper";
import { ProcessedDocumentResult } from "../types/document.type";
import { UploadOptionsDTO } from "../dto/document.dto";

export class IngestionService {
    /**
     * Complete RAG Ingestion Pipeline: Extract -> Sanitize -> Chunk -> Create Document -> Embed -> Save Chunks
     */
    static async processUploadedFile(
        file: Express.Multer.File,
        options: UploadOptionsDTO,
        userId: string
    ): Promise<ProcessedDocumentResult> {
        // 1. Extract raw text from file
        const rawText = await DocumentService.extractTextFromFile(file.buffer, file.mimetype);

        // 2. Sanitize text
        const cleanText = TextCleanerHelper.sanitize(rawText);

        // 3. Chunk text
        const rawChunks = ChunkingService.createChunks(cleanText, options);

        // 4. Create Parent Document Record in MongoDB
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const document = await DocumentModel.create({
            userId: userObjectId,
            title: file.originalname,
            mimeType: file.mimetype,
            totalChunks: rawChunks.length
        });

        // 5. Generate Embeddings for each chunk & save
        const chunkDocs = [];
        const processedChunks = [];

        for (let i = 0; i < rawChunks.length; i++) {
            const text = rawChunks[i];

            // Generate 384-dimensional vector embedding
            const embedding = await EmbeddingService.generateEmbedding(text);

            chunkDocs.push({
                documentId: document._id,
                userId: userObjectId,
                documentName: file.originalname,
                chunkIndex: i,
                text,
                embedding
            });

            processedChunks.push({
                chunkIndex: i,
                text,
                characterCount: text.length
            });
        }

        // 6. Bulk-save all chunks with embeddings into MongoDB Atlas
        await Chunk.insertMany(chunkDocs);

        return {
            documentId: document._id.toString(),
            filename: file.originalname,
            mimeType: file.mimetype,
            totalCharacters: cleanText.length,
            totalChunks: processedChunks.length,
            chunks: processedChunks
        };
    }

    /**
     * Complete RAG Ingestion Pipeline for Website URLs: Fetch HTML -> Extract Text -> Sanitize -> Chunk -> Create Document -> Embed -> Save Chunks
     */
    static async processWebsiteUrl(
        url: string,
        options: { chunkSize?: number; chunkOverlap?: number },
        userId: string
    ): Promise<ProcessedDocumentResult> {
        // 1. Fetch & extract text from web page
        const { title, text: rawText } = await DocumentService.extractTextFromUrl(url);

        // 2. Sanitize text
        const cleanText = TextCleanerHelper.sanitize(rawText);

        // 3. Chunk text
        const rawChunks = ChunkingService.createChunks(cleanText, options);

        // 4. Create Parent Document Record in MongoDB
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const document = await DocumentModel.create({
            userId: userObjectId,
            title,
            mimeType: "text/url",
            totalChunks: rawChunks.length
        });

        // 5. Generate Embeddings for each chunk & save
        const chunkDocs = [];
        const processedChunks = [];

        for (let i = 0; i < rawChunks.length; i++) {
            const chunkText = rawChunks[i];

            // Generate 384-dimensional vector embedding
            const embedding = await EmbeddingService.generateEmbedding(chunkText);

            chunkDocs.push({
                documentId: document._id,
                userId: userObjectId,
                documentName: title,
                chunkIndex: i,
                text: chunkText,
                embedding
            });

            processedChunks.push({
                chunkIndex: i,
                text: chunkText,
                characterCount: chunkText.length
            });
        }

        // 6. Bulk-save all chunks with embeddings into MongoDB Atlas
        await Chunk.insertMany(chunkDocs);

        return {
            documentId: document._id.toString(),
            filename: title,
            mimeType: "text/url",
            totalCharacters: cleanText.length,
            totalChunks: processedChunks.length,
            chunks: processedChunks
        };
    }
}
