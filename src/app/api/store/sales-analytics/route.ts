import { NextRequest, NextResponse } from "next/server";
import { VerifyToken } from "../../../../utils/VerifyToken";
import Order from "../../../../models/order";
import Store from "../../../../models/store";
import { connectDB } from "../../../../config/dbConfig";

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const userId = VerifyToken(request);
        
        // Find the store belonging to this seller
        const store = await Store.findOne({ sellerId: userId });
        if (!store) {
            return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
        }

        // Fetch all orders for this store that are completed (delivered)
        // We also need to handle returns where returnStatus is "successful"
        const orders = await Order.find({ 
            storeId: store._id,
            status: "completed"
        }).populate("productId", "name image");

        // Aggregation logic
        const productSalesMap: Record<string, any> = {};
        let totalRevenue = 0;

        orders.forEach((order: any) => {
            if (!order.productId) return; // Skip if product info missing

            const productId = order.productId._id.toString();
            const productInfo = order.productId;
            
            // If returnStatus is successful, we deduct the amount from revenue
            const isReturned = order.returnStatus === "successful";
            const orderRevenue = isReturned ? 0 : order.totalAmount;
            const orderQuantity = isReturned ? 0 : order.quantity; 

            if (!productSalesMap[productId]) {
                productSalesMap[productId] = {
                    productId,
                    name: productInfo.name,
                    image: productInfo.image,
                    totalQuantity: 0,
                    totalRevenue: 0,
                };
            }

            productSalesMap[productId].totalQuantity += orderQuantity;
            productSalesMap[productId].totalRevenue += orderRevenue;
            
            if (!isReturned) {
                totalRevenue += order.totalAmount;
            }
        });

        // Requirement 2: Deduct returns from total revenue. 
        // My logic above already handles this by only adding non-returned amounts to totalRevenue.
        // Wait, the prompt says "If any product is returned, automatically deduct its price from total sales."
        // If totalRevenue was calculated by simply summing totalAmount of all completed orders, 
        // then I should subtract the returned ones. My current logic sums only non-returned ones, which is the same result.

        const productWiseSales = Object.values(productSalesMap).filter((p: any) => p.totalQuantity > 0 || p.totalRevenue > 0);

        return NextResponse.json({
            success: true,
            totalRevenue,
            productWiseSales
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
