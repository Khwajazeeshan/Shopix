export const revalidate = 300;

import { connectDB } from "@/src/config/dbConfig";
import Product from "@/src/models/product";
import Review from "@/src/models/review";
import Store from "@/src/models/store";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/marketplace/products/[id]
 * Fetches product details with reviews
 * 
 * This follows the production-ready pattern:
 * 1. Connect to DB first
 * 2. Execute queries
 * 3. Handle errors properly
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Step 1: Establish database connection before any queries
        await connectDB();

        // Step 2: Extract product ID
        const { id } = await params;

        // Validate ID format
        if (!id || id.length !== 24) {
            return NextResponse.json(
                { error: "Invalid product ID format", success: false },
                { status: 400 }
            );
        }

        // Step 3: Execute both queries in parallel for better performance
        const [product, reviews] = await Promise.all([
            Product.findById(id)
                .populate("storeId", "name logo description type")
                .lean() // Use lean for read-only queries
                .exec(),
            Review.find({ productId: id })
                .populate("userId", "name")
                .sort({ createdAt: -1 })
                .lean()
                .exec(),
        ]);

        // Step 4: Validate product exists
        if (!product) {
            return NextResponse.json(
                { error: "Product not found", success: false },
                { status: 404 }
            );
        }

        // Step 5: Return successful response
        return NextResponse.json(
            {
                success: true,
                data: {
                    product,
                    reviews: reviews || [],
                },
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Product fetch error:", error);

        // Handle specific error types
        if (error.name === "CastError") {
            return NextResponse.json(
                { error: "Invalid product ID format", success: false },
                { status: 400 }
            );
        }

        if (error.message.includes("Schema hasn't been registered")) {
            return NextResponse.json(
                { error: "Model registration error - please try again", success: false },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                error: error.message || "Failed to fetch product details",
                success: false,
                details: process.env.NODE_ENV === "development" ? error : undefined,
            },
            { status: 500 }
        );
    }
}
