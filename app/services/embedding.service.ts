import { pipeline } from "@huggingface/transformers";

export class EmbeddingService {
    private static extractor: any = null;

    /**
     * Initializes the feature extraction pipeline (bge-small-en-v1.5 model).
     * Downloads & caches the model on first call (~60MB), then reuses it instantly in memory.
     */
    private static async getExtractor() {
        if (!this.extractor) {
            this.extractor = await pipeline(
                "feature-extraction",
                "Xenova/bge-small-en-v1.5"
            );
        }
        return this.extractor;
    }

    /**
     * Generates a 384-dimensional vector embedding for a given text string.
     */
    static async generateEmbedding(text: string): Promise<number[]> {
        try {
            const extractor = await this.getExtractor();
            const output = await extractor(text, {
                pooling: "mean",
                normalize: true
            });

            // Convert Float32Array tensor to standard JavaScript number array
            return Array.from(output.data);
        } catch (error: any) {
            console.error("Embedding generation error:", error);
            throw new Error(`Failed to generate embedding: ${error.message}`);
        }
    }
}
