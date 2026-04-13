import { connectDB } from "@/src/config/dbConfig";
import User from "@/src/models/user";
import Store from "@/src/models/store";
import Product from "@/src/models/product";
import Order from "@/src/models/order";
import Cart from "@/src/models/cart";
import Review from "@/src/models/review";
import { VerifyToken } from "@/src/utils/VerifyToken";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sendAccountDeletionEmail } from "@/src/services/welcome";

export async function GET(request: NextRequest) {
    await connectDB();
    try {
        const userId = VerifyToken(request);
        const admin = await User.findById(userId);
        if (!admin || admin.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized. Admin access only.", success: false }, { status: 403 });
        }

        const users = await User.find({ role: { $ne: "admin" } }).select("-password").sort({ createdAt: -1 });
        
        const customers = users.filter((user: any) => user.role === "customer");
        const sellers = users.filter((user: any) => user.role === "seller");

        return NextResponse.json({
            success: true,
            data: { customers, sellers }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message, success: false }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    await connectDB();
    try {
        const userIdFromToken = VerifyToken(request);
        const admin = await User.findById(userIdFromToken);
        if (!admin || admin.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized. Admin access only.", success: false }, { status: 403 });
        }

        const { userId, password } = await request.json();
        if (!userId || !password) {
            return NextResponse.json({ error: "User ID and password are required", success: false }, { status: 400 });
        }

        // Verify admin password
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return NextResponse.json({ error: "Authentication failed. Incorrect password.", success: false }, { status: 401 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: "User not found", success: false }, { status: 404 });
        }

        // Logic to delete everything related to user
        if (user.role === "seller") {
            const store = await Store.findOne({ sellerId: userId });
            if (store) {
                // Delete products reviews
                const products = await Product.find({ storeId: store._id });
                const productIds = products.map(p => p._id);
                await Review.deleteMany({ productId: { $in: productIds } });
                
                // Delete products
                await Product.deleteMany({ storeId: store._id });
                
                // Delete store
                await Store.deleteOne({ _id: store._id });
            }
        }

        // Common things for both roles
        await Review.deleteMany({ userId: userId });
        await Cart.deleteMany({ userId: userId });
        await Order.deleteMany({ userId: userId });
        
        // Final user deletion
        const userEmail = user.email;
        const userName = user.name;
        
        await User.findByIdAndDelete(userId);

        // Send deletion notification email
        await sendAccountDeletionEmail({
            email: userEmail,
            username: userName
        });

        return NextResponse.json({
            success: true,
            message: "User and all associated data deleted successfully"
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message, success: false }, { status: 500 });
    }
}
