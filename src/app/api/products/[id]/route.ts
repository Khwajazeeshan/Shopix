import { connectDB } from "@/src/config/dbConfig";
import Product from "@/src/models/product";
import Store from "@/src/models/store";
import User from "@/src/models/user";
import { VerifyToken } from "@/src/utils/VerifyToken";
import { sendProductsClearedEmail } from "@/src/services/storeEmail";
import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary, deleteFromCloudinary } from "@/src/services/cloudinary";
import bcrypt from "bcryptjs";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    await connectDB();
    try {
        const userId = VerifyToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 });
        }

        const { id } = await params;
        const product = await Product.findOne({ _id: id, sellerId: userId });
        if (!product) {
            return NextResponse.json({ error: "Product not found or unauthorized", success: false }, { status: 404 });
        }

        const formData = await request.formData();
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const price = Number(formData.get("price"));
        const quantity = Number(formData.get("quantity"));
        const file = formData.get("image") as File;

        if (name) product.name = name;
        if (description) {
            if (description.length > 25) {
                return NextResponse.json({ error: "Description must be maximum 25 characters", success: false }, { status: 400 });
            }
            product.description = description;
        }
        if (!isNaN(price)) product.price = price;
        if (!isNaN(quantity)) product.quantity = quantity;

        if (file && typeof file !== "string" && file.size > 0) {
            // Delete old image if it exists in Cloudinary
            if (product.image) {
                await deleteFromCloudinary(product.image);
            }

            // Upload new image
            const imageUrl = await uploadToCloudinary(file, "products");
            product.image = imageUrl;
        }

        await product.save();

        return NextResponse.json({ success: true, message: "Product updated successfully", data: product }, { status: 200 });

    } catch (error: any) {
        const status = error.message === "Token not found" || error.message === "jwt expired" ? 401 : 500;
        return NextResponse.json({ error: error.message, success: false }, { status });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    await connectDB();
    try {
        const userId = VerifyToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 });
        }

        const { id } = await params;
        const user = await User.findById(userId).select("+password");
        if (!user) {
            return NextResponse.json({ error: "User not found", success: false }, { status: 404 });
        }

        const isAdmin = user.role === "admin";

        // Delete all products for a specific user if id is 'all'
        if (id === "all") {
            const { password } = await request.json();
            if (!password) {
                return NextResponse.json({ error: "Password is required", success: false }, { status: 400 });
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return NextResponse.json({ error: "Incorrect password", success: false }, { status: 401 });
            }

            const store = await Store.findOne({ sellerId: userId });
            if (!store) {
                return NextResponse.json({ error: "Store not found", success: false }, { status: 404 });
            }
            await Product.deleteMany({ storeId: store._id });

            // Send products cleared email notification
            await sendProductsClearedEmail({
                email: user.email,
                sellerName: user.name,
                storeName: store.name
            });

            return NextResponse.json({ success: true, message: "All products deleted successfully" }, { status: 200 });
        }

        // Delete specific product
        let query: any = { _id: id };
        if (!isAdmin) {
            query.sellerId = userId;
        }

        const product = await Product.findOne(query);
        if (!product) {
            return NextResponse.json({ error: "Product not found or unauthorized", success: false }, { status: 404 });
        }

        // Delete image from Cloudinary
        if (product.image) {
            await deleteFromCloudinary(product.image);
        }

        await Product.findByIdAndDelete(id);
        return NextResponse.json({ success: true, message: "Product deleted successfully" }, { status: 200 });

    } catch (error: any) {
        const status = error.message === "Token not found" || error.message === "jwt expired" ? 401 : 500;
        return NextResponse.json({ error: error.message, success: false }, { status });
    }
}
