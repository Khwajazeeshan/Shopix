import { connectDB } from "@/src/config/dbConfig";
import Wishlist from "@/src/models/wishlist";
import { VerifyToken } from "@/src/utils/VerifyToken";
import { NextRequest, NextResponse } from "next/server";
import "@/src/models/product"; 
import "@/src/models/store";

export async function POST(request: NextRequest) {
    await connectDB();
    try {
        const userId = VerifyToken(request);
        const { productId } = await request.json();

        if (!productId) {
            return NextResponse.json({ error: "Product ID is required", success: false }, { status: 400 });
        }

        const existing = await Wishlist.findOne({ userId, productId });
        if (existing) {
            // Toggle behavior: if exists, remove it. Or just return error.
            // User said "add", but heart icon often toggles.
            // I'll stick to simple "add" and handle toggle in UI/Redux.
            await Wishlist.findOneAndDelete({ userId, productId });
            return NextResponse.json({ message: "Removed from wishlist", success: true, removed: true }, { status: 200 });
        }

        const newWishlistItem = new Wishlist({
            userId,
            productId
        });

        await newWishlistItem.save();

        return NextResponse.json({ message: "Added to wishlist successfully", success: true }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message, success: false }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    await connectDB();
    try {
        const userId = VerifyToken(request);
        const wishlistItems = await Wishlist.find({ userId }).populate({
            path: 'productId',
            populate: {
                path: 'storeId',
                select: 'name logo'
            }
        }).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: wishlistItems }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message, success: false }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    await connectDB();
    try {
        const userId = VerifyToken(request);
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Wishlist item ID is required", success: false }, { status: 400 });
        }

        await Wishlist.findOneAndDelete({ _id: id, userId });

        return NextResponse.json({ message: "Wishlist item removed successfully", success: true }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message, success: false }, { status: 500 });
    }
}
