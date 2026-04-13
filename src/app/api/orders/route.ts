import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/config/dbConfig";
import Order from "@/src/models/order";
import Product from "@/src/models/product";
import Store from "@/src/models/store";
import User from "@/src/models/user";
import Notification from "@/src/models/notification";
import { VerifyToken } from "@/src/utils/VerifyToken";
import { sendOrderNotificationToSeller, sendOrderStatusUpdateToCustomer } from "@/src/services/orderEmail";

// POST: Create a new order (for buyers)
export async function POST(request: NextRequest) {

    try {
        await connectDB();
        const userId = VerifyToken(request);
        const reqBody = await request.json();

        const { productId, receiverName, mobileNumber, billingAddress, quantity, paymentMethod, stripePaymentId, paymentStatus } = reqBody;

        if (!productId || !receiverName || !mobileNumber || !billingAddress || !quantity || !paymentMethod) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        if (product.quantity < quantity) {
            return NextResponse.json({ error: `Not enough quantity available. Only ${product.quantity} left.` }, { status: 400 });
        }

        const totalAmount = product.price * quantity;

        const newOrder = new Order({
            userId,
            storeId: product.storeId,
            productId,
            receiverName,
            mobileNumber,
            billingAddress,
            quantity,
            paymentMethod,
            totalAmount,
            status: "new",
            paymentStatus: paymentStatus || "Pending",
            stripePaymentId: stripePaymentId || null
        });

        await newOrder.save();

        // 4. Update Product inventory quantity and sold count in MongoDB
        product.quantity -= quantity;
        product.sold = (product.sold || 0) + quantity;
        await product.save();

        // Send email notification to seller
        try {
            const customer = await User.findById(userId);
            const store = await Store.findById(product.storeId).populate("sellerId");
            const seller: any = store?.sellerId;

            if (customer && seller) {
                await sendOrderNotificationToSeller({
                    sellerEmail: seller.email,
                    sellerName: seller.name,
                    customerName: receiverName, // Use the name provided in the order
                    customerEmail: customer.email,
                    orderId: newOrder._id.toString(),
                    items: [{
                        name: product.name,
                        quantity: quantity,
                        price: product.price
                    }],
                    totalAmount,
                    shippingAddress: billingAddress
                });
            }
        } catch (emailError) {
            console.error("Failed to send order notification email:", emailError);
            // Don't fail the order if email fails
        }

        // --- In-App Notifications ---
        try {
            // 1. Notify Buyer
            await Notification.create({
                userId: userId,
                message: `Your order for ${product.name} has been placed successfully.`,
                type: "order",
                link: `/orders` // Assuming there's a /orders page for users
            });

            // 2. Notify Seller
            const currentStore = await Store.findById(product.storeId);
            if (currentStore) {
                await Notification.create({
                    userId: currentStore.sellerId,
                    message: `New order received for ${product.name} (Qty: ${quantity}).`,
                    type: "order",
                    link: `/orders` // Assuming seller also uses /orders or similar
                });
            }
        } catch (notifError) {
            console.error("Failed to create in-app notification:", notifError);
        }

        return NextResponse.json({
            success: true,
            message: "Order placed successfully",
            order: newOrder
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// GET: Fetch orders for the seller's store
export async function GET(request: NextRequest) {
    await connectDB();
    try {
        const userId = VerifyToken(request);

        const store = await Store.findOne({ sellerId: userId });
        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        const orders = await Order.find({ storeId: store._id })
            .populate("userId", "name email")
            .populate("productId", "name")
            .sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            orders
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH: Update order status (for sellers)
export async function PATCH(request: NextRequest) {
    try {
        await connectDB();
        const userId = VerifyToken(request);
        const reqBody = await request.json();
        const { orderId, status } = reqBody;

        if (!orderId || !status) {
            return NextResponse.json({ error: "Order ID and status are required" }, { status: 400 });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        const currentStore = await Store.findOne({ sellerId: userId });
        if (!currentStore || String(order.storeId) !== String(currentStore._id)) {
            return NextResponse.json({ error: "Unauthorized access to order" }, { status: 403 });
        }

        order.status = status;
        if (status === "completed") {
            order.deliveredAt = new Date();
        }
        await order.save();

        // Send status update notification to customer
        try {
            const populatedOrder = await Order.findById(orderId)
                .populate("userId", "name email")
                .populate("productId", "name");
            
            const customer: any = populatedOrder?.userId;
            const product: any = populatedOrder?.productId;
            
            const normalizedStatus = status.toLowerCase();

            if (customer && product && (normalizedStatus === "shipped" || normalizedStatus === "completed" || normalizedStatus === "delivered")) {
                await sendOrderStatusUpdateToCustomer({
                    customerEmail: customer.email,
                    customerName: populatedOrder.receiverName || customer.name,
                    orderId: orderId,
                    status: normalizedStatus,
                    productName: product.name
                });
            }
        } catch (emailError) {
            console.error("Failed to send status update email:", emailError);
        }

        // --- In-App Notification for Buyer ---
        try {
            await Notification.create({
                userId: order.userId,
                message: `Your order for ${order.productId.name} status is now: ${status}.`,
                type: "order",
                link: `/orders`
            });
        } catch (notifError) {
            console.error("Failed to create in-app notification:", notifError);
        }

        return NextResponse.json({
            success: true,
            message: "Order status updated successfully",
            order
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
