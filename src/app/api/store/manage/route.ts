import { connectDB } from "@/src/config/dbConfig";
import bcrypt from "bcryptjs";
import Store from "@/src/models/store";
import User from "@/src/models/user";
import { VerifyToken } from "@/src/utils/VerifyToken";
import { sendStoreDeletionEmail } from "@/src/services/storeEmail";
import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary, deleteFromCloudinary } from "@/src/services/cloudinary";

export async function GET(request: NextRequest) {
    await connectDB();
    try {
        const userId = VerifyToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 });
        }

        const store = await Store.findOne({ sellerId: userId });
        if (!store) {
            return NextResponse.json({ error: "Store not found", success: false }, { status: 404 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: "User not found", success: false }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            store: {
                ...store.toObject(),
                sellerEmail: user.email
            }
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message, success: false }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    await connectDB();
    try {
        const userId = VerifyToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 });
        }

        const formData = await request.formData();
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const type = formData.get("type") as string;
        const file = formData.get("logo") as File;

        const store = await Store.findOne({ sellerId: userId });
        if (!store) {
            return NextResponse.json({ error: "Store not found", success: false }, { status: 404 });
        }

        if (name) store.name = name;
        if (description) store.description = description;
        if (type) store.type = type as any;

        if (file && typeof file !== "string" && file.size > 0) {
            // Delete old logo if it exists in Cloudinary
            if (store.logo) {
                await deleteFromCloudinary(store.logo);
            }
            
            // Upload new logo
            const logoUrl = await uploadToCloudinary(file, "stores");
            store.logo = logoUrl;
        }

        await store.save();

        return NextResponse.json({ success: true, message: "Store updated successfully", store }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message, success: false }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    await connectDB();
    try {
        const userId = VerifyToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 });
        }

        const { password } = await request.json();
        if (!password) {
            return NextResponse.json({ error: "Password is required", success: false }, { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: "User not found", success: false }, { status: 404 });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({ error: "Incorrect password. Authorization failed.", success: false }, { status: 401 });
        }

        const store = await Store.findOneAndDelete({ sellerId: userId });
        if (!store) {
            return NextResponse.json({ error: "Store not found", success: false }, { status: 404 });
        }

        // Delete logo from Cloudinary
        if (store.logo) {
            await deleteFromCloudinary(store.logo);
        }

        // Send deletion notification email
        await sendStoreDeletionEmail({
            email: user.email,
            sellerName: user.name,
            storeName: store.name
        });

        return NextResponse.json({ success: true, message: "Store deleted successfully" }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message, success: false }, { status: 500 });
    }
}
