import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { GenerateToken } from "@/src/utils/GenerateToken";
import { connectDB } from "@/src/config/dbConfig";
import User from "@/src/models/user";
import { authOptions } from "../[...nextauth]/route";

export async function GET() {
    try {
        const session: any = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ message: "No session found", success: false }, { status: 401 });
        }

        await connectDB();
        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ message: "User not found in database", success: false }, { status: 404 });
        }

        // 2. Generate the custom tokens (as same as manual login)
        const { accessToken, refreshToken } = GenerateToken(user._id);

        const response = NextResponse.json({
            message: "Session synced successfully",
            success: true
        }, { status: 200 });

        const cookieOptions: any = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
        };

        // 3. Set the cookies matching the manual system
        response.cookies.set("Accesstoken", accessToken, {
            ...cookieOptions,
            maxAge: 60 * 30, // 30 minutes
        });

        response.cookies.set("RefreshToken", refreshToken, {
            ...cookieOptions,
            maxAge: 60 * 60 * 24 * 3, // 3 days
        });

        return response;
    } catch (error: any) {
        console.error("Sync Error:", error);
        return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 });
    }
}
