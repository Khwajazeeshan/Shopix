import { connectDB } from "@/src/config/dbConfig";
import Store from "@/src/models/store";
import { VerifyToken } from "@/src/utils/VerifyToken";
import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary, deleteFromCloudinary } from "@/src/services/cloudinary";
import User from "@/src/models/user";
import Notification from "@/src/models/notification";
import { sendAdminStoreNotificationEmail } from "@/src/services/storeEmail";

export async function GET(request: NextRequest) {
    await connectDB();
    try {
        const userId = VerifyToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 });
        }

        const store = await Store.findOne({ sellerId: userId });
        if (store) {
            return NextResponse.json({ success: true, store }, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "No store found" }, { status: 404 });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message, success: false }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
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

        if (!name || !description || !type || !file) {
            return NextResponse.json({ error: "All fields are required. Please fill in all inputs and upload a logo.", success: false }, { status: 400 });
        }

        if (name.length < 4) {
            return NextResponse.json({ error: "Store name must be at least 4 characters", success: false }, { status: 400 });
        }

        // Check if store name already exists
        const storeNameExists = await Store.findOne({ name });
        if (storeNameExists && (!storeNameExists.sellerId.equals(userId) || storeNameExists.status === "approved")) {
             return NextResponse.json({ error: "Store name already exists. Please choose a different name.", success: false }, { status: 400 });
        }

        // Check word count for description (max 100 words)
        const wordCount = description.trim().split(/\s+/).length;
        if (wordCount > 100) {
            return NextResponse.json({ error: "Description must be max 100 words", success: false }, { status: 400 });
        }

        // Upload to Cloudinary
        const logoUrl = await uploadToCloudinary(file, "stores");

        const existingStore = await Store.findOne({ sellerId: userId });

        if (existingStore) {
            if (existingStore.status === "approved") {
                return NextResponse.json({ error: "You already have an approved store", success: false }, { status: 400 });
            }
            if (existingStore.status === "pending") {
                return NextResponse.json({ error: "Store creation approval is already pending", success: false }, { status: 400 });
            }

            // If rejected, update the existing record to allow re-submission
            // Delete old logo if it exists in Cloudinary
            if (existingStore.logo) {
                await deleteFromCloudinary(existingStore.logo);
            }

            existingStore.name = name;
            existingStore.description = description;
            existingStore.type = type as any;
            existingStore.logo = logoUrl;
            existingStore.status = "pending";
            await existingStore.save();

            // Notify Admin
            const user = await User.findById(userId);
            if (user) {
                await sendAdminStoreNotificationEmail({
                    adminEmail: process.env.ADMIN_EMAIL!,
                    sellerName: user.name,
                    sellerEmail: user.email,
                    storeName: name,
                    storeDescription: description
                });
            }

            // --- In-App Notification for Admins ---
            try {
                const admins = await User.find({ role: "admin" });
                const creationPromises = admins.map(admin => 
                    Notification.create({
                        userId: admin._id,
                        message: `New store re-submission: "${name}" from ${user?.name || 'Seller'}`,
                        type: "admin",
                        link: `/admin/dashboard`
                    })
                );
                await Promise.all(creationPromises);
            } catch (notifError) {
                console.error("Failed to notify admins:", notifError);
            }


            return NextResponse.json({ success: true, message: "Store re-submitted for approval", data: existingStore }, { status: 200 });
        }

        const newStore = new Store({
            sellerId: userId,
            name,
            description,
            type,
            logo: logoUrl,
            status: "pending"
        });

        await newStore.save();

        // Notify Admin
        const user = await User.findById(userId);
        if (user) {
            await sendAdminStoreNotificationEmail({
                adminEmail: process.env.ADMIN_EMAIL!,
                sellerName: user.name,
                sellerEmail: user.email,
                storeName: name,
                storeDescription: description
            });
        }

        // --- In-App Notification for Admins ---
        try {
            const admins = await User.find({ role: "admin" });
            const creationPromises = admins.map(admin => 
                Notification.create({
                    userId: admin._id,
                    message: `New store approval request: "${name}" from ${user?.name || 'Seller'}`,
                    type: "admin",
                    link: `/admin/dashboard`
                })
            );
            await Promise.all(creationPromises);
        } catch (notifError) {
            console.error("Failed to notify admins:", notifError);
        }


        return NextResponse.json({ success: true, message: "Store submitted for approval", data: newStore }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message, success: false }, { status: 500 });
    }
}
