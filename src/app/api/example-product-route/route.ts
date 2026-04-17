/**
 * EXAMPLE API ROUTE - Production-Ready Pattern for Mongoose + Vercel
 * 
 * This demonstrates the correct way to:
 * 1. Connect to MongoDB
 * 2. Use models with proper error handling
 * 3. Handle serverless environment considerations
 * 
 * Copy this pattern to all your API routes for consistency
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/config/dbConfig";
import Product from "@/src/models/product";

/**
 * GET /api/example-product-route
 * Fetches products with pagination and filtering
 */
export async function GET(request: NextRequest) {
    try {
        // Step 1: Establish database connection
        // This will use cached connection if available, preventing reconnection overhead
        await connectDB();

        // Step 2: Get query parameters
        const page = request.nextUrl.searchParams.get("page") || "1";
        const limit = request.nextUrl.searchParams.get("limit") || "10";
        const category = request.nextUrl.searchParams.get("category");

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Step 3: Build query filter
        const filter: Record<string, any> = {};
        if (category && category !== "all") {
            filter.category = category;
        }
        filter.quantity = { $gt: 0 }; // Only show in-stock products

        // Step 4: Execute queries in parallel for better performance
        const [products, total] = await Promise.all([
            Product.find(filter)
                .select("name price image category rating sold quantity")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean() // Use lean() for read-only queries (faster, lower memory)
                .exec(),
            Product.countDocuments(filter),
        ]);

        // Step 5: Return response with proper status code
        return NextResponse.json(
            {
                success: true,
                data: {
                    products,
                    pagination: {
                        total,
                        page: pageNum,
                        limit: limitNum,
                        pages: Math.ceil(total / limitNum),
                    },
                },
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("API Error:", error);

        // Return appropriate error status
        const statusCode = error.name === "CastError" ? 400 : 500;
        const message =
            error.name === "CastError"
                ? "Invalid product ID format"
                : "Failed to fetch products";

        return NextResponse.json(
            {
                success: false,
                error: message,
                details: process.env.NODE_ENV === "development" ? error.message : undefined,
            },
            { status: statusCode }
        );
    }
}

/**
 * POST /api/example-product-route
 * Creates a new product
 */
export async function POST(request: NextRequest) {
    try {
        // Establish connection first
        await connectDB();

        // Parse request body
        const body = await request.json();

        // Validate required fields (add more validation as needed)
        const { name, price, description, category, image, quantity, storeId, sellerId } =
            body;

        if (
            !name ||
            !price ||
            !description ||
            !category ||
            !image ||
            quantity === undefined ||
            !storeId ||
            !sellerId
        ) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Create new product
        const newProduct = new Product({
            name: name.trim(),
            price,
            description: description.trim(),
            category,
            image,
            quantity,
            storeId,
            sellerId,
        });

        // Save to database
        const savedProduct = await newProduct.save();

        return NextResponse.json(
            {
                success: true,
                data: savedProduct,
                message: "Product created successfully",
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Create Product Error:", error);

        // Handle Mongoose validation errors
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors)
                .map((err: any) => err.message)
                .join(", ");

            return NextResponse.json(
                { success: false, error: `Validation failed: ${messages}` },
                { status: 400 }
            );
        }

        // Handle duplicate key error (unique constraint)
        if (error.code === 11000) {
            return NextResponse.json(
                { success: false, error: "Product with this name already exists" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: "Failed to create product",
                details: process.env.NODE_ENV === "development" ? error.message : undefined,
            },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/example-product-route
 * Updates a product
 */
export async function PUT(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: "Product ID is required" },
                { status: 400 }
            );
        }

        // Find and update product
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true } // Return updated document and run schema validators
        );

        if (!updatedProduct) {
            return NextResponse.json(
                { success: false, error: "Product not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: updatedProduct,
                message: "Product updated successfully",
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Update Product Error:", error);

        if (error.name === "CastError") {
            return NextResponse.json(
                { success: false, error: "Invalid product ID format" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: "Failed to update product",
                details: process.env.NODE_ENV === "development" ? error.message : undefined,
            },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/example-product-route
 * Deletes a product
 */
export async function DELETE(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { success: false, error: "Product ID is required" },
                { status: 400 }
            );
        }

        const deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
            return NextResponse.json(
                { success: false, error: "Product not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: "Product deleted successfully",
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Delete Product Error:", error);

        if (error.name === "CastError") {
            return NextResponse.json(
                { success: false, error: "Invalid product ID format" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: "Failed to delete product",
                details: process.env.NODE_ENV === "development" ? error.message : undefined,
            },
            { status: 500 }
        );
    }
}
