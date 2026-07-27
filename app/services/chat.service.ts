import Groq from "groq-sdk";
import { GROQ_API_KEY } from "../utils/config";
import { ChatMessage } from "../types/conversation.type";

const groq = new Groq({ apiKey: GROQ_API_KEY });

const SYSTEM_PROMPT = `You are SupportIQ — a professional document assistant.
Your job is to answer the user's question accurately using ONLY the provided document context.

Rules:
1. Answer STRICTLY based on the provided document context. Do NOT use outside knowledge or assumptions.
2. Speak directly and naturally to the user.
3. CRITICAL: NEVER mention internal implementation words such as "Chunk", "Chunk 1", "Chunk 7", "provided context", "provided document", "excerpt", or "according to the text".
4. Do NOT include unsolicited meta-advice or closing remarks like "To further evaluate...", "You may also consider...", or "Note that...".
5. If the document does not contain enough information to answer, simply state: "I couldn't find an answer to that question in the document."
6. Use clean formatting (bullet points, bold text) for readability.`;

export class ChatService {
    private static readonly MODEL = "llama-3.3-70b-versatile";

    /**
     * Builds a RAG prompt from context chunks and the user's question,
     * then calls the Groq LLM for a grounded answer.
     * Used by the standalone /api/query/ask endpoint.
     */
    static async generateAnswer(
        question: string,
        contextChunks: string[]
    ): Promise<{ answer: string; model: string }> {
        if (!GROQ_API_KEY) {
            throw new Error("GROQ_API_KEY is not configured in environment variables");
        }

        const contextBlock = contextChunks
            .map((chunk) => `---\n${chunk}`)
            .join("\n\n");

        const messages: ChatMessage[] = [
            { role: "system", content: SYSTEM_PROMPT },
            {
                role: "user",
                content: `Document Excerpts:\n\n${contextBlock}\n\n---\n\nUser Question: ${question}`
            }
        ];

        return this.callGroq(messages);
    }

    /**
     * Generates an answer with full conversation history.
     * Injects document context into the system prompt so the LLM can reference
     * both prior messages and document content for context-aware replies.
     * Used by the conversation /api/conversations/:id/messages endpoint.
     */
    static async generateConversationAnswer(
        question: string,
        contextChunks: string[],
        history: ChatMessage[]
    ): Promise<{ answer: string; model: string }> {
        if (!GROQ_API_KEY) {
            throw new Error("GROQ_API_KEY is not configured in environment variables");
        }

        const contextBlock = contextChunks
            .map((chunk) => `---\n${chunk}`)
            .join("\n\n");

        const systemWithContext = `${SYSTEM_PROMPT}\n\n--- Document Knowledge ---\n\n${contextBlock}`;

        const messages: ChatMessage[] = [
            { role: "system", content: systemWithContext },
            ...history,
            { role: "user", content: question }
        ];

        return this.callGroq(messages);
    }

    /**
     * Internal helper — calls the Groq API with the given messages.
     */
    private static async callGroq(
        messages: ChatMessage[]
    ): Promise<{ answer: string; model: string }> {
        try {
            const completion = await groq.chat.completions.create({
                model: this.MODEL,
                messages,
                temperature: 0.2,
                max_tokens: 1024,
                top_p: 1,
                stream: false
            });

            const answer =
                completion.choices[0]?.message?.content?.trim() ||
                "Sorry, I was unable to generate a response.";

            return { answer, model: this.MODEL };
        } catch (error: any) {
            console.error("Groq LLM error:", error);
            throw new Error(`Failed to generate answer from LLM: ${error.message}`);
        }
    }
}

