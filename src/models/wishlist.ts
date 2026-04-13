import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWishlist extends Document {
    userId: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const wishlistSchema: Schema<IWishlist> = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate entries for the same user and product
wishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

const Wishlist: Model<IWishlist> = mongoose.models.Wishlist || mongoose.model<IWishlist>("Wishlist", wishlistSchema);

export default Wishlist;
