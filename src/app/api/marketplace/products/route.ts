import { connectDB } from "@/src/config/dbConfig";
import Product from "@/src/models/product";
import Store from "@/src/models/store";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    await connectDB();
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        const category = searchParams.get("category");
        const minPrice = Number(searchParams.get("minPrice")) || 0;
        const maxPrice = Number(searchParams.get("maxPrice")) || 1000000;
        const minRating = Number(searchParams.get("minRating")) || 0;
        const sort = searchParams.get("sort"); // 'price-asc', 'price-desc', 'newest', 'sold-desc'

        // 1. Get approved store IDs
        const approvedStores = await Store.find({ status: "approved" }).select("_id");
        const storeIds = approvedStores.map(store => store._id);

        // 2. Build Query
        let query: any = {
            storeId: { $in: storeIds },
            quantity: { $gt: 0 },
            price: { $gte: minPrice, $lte: maxPrice },
            rating: { $gte: minRating }
        };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { category: { $regex: search, $options: "i" } }
            ];
        }

        if (category && category !== "null") {
            query.category = { $regex: `^${category}$`, $options: "i" };
        }

        // 3. Build Sort
        let sortQuery: any = { createdAt: -1 }; // Default: newest
        if (sort === "price-asc") sortQuery = { price: 1 };
        else if (sort === "price-desc") sortQuery = { price: -1 };
        else if (sort === "sold-desc") sortQuery = { sold: -1 };
        else if (sort === "rating-desc") sortQuery = { rating: -1 };

        const products = await Product.find(query)
            .sort(sortQuery)
            .limit(50) // Production-ready limit
            .populate("storeId", "name logo");

        return NextResponse.json({ 
            success: true, 
            products,
            count: products.length
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message, success: false }, { status: 500 });
    }
}
