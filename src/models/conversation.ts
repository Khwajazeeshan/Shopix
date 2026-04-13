import mongoose, { Schema, Document, Model } from "mongoose";

export interface IConversation extends Document {
  customerId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  lastMessage: string;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema: Schema<IConversation> = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    lastMessage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a single conversation between a buyer and seller about a specific product
conversationSchema.index({ customerId: 1, sellerId: 1, productId: 1 }, { unique: true });

const Conversation: Model<IConversation> =
  mongoose.models.Conversation || mongoose.model<IConversation>("Conversation", conversationSchema);

export default Conversation;
