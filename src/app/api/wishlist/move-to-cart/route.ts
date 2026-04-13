import { connectDB } from "@/src/config/dbConfig";
import Wishlist from "@/src/models/wishlist";
import Cart from "@/src/models/cart";
import { VerifyToken } from "@/src/utils/VerifyToken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    await connectDB();
    try {
        const userId = VerifyToken(request);
        const { productId, wishlistId } = await request.json();

        if (!productId || !wishlistId) {
            return NextResponse.json({ error: "Product ID and Wishlist ID are required", success: false }, { status: 400 });
        }

        // Check if already in cart
        const cartExisting = await Cart.findOne({ userId, productId });
        if (!cartExisting) {
            const newCartItem = new Cart({
                userId,
                productId
            });
            await newCartItem.save();
        }

        // Remove from wishlist
        await Wishlist.findOneAndDelete({ _id: wishlistId, userId });

        return NextResponse.json({ message: "Moved to cart successfully", success: true }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message, success: false }, { status: 500 });
    }
}
