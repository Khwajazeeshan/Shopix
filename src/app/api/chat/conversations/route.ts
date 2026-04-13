import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/src/config/dbConfig";
import Conversation from "@/src/models/conversation";
import { VerifyToken } from "@/src/utils/VerifyToken";

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const userId = VerifyToken(request);

        // Get conversations where user is either customer or seller
        const conversations = await Conversation.find({
            $or: [{ customerId: userId }, { sellerId: userId }]
        })
        .populate("customerId", "name image email")
        .populate("sellerId", "name image email")
        .populate("productId", "name image price")
        .sort({ updatedAt: -1 });

        // Add unread count for each conversation
        const Message = (await import("@/src/models/message")).default;
        const conversationsWithUnread = await Promise.all(conversations.map(async (conv) => {
            const unreadCount = await Message.countDocuments({
                conversationId: conv._id,
                isRead: false,
                senderId: { $ne: userId }
            });
            return {
                ...conv.toObject(),
                unreadCount
            };
        }));

        return NextResponse.json({ success: true, conversations: conversationsWithUnread });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
