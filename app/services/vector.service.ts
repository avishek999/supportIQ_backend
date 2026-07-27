import mongoose from "mongoose";
import { Chunk } from "../models/chunk.model";
import { EmbeddingService } from "./embedding.service";

// If a document has fewer than this many chunks, return ALL chunks
// instead of doing vector search (avoids missing context in small docs)
const SMALL_DOC_THRESHOLD = 15;

// Chunks with a similarity score below this are considered irrelevant
// and won't be sent to the LLM (prevents noisy/misleading context)
const MIN_RELEVANCE_SCORE = 0.5;

export class VectorService {
    /**
     * Retrieves relevant chunks for a question against a specific document.
     * - Small documents (≤15 chunks): returns ALL chunks for full context.
     * - Large documents: uses vector search to find the top-k most relevant chunks,
     *   then filters out any chunk below the minimum relevance score.
     */
    static async findRelevantChunks(
        question: string,
        documentId: string
    ): Promise<string[]> {
        try {
            const docObjectId = new mongoose.Types.ObjectId(documentId);

            // 1. Check total chunk count for this document
            const totalChunks = await Chunk.countDocuments({ documentId: docObjectId });

            if (totalChunks === 0) return [];

            // 2. Small doc → return all chunks in order (full context)
            if (totalChunks <= SMALL_DOC_THRESHOLD) {
                const allChunks = await Chunk.find({ documentId: docObjectId })
                    .sort({ chunkIndex: 1 })
                    .select({ text: 1, _id: 0 })
                    .lean();

                return allChunks.map((chunk: any) => chunk.text);
            }

            // 3. Large doc → vector search for top-k relevant chunks
            const questionEmbedding = await EmbeddingService.generateEmbedding(question);

            const searchResults = await Chunk.aggregate([
                {
                    $search: {
                        index: "vector_index",
                        knnBeta: {
                            vector: questionEmbedding,
                            path: "embedding",
                            k: 5,
                            filter: {
                                equals: {
                                    path: "documentId",
                                    value: docObjectId
                                }
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        text: 1,
                        chunkIndex: 1,
                        score: { $meta: "searchScore" }
                    }
                }
            ]);

            // 4. Filter out low-relevance chunks — only keep genuinely relevant ones
            const relevantResults = searchResults.filter(
                (result: any) => result.score >= MIN_RELEVANCE_SCORE
            );

            return relevantResults.map((result: any) => result.text);
        } catch (error: any) {
            console.error("Vector search error:", error);
            throw new Error(`Failed to perform vector search: ${error.message}`);
        }
    }
}
