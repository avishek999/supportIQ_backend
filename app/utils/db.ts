import mongoose from "mongoose";
import { DB_NAME, MONGODB_URL } from "./config";

const connectDB = async () => {
    try {
        if (!MONGODB_URL) {
            throw new Error("Please provide a valid MongoDB URL");
        }
        const connectionInstance = await mongoose.connect(MONGODB_URL, {
            dbName: DB_NAME,
            serverSelectionTimeoutMS: 5000,
        });

        console.log(`✅ Database connected: ${connectionInstance.connection.host}`);
    } catch (error: any) {
        console.error("❌ MongoDB Connection Error:", error.message || error);
        throw error;
    }
};

export default connectDB;




