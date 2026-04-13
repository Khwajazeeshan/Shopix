import connectDB from "@/src/config/dbConfig";
import User from "@/src/models/user";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { GenerateToken } from "@/src/utils/GenerateToken";
import { sendEmail } from "@/src/services/mailer";
import { sendLoginEmail } from "@/src/services/welcome";
import { loginLimit, getIP } from "@/src/lib/ratelimit";

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const { email, password } = await request.json();
        const ip = getIP(request);
        
        // Rate limit by IP + Email
        const identifier = `login:${ip}:${email}`;
        const { success, reset } = await loginLimit.limit(identifier);
        
        if (!success) {
            return NextResponse.json({ 
                message: "Too many attempts. Try again after 12 hours.", 
                reset,
                success: false 
            }, { status: 429 });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ message: "User not found", success: false }, { status: 404 });
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({ message: "Incorrect password", success: false }, { status: 401 });
        }

        // Check for Admin Promotion
        const adminEmail = process.env["Admin-Email"];
        if (adminEmail && email === adminEmail && user.role !== "admin") {
            user.role = "admin";
            await user.save();
        }

        // Check if verified
        if (!user.isVerified) {
            // Send verification email
            await sendEmail({
                email,
                emailType: "VERIFY",
                userId: user._id.toString()
            });
            return NextResponse.json({ message: "Please verify your email first", success: false }, { status: 403 });
        }

        const { accessToken, refreshToken } = GenerateToken(user._id);

        // Send login notification email
        const userAgent = request.headers.get("user-agent") || "Unknown Device";
        const loginTime = new Date().toLocaleString("en-US", { 
            dateStyle: "full", 
            timeStyle: "long" 
        });
        
        await sendLoginEmail({
            email: user.email,
            username: user.name,
            loginTime,
            deviceInfo: userAgent
        });

        // Remove password from response
        const userWithoutPassword = {
            _id: user._id,
            name: user.name,
            email: user.email,
            isVerified: user.isVerified,
            role: user.role,
        };

        const response = NextResponse.json({
            message: "Login successful",
            user: userWithoutPassword,
            success: true
        }, { status: 200 });

        const cookieOptions: any = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
        };

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
        console.error("Login Error:", error);
        return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 });
    }
}