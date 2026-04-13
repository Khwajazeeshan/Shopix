import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/src/config/dbConfig";
import User from "@/src/models/user";
import { sendEmail } from "@/src/services/mailer";
import bcrypt from "bcryptjs";

import { VerifyToken } from "@/src/utils/VerifyToken";

connectDB();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // 1️⃣ Send reset email
        if (body.email) {
            const user = await User.findOne({ email: body.email });
            if (!user) {
                return NextResponse.json({ message: "User not found" }, { status: 404 });
            }

            await sendEmail({ email: body.email, emailType: "RESET", userId: user._id.toString() });
            return NextResponse.json({
                message: "Reset password link sent to your email",
                success: true,
            }, { status: 201 });
        }

        // 2️⃣ Reset password (Admin Direct)
        if (body.isAdminReset && body.newPassword) {
            const userId = VerifyToken(request);
            const user = await User.findById(userId);

            if (!user) {
                return NextResponse.json({ message: "User not found" }, { status: 404 });
            }

            if (user.role !== "admin") {
                return NextResponse.json({ message: "Action unauthorized. Admin only." }, { status: 403 });
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(body.newPassword, salt);
            await user.save();

            return NextResponse.json({ message: "Admin password updated successfully", success: true });
        }

        // 3️⃣ Token-based Reset
        if (body.token && body.newPassword) {
            const user = await User.findOne({
                forgotPasswordToken: body.token,
                forgotPasswordTokenExpiry: { $gt: Date.now() }
            });

            if (!user) {
                return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 });
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(body.newPassword, salt);

            // Clear token
            user.forgotPasswordToken = null;
            user.forgotPasswordTokenExpiry = null;

            await user.save();

            return NextResponse.json({ message: "Password updated successfully", success: true });
        }

        return NextResponse.json({ message: "Invalid request" }, { status: 400 });

    } catch (error: any) {
        return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
    }
}
