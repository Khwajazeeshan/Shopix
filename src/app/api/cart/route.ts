import { connectDB } from "@/src/config/dbConfig";
import Cart from "@/src/models/cart";
import { VerifyToken } from "@/src/utils/VerifyToken";
import { NextRequest, NextResponse } from "next/server";
import "@/src/models/product"; // Ensure model is registered
import "@/src/models/store";   // Ensure model is registered

export async function POST(request: NextRequest) {
    await connectDB();
    try {
        const userId = VerifyToken(request);
        const { productId } = await request.json();

        if (!productId) {
            return NextResponse.json({ error: "Product ID is required", success: false }, { status: 400 });
        }

        // Check if already in cart
        const existing = await Cart.findOne({ userId, productId });
        if (existing) {
            return NextResponse.json({ error: "Product already in your items", success: false }, { status: 400 });
        }

        const newCartItem = new Cart({
            userId,
            productId
        });

        await newCartItem.save();

        return NextResponse.json({ message: "Added to items successfully", success: true }, { status: 201 });

    } catch (error: any) {
        const status = error.message === "Token not found" || error.message === "jwt expired" ? 401 : 500;
        return NextResponse.json({ error: error.message, success: false }, { status });
    }
}

export async function GET(request: NextRequest) {
    await connectDB();
    try {
        const userId = VerifyToken(request);
        const cartItems = await Cart.find({ userId }).populate({
            path: 'productId',
            populate: {
                path: 'storeId',
                select: 'name logo'
            }
        }).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: cartItems }, { status: 200 });
    } catch (error: any) {
        const status = error.message === "Token not found" || error.message === "jwt expired" ? 401 : 500;
        return NextResponse.json({ error: error.message, success: false }, { status });
    }
}

export async function DELETE(request: NextRequest) {
    await connectDB();
    try {
        const userId = VerifyToken(request);
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Item ID is required", success: false }, { status: 400 });
        }

        await Cart.findOneAndDelete({ _id: id, userId });

        return NextResponse.json({ message: "Item removed successfully", success: true }, { status: 200 });
    } catch (error: any) {
        const status = error.message === "Token not found" || error.message === "jwt expired" ? 401 : 500;
        return NextResponse.json({ error: error.message, success: false }, { status });
    }
}
