import connectDB from "@/src/config/dbConfig";
import User from "@/src/models/user";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/src/services/mailer";
import { sendWelcomeEmail } from "@/src/services/welcome";
import { signupLimit, getIP } from "@/src/lib/ratelimit";

export async function POST(request: NextRequest) {
    try {
        const ip = getIP(request);
        const { success } = await signupLimit.limit(`signup:${ip}`);
        
        if (!success) {
            return NextResponse.json({ 
                message: "Too many requests. Please slow down.", 
                success: false 
            }, { status: 429 });
        }

        await connectDB();
        const { name, email, password, role } = await request.json();

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: "Email Already Exists", success: false }, { status: 400 });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Determine final role
        let finalRole = role;
        const adminEmail = process.env["Admin-Email"];
        if (adminEmail && email === adminEmail) {
            finalRole = "admin";
        }

        // Create user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: finalRole
        });

        const savedUser = await newUser.save();

        await sendEmail({
            email,
            emailType: "VERIFY",
            userId: savedUser._id.toString()
        });

        // Send welcome email
        await sendWelcomeEmail({
            email,
            username: name
        });

        return NextResponse.json({
            message: "Verify your email to continue",
            success: true
        }, { status: 201 });

    } catch (error: any) {
        console.error("Signup Error:", error);
        return NextResponse.json({ message: "Internal server error", success: false }, { status: 500 });
    }
}