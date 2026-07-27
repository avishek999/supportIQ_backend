import { Request, Response, NextFunction } from "express";

// 404 Not Found Handler
export const notFoundHandler = (req: Request, res: Response) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found` });
};

// Global Error Handler
export const globalErrorHandler = (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    console.error("Unhandled Error:", err);

    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
        success: false,
        message,
    });
};
