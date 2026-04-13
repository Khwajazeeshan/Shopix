const mongoose = require("mongoose");
const Review = require("../models/review.ts").default || require("../models/review.ts");
const Product = require("../models/product.ts").default || require("../models/product.ts");

const MONGODB_URI = "mongodb://localhost:27017/E-commerce"; // This is just a placeholder, but I'll use the one from .env if possible

async function syncRatings() {
    try {
        const products = await Product.find({});
        for (const product of products) {
            const reviews = await Review.find({ productId: product._id });
            if (reviews.length > 0) {
                const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
                product.rating = avg;
                await product.save();
                console.log(`Updated rating for ${product.name} to ${avg.toFixed(1)}`);
            }
        }
        console.log("Sync complete!");
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
// syncRatings();
