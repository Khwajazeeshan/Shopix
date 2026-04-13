import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        storeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Store",
            required: true,
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        receiverName: {
            type: String,
            required: true,
        },
        mobileNumber: {
            type: String,
            required: true,
        },
        billingAddress: {
            type: String,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            default: 1,
        },
        paymentMethod: {
            type: String,
            enum: ["cod", "online"],
            required: true,
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["new", "progress", "completed"],
            default: "new",
        },
        paymentStatus: {
            type: String,
            enum: ["Pending", "Paid", "Failed"],
            default: "Pending",
        },
        stripePaymentId: {
            type: String,
            default: null,
        },
        returnStatus: {
            type: String,
            enum: ["none", "processing", "successful", "failed"],
            default: "none",
        },
        returnReason: {
            type: String,
            default: null,
        },
        returnPhotos: {
            type: [String],
            default: [],
        },
        deliveredAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

export default Order;
