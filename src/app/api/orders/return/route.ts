import { connectDB } from "@/src/config/dbConfig";
import Order from "@/src/models/order";
import User from "@/src/models/user";
import Store from "@/src/models/store";
import Product from "@/src/models/product";
import Notification from "@/src/models/notification";
import { sendReturnRequestToSeller, sendReturnOutcomeToCustomer } from "@/src/services/orderEmail";
import { VerifyToken } from "@/src/utils/VerifyToken";
import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/src/services/cloudinary";

export async function POST(request: NextRequest) {
    await connectDB();
    try {
        const userId = VerifyToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 });
        }

        const formData = await request.formData();
        const orderId = formData.get("orderId") as string;
        const reason = formData.get("reason") as string;
        const photos = formData.getAll("photos") as File[];

        if (!orderId || !reason) {
            return NextResponse.json({ error: "Order ID and reason are mandatory.", success: false }, { status: 400 });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return NextResponse.json({ error: "Order not found", success: false }, { status: 404 });
        }

        if (String(order.userId) !== String(userId)) {
            return NextResponse.json({ error: "Unauthorized access to order", success: false }, { status: 403 });
        }

        if (order.status !== "completed") {
            return NextResponse.json({ error: "Only delivered orders can be returned.", success: false }, { status: 400 });
        }

        if (order.returnStatus !== "none") {
            return NextResponse.json({ error: "Return request already submitted for this order.", success: false }, { status: 400 });
        }

        const returnPhotosUrls: string[] = [];
        if (photos && photos.length > 0) {
            for (const file of photos) {
                if (file instanceof File) {
                    const imageUrl = await uploadToCloudinary(file, "returns");
                    returnPhotosUrls.push(imageUrl);
                }
            }
        }

        order.returnStatus = "processing";
        order.returnReason = reason;
        order.returnPhotos = returnPhotosUrls;

        await order.save();

        // Send return request email to seller
        try {
            const populatedOrder = await Order.findById(orderId)
                .populate("userId", "name")
                .populate("productId", "name")
                .populate("storeId");
            
            const store: any = populatedOrder?.storeId;
            const sellerUser = await User.findById(store?.sellerId);
            const customer: any = populatedOrder?.userId;
            const product: any = populatedOrder?.productId;

            if (sellerUser && customer && product) {
                await sendReturnRequestToSeller({
                    sellerEmail: sellerUser.email,
                    sellerName: sellerUser.name,
                    customerName: customer.name,
                    orderId: orderId,
                    productName: product.name,
                    reason: reason
                });

                // --- In-App Notification for Seller ---
                try {
                    if (store) {
                        await Notification.create({
                            userId: store.sellerId,
                            message: `New return request received for order #${orderId} (${product.name}).`,
                            type: "return",
                            link: `/store/return-orders`
                        });
                    }
                } catch (notifError) {
                    console.error("Failed to create in-app notification:", notifError);
                }
            }
        } catch (emailError) {
            console.error("Failed to send return request email:", emailError);
        }

        return NextResponse.json({ 
            success: true, 
            message: "Return request submitted successfully. Waiting for seller review.", 
            order 
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message, success: false }, { status: 500 });
    }
}

// GET: Fetch return requests for the seller's store
export async function GET(request: NextRequest) {
    await connectDB();
    try {
        const userId = VerifyToken(request);
        const { searchParams } = new URL(request.url);
        const storeId = searchParams.get("storeId");

        // Simple auth check for seller could be done here or via Store model
        const orders = await Order.find({ 
            storeId, 
            returnStatus: { $ne: "none" } 
        })
        .populate("userId", "name email mobileNumber")
        .populate("productId", "name image")
        .sort({ updatedAt: -1 });

        return NextResponse.json({ success: true, orders }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message, success: false }, { status: 500 });
    }
}

// PATCH: Accept or Decline return (Seller side)
export async function PATCH(request: NextRequest) {
    await connectDB();
    try {
        const userId = VerifyToken(request);
        const reqBody = await request.json();
        const { orderId, decision } = reqBody; // decision: 'successful' or 'failed'

        if (!orderId || !decision) {
            return NextResponse.json({ error: "Missing order ID or decision.", success: false }, { status: 400 });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return NextResponse.json({ error: "Order not found", success: false }, { status: 404 });
        }

        // Ideally check if this user owns the store for this order
        order.returnStatus = decision;
        await order.save();

        // Send return outcome email to customer
        try {
            const populatedOrder = await Order.findById(orderId)
                .populate("userId", "name email")
                .populate("productId", "name");
            
            const customer: any = populatedOrder?.userId;
            const product: any = populatedOrder?.productId;

            if (customer && product) {
                await sendReturnOutcomeToCustomer({
                    customerEmail: customer.email,
                    customerName: customer.name,
                    orderId: orderId,
                    productName: product.name,
                    outcome: decision as 'successful' | 'failed'
                });

                // --- In-App Notification for Buyer ---
                try {
                    await Notification.create({
                        userId: order.userId,
                        message: `The return request for your order #${orderId} (${product.name}) has been ${decision === "successful" ? "approved" : "rejected"}.`,
                        type: "return",
                        link: `/products/my-orders`
                    });
                } catch (notifError) {
                    console.error("Failed to create in-app notification:", notifError);
                }
            }
        } catch (emailError) {
            console.error("Failed to send return outcome email:", emailError);
        }

        return NextResponse.json({ 
            success: true, 
            message: `Return request ${decision === "successful" ? "accepted" : "declined"}.`, 
            order 
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message, success: false }, { status: 500 });
    }
}
