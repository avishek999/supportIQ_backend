import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../utils/config";
import { AuthenticatedRequest } from "../types/user.types";


export const authenticateUser = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        // 1. Read token from httpOnly cookie or Authorization header
        const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Authentication required. Please log in." });
        }

        // 2. Verify JWT token
        const decoded = jwt.verify(token, JWT_SECRET || "default_secret") as {
            id: string;
            email: string;
        };

        // 3. Attach user info to request
        req.user = { id: decoded.id, email: decoded.email };
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired authentication token" });
    }
};
