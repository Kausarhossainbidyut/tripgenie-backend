import { model, Schema } from "mongoose";
import { IUser } from "../types/user.interface";

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    avatar: { type: String, default: "" },
  },
  { timestamps: true },
);

export const User = model<IUser>('User', userSchema);
