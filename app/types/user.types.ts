import { Request } from "express";
import { Document } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    comparePassword(candidatePassword: string): Promise<boolean>;
}


// Extend Express Request to include user info
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
}