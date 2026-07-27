import dotenv from "dotenv";

dotenv.config();

export const DB_NAME = process.env.DB_NAME
export const MONGODB_URL = process.env.MONGODB_URL
export const PORT = process.env.PORT || 5001
export const JWT_SECRET = process.env.JWT_SECRET
export const NODE_ENV = process.env.NODE_ENV
export const GROQ_API_KEY = process.env.GROQ_API_KEY
export const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000"