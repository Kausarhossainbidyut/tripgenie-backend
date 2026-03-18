import { model, Schema } from "mongoose";
import { IReview } from "../types/user.interface";

const reviewSchema = new Schema<IReview>(
  {
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    userId: { type: String, required: true, ref: 'User' },
    itemId: { type: String, required: true, ref: 'Item' },
  },
  { timestamps: true },
);

export const Review = model<IReview>('Review', reviewSchema);
