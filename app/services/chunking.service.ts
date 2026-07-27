import { ChunkOptions } from "../types/chunking.type";


export class ChunkingService {
    /**
     * Splits a raw text string into smaller overlapping chunks.
     */
    static createChunks(text: string, options: ChunkOptions = {}): string[] {
        const chunkSize = options.chunkSize || 500;
        const chunkOverlap = options.chunkOverlap || 100;

        // Clean & normalize whitespace
        const cleanedText = text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
        if (!cleanedText) return [];

        const chunks: string[] = [];
        let startIndex = 0;

        while (startIndex < cleanedText.length) {
            let endIndex = startIndex + chunkSize;

            // If we're not at the very end of the text, try to break cleanly at a space or newline
            if (endIndex < cleanedText.length) {
                const lastSpace = cleanedText.lastIndexOf(" ", endIndex);
                if (lastSpace > startIndex) {
                    endIndex = lastSpace; // End chunk at the last word boundary
                }
            }

            const chunk = cleanedText.slice(startIndex, endIndex).trim();
            if (chunk.length > 0) {
                chunks.push(chunk);
            }

            // Move forward by chunkSize - chunkOverlap
            startIndex = endIndex - chunkOverlap;

            // Prevent infinite loop if overlap >= chunkSize
            if (startIndex >= endIndex) {
                startIndex = endIndex;
            }
        }

        return chunks;
    }
}
