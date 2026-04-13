import { connectDB } from "@/src/config/dbConfig";
import Store from "@/src/models/store";
import Product from "@/src/models/product";
import User from "@/src/models/user";
import Order from "@/src/models/order";
import { VerifyToken } from "@/src/utils/VerifyToken";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    await connectDB();
    try {
        const userId = VerifyToken(request);
        const admin = await User.findById(userId);
        if (!admin || admin.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized. Admin access only.", success: false }, { status: 403 });
        }

        const { id: storeId } = await params;
        const store = await Store.findById(storeId).populate("sellerId", "name email");
        if (!store) {
            return NextResponse.json({ error: "Store not found", success: false }, { status: 404 });
        }

        const products = await Product.find({ storeId: store._id }).sort({ createdAt: -1 });

        // Calculate total sales from completed and non-returned orders
        const orders = await Order.find({
            storeId: store._id,
            status: "completed",
            returnStatus: { $ne: "successful" }
        });
        
        const totalSales = orders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);

        return NextResponse.json({
            success: true,
            data: {
                store,
                products,
                totalSales
            }
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message, success: false }, { status: 500 });
    }
}
