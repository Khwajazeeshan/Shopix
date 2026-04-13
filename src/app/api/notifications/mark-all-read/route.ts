import { connectDB } from "@/src/config/dbConfig";
import Notification from "@/src/models/notification";
import { VerifyToken } from "@/src/utils/VerifyToken";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
    await connectDB();
    try {
        const userId = VerifyToken(request);
        await Notification.updateMany({ userId, isRead: false }, { isRead: true });

        return NextResponse.json({ success: true, message: "All notifications marked as read" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message, success: false }, { status: 500 });
    }
}
