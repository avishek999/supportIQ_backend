import { z } from "zod";

export const uploadOptionsSchema = z.object({
    chunkSize: z.coerce.number().optional().default(500),
    chunkOverlap: z.coerce.number().optional().default(100)
});

export const ingestLinkSchema = z.object({
    url: z.string().url("Please provide a valid URL (e.g. https://example.com)"),
    chunkSize: z.coerce.number().optional().default(500),
    chunkOverlap: z.coerce.number().optional().default(100)
});

export type UploadOptionsDTO = z.infer<typeof uploadOptionsSchema>;
export type IngestLinkDTO = z.infer<typeof ingestLinkSchema>;

