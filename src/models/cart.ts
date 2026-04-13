import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICart extends Document {
    userId: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const cartSchema: Schema<ICart> = new mongoose.Schema(
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

// Ensure a user can't add the same product multiple times in this simple implementation
cartSchema.index({ userId: 1, productId: 1 }, { unique: true });

const Cart: Model<ICart> = mongoose.models.Cart || mongoose.model<ICart>("Cart", cartSchema);

export default Cart;
