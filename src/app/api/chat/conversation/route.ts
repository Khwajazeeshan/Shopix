import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/src/config/dbConfig";
import Conversation from "@/src/models/conversation";
import { VerifyToken } from "@/src/utils/VerifyToken";

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const userId = VerifyToken(request);
        const { sellerId, productId } = await request.json();

        if (!sellerId || !productId) {
            return NextResponse.json({ error: "Seller ID and Product ID are required" }, { status: 400 });
        }

        // Check if conversation already exists
        let conversation = await Conversation.findOne({
            customerId: userId,
            sellerId,
            productId
        });

        if (!conversation) {
            conversation = await Conversation.create({
                customerId: userId,
                sellerId,
                productId
            });
        }

        return NextResponse.json({ success: true, conversation });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
