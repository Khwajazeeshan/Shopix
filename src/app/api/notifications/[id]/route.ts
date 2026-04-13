import { connectDB } from "@/src/config/dbConfig";
import Notification from "@/src/models/notification";
import { VerifyToken } from "@/src/utils/VerifyToken";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    await connectDB();
    try {
        const userId = VerifyToken(request);
        const { id } = await params;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, userId },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return NextResponse.json({ error: "Notification not found", success: false }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: notification }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message, success: false }, { status: 500 });
    }
}
