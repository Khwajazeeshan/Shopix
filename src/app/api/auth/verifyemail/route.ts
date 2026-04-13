import connectDB from "@/src/config/dbConfig";
import { NextResponse, NextRequest } from "next/server";
import User from "@/src/models/user";

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const { token } = await request.json();

        // 1. Check for verification token
        const userToVerify = await User.findOne({
            verifyToken: token,
            verifyTokenExpiry: { $gt: new Date() }
        });

        if (userToVerify) {
            userToVerify.isVerified = true;
            userToVerify.verifyToken = null;
            userToVerify.verifyTokenExpiry = null;
            await userToVerify.save();

            return NextResponse.json({
                message: "Email Verified Successfully",
                type: "verify",
                success: true
            }, { status: 200 });
        }

        // 2. Check for reset token (if handled by the same endpoint)
        const userToReset = await User.findOne({
            forgotPasswordToken: token,
            forgotPasswordTokenExpiry: { $gt: new Date() }
        });

        if (userToReset) {
            return NextResponse.json({
                message: "Token is valid for password reset",
                type: "forget",
                success: true
            }, { status: 200 });
        }

        return NextResponse.json({
            message: "Invalid or expired token",
            success: false
        }, { status: 400 });

    } catch (error: any) {
        console.error("Verification Error:", error);
        return NextResponse.json({
            message: "Internal server error",
            success: false
        }, { status: 500 });
    }
}
