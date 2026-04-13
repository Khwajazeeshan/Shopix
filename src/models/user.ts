import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    isVerified: boolean;
    forgotPasswordToken: string | null;
    forgotPasswordTokenExpiry: Date | null;
    verifyToken: string | null;
    verifyTokenExpiry: Date | null;
    role: string;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please provide a name"],
        },
        email: {
            type: String,
            required: [true, "Please provide an email"],
            unique: true,
        },
        password: {
            type: String,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        forgotPasswordToken: String,
        forgotPasswordTokenExpiry: Date,
        verifyToken: String,
        verifyTokenExpiry: Date,
        role: {
            type: String,
            required: [true, "Please provide a role"],
            enum: ["customer", "seller", "admin"],
            default: "customer",
        },
    },
    {
        timestamps: true,
    }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
