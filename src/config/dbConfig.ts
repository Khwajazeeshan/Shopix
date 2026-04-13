import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URL!);
        console.log("MongoDB connected Successfully");
    } catch (error) {
        console.log("MongoDB connection error:", error);
    }
}

export default connectDB;
