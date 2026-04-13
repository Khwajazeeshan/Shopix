export const revalidate = 300;

import { connectDB } from "@/src/config/dbConfig";
import Product from "@/src/models/product";
import Review from "@/src/models/review";
import Store from "@/src/models/store";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    await connectDB();
    try {
        const { id } = await params;
        
        const product = await Product.findById(id).populate("storeId", "name logo description type");
        if (!product) {
            return NextResponse.json({ error: "Product not found", success: false }, { status: 404 });
        }

        const reviews = await Review.find({ productId: id }).populate("userId", "name").sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            data: {
                product,
                reviews
            }
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message, success: false }, { status: 500 });
    }
}
