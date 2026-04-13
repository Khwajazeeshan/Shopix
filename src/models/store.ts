import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStore extends Document {
    sellerId: mongoose.Types.ObjectId;
    name: string;
    description: string;
    type: "Individual" | "Company";
    logo: string;
    status: "pending" | "approved" | "rejected" | "frozen";
    createdAt: Date;
    updatedAt: Date;
}

const storeSchema: Schema<IStore> = new mongoose.Schema(
    {
        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: [true, "Store name is required"],
            minlength: [4, "Store name must be at least 4 characters"],
        },
        description: {
            type: String,
            required: [true, "Store description is required"],
        },
        type: {
            type: String,
            required: true,
            enum: ["Individual", "Company"],
        },
        logo: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "frozen"],
            default: "pending",
        },
    },
    {
        timestamps: true,
    }
);

const Store: Model<IStore> = mongoose.models.Store || mongoose.model<IStore>("Store", storeSchema);

export default Store;
