import { connectDB } from "@/src/config/dbConfig";
import Product from "@/src/models/product";
import Store from "@/src/models/store";
import { VerifyToken } from "@/src/utils/VerifyToken";
import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/src/services/cloudinary";

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
        const price = Number(formData.get("price"));
        const quantity = Number(formData.get("quantity"));
        const file = formData.get("image") as File;

        if (!name || !description || isNaN(price) || isNaN(quantity) || !file) {
            return NextResponse.json({ error: "All fields are required.", success: false }, { status: 400 });
        }

        if (description.length > 25) {
             return NextResponse.json({ error: "Description must be maximum 25 characters", success: false }, { status: 400 });
        }

        // Check if user has an approved store
        const store = await Store.findOne({ sellerId: userId, status: "approved" });
        if (!store) {
            return NextResponse.json({ error: "You must have an approved store to add products", success: false }, { status: 403 });
        }

        // Upload to Cloudinary
        const imageUrl = await uploadToCloudinary(file, "products");

        const newProduct = new Product({
            storeId: store._id,
            sellerId: userId,
            name,
            description,
            price,
            quantity,
            image: imageUrl
        });

        await newProduct.save();

        return NextResponse.json({ success: true, message: "Product added successfully", data: newProduct }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message, success: false }, { status: 500 });
    }
}

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

        const products = await Product.find({ storeId: store._id }).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, products }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message, success: false }, { status: 500 });
    }
}
