/**
 * Mongoose Setup Verification Utility
 * 
 * Use this to verify your Mongoose setup is correct for Vercel deployment
 * Run manually or add to your health check endpoint
 */

import mongoose from "mongoose";
import { connectDB } from "@/src/config/dbConfig";

// Import all models to ensure they're registered
import User from "@/src/models/user";
import Product from "@/src/models/product";
import Order from "@/src/models/order";
import Store from "@/src/models/store";
import Review from "@/src/models/review";
import Cart from "@/src/models/cart";
import Wishlist from "@/src/models/wishlist";
import Conversation from "@/src/models/conversation";
import Message from "@/src/models/message";
import Notification from "@/src/models/notification";
import FAQ from "@/src/models/faq";

export interface VerificationResult {
    status: "healthy" | "warning" | "error";
    connection: {
        ready: boolean;
        state: string;
        url: string | null;
    };
    models: {
        registered: string[];
        count: number;
        expected: number;
    };
    errors: string[];
    warnings: string[];
    timestamp: string;
}

/**
 * Verify Mongoose setup
 * Returns detailed diagnostic information
 */
export async function verifyMongooseSetup(): Promise<VerificationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const result: VerificationResult = {
        status: "healthy",
        connection: {
            ready: false,
            state: "disconnected",
            url: null,
        },
        models: {
            registered: [],
            count: 0,
            expected: 11,
        },
        errors,
        warnings,
        timestamp: new Date().toISOString(),
    };

    try {
        // 1. Test connection
        console.log("🔍 Verifying Mongoose setup...");

        await connectDB();

        const connectionState = mongoose.connection.readyState;
        const stateMap: Record<number, string> = {
            0: "disconnected",
            1: "connected",
            2: "connecting",
            3: "disconnecting",
        };

        result.connection.state = stateMap[connectionState] || "unknown";
        result.connection.ready = connectionState === 1;
        result.connection.url = (mongoose.connection.getClient() as any)?.topology?.uri || null;

        if (!result.connection.ready) {
            errors.push(`Database not ready. Connection state: ${result.connection.state}`);
        }

        // 2. Check all models are registered
        const expectedModels = [
            "User",
            "Product",
            "Order",
            "Store",
            "Review",
            "Cart",
            "Wishlist",
            "Conversation",
            "Message",
            "Notification",
            "FAQs",
        ];

        const registeredModels = Object.keys(mongoose.models);
        result.models.registered = registeredModels;
        result.models.count = registeredModels.length;

        for (const model of expectedModels) {
            if (!registeredModels.includes(model)) {
                errors.push(`❌ Model "${model}" is not registered`);
            }
        }

        if (registeredModels.length > expectedModels.length) {
            warnings.push(
                `⚠️ Found ${registeredModels.length - expectedModels.length} unexpected models: ${registeredModels
                    .filter((m) => !expectedModels.includes(m))
                    .join(", ")}`
            );
        }

        // 3. Test basic query
        console.log("🔄 Testing basic database query...");
        try {
            const userCount = await User.countDocuments({}).lean().exec();
            console.log(`✅ User count: ${userCount}`);
        } catch (queryError: any) {
            errors.push(`Database query failed: ${queryError.message}`);
        }

        // 4. Check connection pooling
        const client = mongoose.connection.getClient() as any;
        if (client && client.topology) {
            const topology = client.topology;
            if (topology?.sessionPool) {
                const sessionCount = topology.sessionPool.sessions?.length || 0;
                if (sessionCount > 50) {
                    warnings.push(
                        `⚠️ High session count: ${sessionCount}. Consider reviewing connection pooling.`
                    );
                }
            }
        }

        // 5. Determine overall status
        if (errors.length > 0) {
            result.status = "error";
        } else if (warnings.length > 0) {
            result.status = "warning";
        } else {
            result.status = "healthy";
        }

        // Log results
        console.log("\n📊 Mongoose Verification Results:");
        console.log(`Status: ${result.status.toUpperCase()}`);
        console.log(
            `Connection: ${result.connection.ready ? "✅ Connected" : "❌ Disconnected"} (${result.connection.state})`
        );
        console.log(`Models: ${result.models.count}/${result.models.expected} registered`);

        if (errors.length > 0) {
            console.log("\n❌ Errors:");
            errors.forEach((err) => console.log(`  - ${err}`));
        }

        if (warnings.length > 0) {
            console.log("\n⚠️ Warnings:");
            warnings.forEach((warn) => console.log(`  - ${warn}`));
        }

        if (result.status === "healthy") {
            console.log("\n✅ All checks passed!");
        }

        return result;
    } catch (error: any) {
        errors.push(`Verification failed: ${error.message}`);
        result.status = "error";
        result.errors = errors;
        console.error("❌ Verification Error:", error);
        return result;
    }
}

/**
 * Health check endpoint
 * Can be used as: GET /api/health
 */
export async function mongooseHealthCheck() {
    const verification = await verifyMongooseSetup();

    return {
        ok: verification.status === "healthy",
        status: verification.status,
        timestamp: verification.timestamp,
        connection: verification.connection,
        models: verification.models,
        errors: verification.errors,
        warnings: verification.warnings,
    };
}

/**
 * Database diagnostics for troubleshooting
 */
export async function getDatabaseDiagnostics() {
    try {
        await connectDB();

        const mongoClient = mongoose.connection.getClient() as any;
        const topology = mongoClient?.topology;

        return {
            connected: mongoose.connection.readyState === 1,
            connectionString: process.env.MONGODB_URL?.replace(/mongodb\+srv:\/\/[^@]+@/, "mongodb+srv://***@"),
            database: mongoose.connection.db?.databaseName,
            collections: await mongoose.connection.db?.listCollections().toArray(),
            serverInfo: topology?.serverDescriptionList?.map((sd: any) => ({
                host: sd.host,
                port: sd.port,
                type: sd.type,
            })),
            poolSize: topology?.serverDescriptionList?.length || 0,
            models: Object.keys(mongoose.models),
            timestamp: new Date().toISOString(),
        };
    } catch (error: any) {
        return {
            connected: false,
            error: error.message,
            timestamp: new Date().toISOString(),
        };
    }
}
