import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let isConnected = false;
let connectionPromise: Promise<any> | null = null;

export async function connectDB() {
    if (isConnected) {
        return;
    }

    if (connectionPromise) {
        return connectionPromise;
    }

    try {
        connectionPromise = mongoose.connect(process.env.MONGODB_URL!);
        const db = await connectionPromise;
        isConnected = db.connections[0].readyState === 1;
        console.log("MongoDB connected Successfully");
    } catch (error) {
        console.log("MongoDB connection error:", error);
        connectionPromise = null; // Enable retry on next call
    }
}

export default connectDB;
