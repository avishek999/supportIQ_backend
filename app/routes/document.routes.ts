import { Router } from "express";
import { upload } from "../middlewares/upload.middleware";
import { authenticateUser } from "../middlewares/auth.middleware";
import { uploadDocument, ingestLink } from "../controller/document.controller";

const router = Router();

// Protect document upload endpoint with authentication
router.post("/upload", authenticateUser, upload.single("file"), uploadDocument);

// Website link ingestion endpoint
router.post("/link", authenticateUser, ingestLink);

export default router;
