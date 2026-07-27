import { Response } from "express";
import { IngestionService } from "../services/ingestion.service";
import { uploadOptionsSchema, ingestLinkSchema } from "../dto/document.dto";
import { AuthenticatedRequest } from "../types/user.types";

export const uploadDocument = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Please upload a file (PDF, CSV, or TXT)" });
        }

        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized user" });
        }

        // Validate optional chunking query params (e.g. ?chunkSize=500&chunkOverlap=100)
        const options = uploadOptionsSchema.parse(req.query);

        // Delegate entire ingestion pipeline to IngestionService
        const result = await IngestionService.processUploadedFile(req.file, options, req.user.id);

        return res.status(200).json({
            message: "Document ingested and chunked successfully",
            data: result
        });
    } catch (error: any) {
        console.error("Ingestion error:", error);
        return res.status(500).json({ message: error.message || "Failed to process document" });
    }
};

export const ingestLink = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized user" });
        }

        const { url, chunkSize, chunkOverlap } = ingestLinkSchema.parse(req.body);

        const result = await IngestionService.processWebsiteUrl(
            url,
            { chunkSize, chunkOverlap },
            req.user.id
        );

        return res.status(200).json({
            message: "Website link processed and chunked successfully",
            data: result
        });
    } catch (error: any) {
        console.error("Link ingestion error:", error);
        if (error.name === "ZodError") {
            return res.status(400).json({ message: "Validation error", errors: error.errors });
        }
        return res.status(500).json({ message: error.message || "Failed to process website link" });
    }
};
