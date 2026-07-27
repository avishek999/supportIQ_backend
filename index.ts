import express, { Request, Response } from "express";
import cors from "cors";
import connectDB from "./app/utils/db";
import { PORT, CLIENT_URL } from "./app/utils/config";
import apiRoutes from "./app/routes";
import cookieParser from "cookie-parser";
import { notFoundHandler, globalErrorHandler } from "./app/middlewares/error.middleware";

const app = express();

// Core Middleware (Built-in & Third-party)
const allowedOrigins = [CLIENT_URL, "http://localhost:3000", "http://localhost:3001"];

app.use(cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
}));
app.use(express.json());
app.use(cookieParser());

// Health Check / Root Endpoint
app.get("/", (_req: Request, res: Response) => {
    res.status(200).json({ status: "OK", message: "Welcome to SupportIQ Backend" });
});

// API Routes (auth, documents)
app.use("/api", apiRoutes);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Start Server after DB Connection
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};

startServer();