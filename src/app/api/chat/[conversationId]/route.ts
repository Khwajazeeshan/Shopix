import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/src/config/dbConfig";
import Conversation from "@/src/models/conversation";
import Message from "@/src/models/message";
import Notification from "@/src/models/notification";
import Product from "@/src/models/product";
import User from "@/src/models/user";
import { VerifyToken } from "@/src/utils/VerifyToken";
import { pusherServer } from "@/src/lib/pusher";

// GET: Fetch all messages for a conversation
export async function GET(request: NextRequest, { params }: { params: any }) {
    try {
        await connectDB();
        await VerifyToken(request);
        const { conversationId } = await params;

        const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

        return NextResponse.json({ success: true, messages });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Send a message
export async function POST(request: NextRequest, { params }: { params: any }) {
    try {
        await connectDB();
        const userId = VerifyToken(request);
        const { conversationId } = await params;
        const { message, senderRole } = await request.json();

        if (!message) {
            return NextResponse.json({ error: "Message content is required" }, { status: 400 });
        }

        // 1. Create the message
        const newMessage = await Message.create({
            conversationId,
            senderId: userId,
            senderRole,
            message,
        });

        // 2. Update conversation last message and timestamp
        const conversation: any = await Conversation.findByIdAndUpdate(
            conversationId,
            { 
              lastMessage: message,
              updatedAt: new Date()
            },
            { new: true }
        ).populate("productId customerId sellerId");

        if (!conversation) {
            return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
        }

        // 3. Trigger Pusher
        await pusherServer.trigger(`conversation-${conversationId}`, "new-message", newMessage);

        // 4. Send Notification
        const isCustomer = senderRole === "customer";
        const recipientId = isCustomer ? conversation.sellerId._id : conversation.customerId._id;
        const senderName = isCustomer ? conversation.customerId.name : "Seller";
        const productName = conversation.productId.name;

        await Notification.create({
            userId: recipientId,
            message: isCustomer 
                ? `New message from ${senderName} about ${productName}`
                : `Seller replied to your message about ${productName}`,
            type: "chat",
            link: isCustomer ? "/seller/chats" : "/products/productinfo?id=" + conversation.productId._id + "&openChat=true",
        });

        return NextResponse.json({ success: true, message: newMessage });

    } catch (error: any) {
        console.error("Chat API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH: Mark messages in a conversation as read
export async function PATCH(request: NextRequest, { params }: { params: any }) {
    try {
        await connectDB();
        const userId = VerifyToken(request);
        const { conversationId } = await params;

        await Message.updateMany(
            { conversationId, senderId: { $ne: userId }, isRead: false },
            { isRead: true }
        );

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
