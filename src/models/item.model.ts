import { model, Schema } from "mongoose";
import { IItem } from "../types/user.interface";

const itemSchema = new Schema<IItem>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    rating: { type: Number, required: true, min: 0, max: 5, default: 0 },
    location: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    createdBy: { type: String, ref: 'User' },
  },
  { timestamps: true },
);

export const Item = model<IItem>('Item', itemSchema);
