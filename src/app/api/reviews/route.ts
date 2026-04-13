import { connectDB } from "@/src/config/dbConfig";
import Review from "@/src/models/review";
import { VerifyToken } from "@/src/utils/VerifyToken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const userId = VerifyToken(request);
        const reqBody = await request.json();
        const { productId, rating, comment } = reqBody;

        if (!productId || !rating || !comment) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        const newReview = new Review({
            productId,
            userId,
            rating,
            comment,
        });

        await newReview.save();
        
        // Recalculate average rating for the product
        const productReviews = await Review.find({ productId });
        const avgRating = productReviews.length > 0
          ? productReviews.reduce((sum, rev) => sum + rev.rating, 0) / productReviews.length
          : 0;
        
        const ProductModel = (await import("@/src/models/product")).default;
        await ProductModel.findByIdAndUpdate(productId, { rating: avgRating });

        return NextResponse.json({
            success: true,
            message: "Review submitted successfully",
            review: newReview,
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
