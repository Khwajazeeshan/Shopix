import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  message: string;
  type: "order" | "return" | "store" | "system" | "admin" | "chat";
  isRead: boolean;
  link?: string;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema: Schema<INotification> = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["order", "return", "store", "system", "admin", "chat"],
      default: "system",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast lookups by user and read status
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification: Model<INotification> = 
  mongoose.models.Notification || mongoose.model<INotification>("Notification", notificationSchema);

export default Notification;
