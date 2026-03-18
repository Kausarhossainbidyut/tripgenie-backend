import { model, Schema } from "mongoose";
import { IWishlist } from "../types/user.interface";

const wishlistSchema = new Schema<IWishlist>(
  {
    userId: { type: String, required: true, ref: 'User' },
    itemId: { type: String, required: true, ref: 'Item' },
  },
  { timestamps: true },
);

// Compound index to prevent duplicate wishlist entries
wishlistSchema.index({ userId: 1, itemId: 1 }, { unique: true });

export const Wishlist = model<IWishlist>('Wishlist', wishlistSchema);
