import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Global cache for serverless environments (Vercel)
// This ensures connections persist across function invocations
interface GlobalMongoose {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

// Declare global for TypeScript
declare global {
    var mongooseGlobal: GlobalMongoose;
}

// Initialize global cache
if (!global.mongooseGlobal) {
    global.mongooseGlobal = {
        conn: null,
        promise: null,
    };
}

const cached = global.mongooseGlobal;

/**
 * Connects to MongoDB with proper caching for serverless environments
 * Prevents re-compilation and "Schema hasn't been registered" errors
 */
export async function connectDB() {
    // If already connected, return the cached connection
    if (cached.conn) {
        console.log("Using cached MongoDB connection");
        return cached.conn;
    }

    // If connection is in progress, wait for it
    if (cached.promise) {
        console.log("Waiting for MongoDB connection promise...");
        try {
            cached.conn = await cached.promise;
            return cached.conn;
        } catch (error) {
            console.error("Failed to connect to MongoDB (from promise):", error);
            cached.promise = null;
            throw error;
        }
    }

    // Create new connection
    if (!process.env.MONGODB_URL) {
        throw new Error("MONGODB_URL environment variable is not set");
    }

    try {
        console.log("Creating new MongoDB connection...");
        
        // Create promise for connection
        cached.promise = mongoose.connect(process.env.MONGODB_URL, {
            // Connection options optimized for serverless
            bufferCommands: true,
            maxPoolSize: 10,
            minPoolSize: 5,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        // Wait for connection to complete
        cached.conn = await cached.promise;

        // Verify connection is ready
        if (cached.conn.connection.readyState === 1) {
            console.log("✅ MongoDB connected successfully");
        } else {
            throw new Error(
                `Connection state is ${cached.conn.connection.readyState}, expected 1 (connected)`
            );
        }

        return cached.conn;
    } catch (error) {
        // Clear cache on error to allow retry
        cached.promise = null;
        cached.conn = null;
        console.error("❌ MongoDB connection failed:", error);
        throw error;
    }
}

/**
 * Disconnects from MongoDB (use cautiously in serverless)
 * Note: In Vercel, connections are automatically cleaned up between function invocations
 */
export async function disconnectDB() {
    try {
        if (cached.conn) {
            await cached.conn.disconnect();
            cached.conn = null;
            cached.promise = null;
            console.log("✅ MongoDB disconnected");
        }
    } catch (error) {
        console.error("❌ Error disconnecting MongoDB:", error);
    }
}

export default connectDB;
