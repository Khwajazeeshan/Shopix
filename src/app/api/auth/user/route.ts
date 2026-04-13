import { connectDB } from '@/src/config/dbConfig';
import { NextRequest, NextResponse } from "next/server";
import { VerifyToken } from "@/src/utils/VerifyToken";
import User from '@/src/models/user';

export async function GET(request: NextRequest) {
    await connectDB();
    try {
        const userId = VerifyToken(request)
        const user = await User.findById(userId).select("-password")
        if (!user) {
            return NextResponse.json({ error: "User not found", success: false }, { status: 404 })
        }
        return NextResponse.json({ data: user, success: true, message: "User found" }, { status: 200 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message, success: false }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    await connectDB();
    try {
        const userId = VerifyToken(request)
        const { name, role } = await request.json();

        if (!name || !role) {
            return NextResponse.json({ error: "Name and role are required", success: false }, { status: 400 })
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, role },
            { new: true }
        ).select("-password")

        if (!updatedUser) {
            return NextResponse.json({ error: "User not found", success: false }, { status: 404 })
        }

        return NextResponse.json({ data: updatedUser, success: true, message: "Profile updated successfully" }, { status: 200 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message, success: false }, { status: 500 })
    }
}