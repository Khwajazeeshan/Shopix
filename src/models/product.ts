import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
    storeId: mongoose.Types.ObjectId;
    sellerId: mongoose.Types.ObjectId;
    name: string;
    description: string;
    price: number;
    quantity: number;
    image: string;
    sold: number;
    category: string;
    rating: number;
    createdAt: Date;
    updatedAt: Date;
}

const productSchema: Schema<IProduct> = new mongoose.Schema(
    {
        storeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Store",
            required: true,
        },
        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: {
            type: String,
            required: [true, "Product name is required"],
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            maxlength: [25, "Description must be max 25 characters"],
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price cannot be negative"],
        },
        quantity: {
            type: Number,
            required: [true, "Quantity is required"],
            min: [0, "Quantity cannot be negative"],
        },
        image: {
            type: String,
            required: [true, "Product image is required"],
        },
        sold: {
            type: Number,
            default: 0,
            min: [0, "Sold count cannot be negative"],
        },
        category: {
            type: String,
            required: [true, "Category is required"],
            default: "General",
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
    },
    {
        timestamps: true,
    }
);

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);

export default Product;
