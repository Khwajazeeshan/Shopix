import { connectDB } from "@/src/config/dbConfig";
import Store from "@/src/models/store";
import User from "@/src/models/user";
import Notification from "@/src/models/notification";
import { VerifyToken } from "@/src/utils/VerifyToken";
import { sendStoreCreationEmail, sendStoreRejectionEmail, sendStoreFrozenEmail, sendStoreDeletionEmail } from "@/src/services/storeEmail";
import { deleteFromCloudinary } from "@/src/services/cloudinary";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
    await connectDB();
    try {
        const userId = VerifyToken(request);
        const admin = await User.findById(userId);
        if (!admin || admin.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized. Admin access only.", success: false }, { status: 403 });
        }

        // Get all stores with their seller info for review
        const stores = await Store.find().populate("sellerId", "name email").sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: stores }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message, success: false }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    await connectDB();
    try {
        const userId = VerifyToken(request);
        const admin = await User.findById(userId);
        if (!admin || admin.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized. Admin access only.", success: false }, { status: 403 });
        }

        const { storeId, status } = await request.json(); // status: 'approved' | 'rejected'
        if (!storeId || !status) {
            return NextResponse.json({ error: "Store ID and status are required", success: false }, { status: 400 });
        }

        const updatedStore = await Store.findByIdAndUpdate(storeId, { status }, { new: true }).populate("sellerId", "name email");
        if (!updatedStore) {
            return NextResponse.json({ error: "Store not found", success: false }, { status: 404 });
        }

        // Send email notification to seller
        const seller: any = updatedStore.sellerId;
        if (seller && seller.email) {
            if (status === "approved") {
                await sendStoreCreationEmail({
                    email: seller.email,
                    sellerName: seller.name,
                    storeName: updatedStore.name
                });
            } else if (status === "rejected") {
                await sendStoreRejectionEmail({
                    email: seller.email,
                    sellerName: seller.name,
                    storeName: updatedStore.name,
                    reason: "Your store does not meet our platform requirements at this time."
                });
            } else if (status === "frozen") {
                await sendStoreFrozenEmail({
                    email: seller.email,
                    sellerName: seller.name,
                    storeName: updatedStore.name,
                    reason: "Your store has been frozen due to a policy violation or maintenance requirement."
                });
            }
        }

        // --- In-App Notification for Seller ---
        try {
            let notifMessage = "";
            if (status === "approved") notifMessage = `Congratulations! Your store "${updatedStore.name}" has been approved.`;
            else if (status === "rejected") notifMessage = `Your store "${updatedStore.name}" application was rejected.`;
            else if (status === "frozen") notifMessage = `Your store "${updatedStore.name}" has been frozen by an administrator.`;

            if (notifMessage) {
                await Notification.create({
                    userId: updatedStore.sellerId,
                    message: notifMessage,
                    type: "store",
                    link: "/store/dashboard"
                });
            }
        } catch (notifError) {
            console.error("Failed to create in-app notification:", notifError);
        }

        const actionText = status === 'frozen' ? 'frozen' : (status === 'approved' ? 'approved/unfrozen' : status);
        return NextResponse.json({ success: true, message: `Store ${actionText} successfully`, data: updatedStore }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message, success: false }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    await connectDB();
    try {
        const userId = VerifyToken(request);
        const admin = await User.findById(userId);
        if (!admin || admin.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized. Admin access only.", success: false }, { status: 403 });
        }

        const { storeId, password } = await request.json();
        if (!storeId || !password) {
            return NextResponse.json({ error: "Store ID and password are required", success: false }, { status: 400 });
        }

        // Verify admin password
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return NextResponse.json({ error: "Authentication failed. Incorrect password.", success: false }, { status: 401 });
        }

        const storeToDelete = await Store.findById(storeId).populate("sellerId", "name email");
        if (!storeToDelete) {
            return NextResponse.json({ error: "Store not found", success: false }, { status: 404 });
        }

        const seller: any = storeToDelete.sellerId;
        const storeName = storeToDelete.name;

        // Delete logo from Cloudinary
        if (storeToDelete.logo) {
            await deleteFromCloudinary(storeToDelete.logo);
        }

        await Store.findByIdAndDelete(storeId);

        // Send store deletion email to seller
        if (seller && seller.email) {
            await sendStoreDeletionEmail({
                email: seller.email,
                sellerName: seller.name,
                storeName: storeName
            });
        }

        return NextResponse.json({ success: true, message: "Store deleted successfully" }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message, success: false }, { status: 500 });
    }
}
