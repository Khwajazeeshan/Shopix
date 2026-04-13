import { connectDB } from "@/src/config/dbConfig";
import Notification from "@/src/models/notification";
import { VerifyToken } from "@/src/utils/VerifyToken";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    await connectDB();
    try {
        const userId = VerifyToken(request);
        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(50);

        const unreadCount = await Notification.countDocuments({ userId, isRead: false });

        return NextResponse.json({ success: true, data: notifications, unreadCount }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message, success: false }, { status: 500 });
    }
}
