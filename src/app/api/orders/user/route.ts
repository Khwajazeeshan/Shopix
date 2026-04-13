import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/config/dbConfig";
import Order from "@/src/models/order";
import Product from "@/src/models/product";
import { VerifyToken } from "@/src/utils/VerifyToken";

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const userId = VerifyToken(request);

        // Fetch orders where the current user is the buyer (userId matches)
        const orders = await Order.find({ userId })
            .populate({
                path: "productId",
                select: "name image description price"
            })
            .populate("storeId", "name logo")
            .sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            orders
        });

    } catch (error: any) {
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}
