"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wishlist = void 0;
const mongoose_1 = require("mongoose");
const wishlistSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, ref: 'User' },
    itemId: { type: String, required: true, ref: 'Item' },
}, { timestamps: true });
// Compound index to prevent duplicate wishlist entries
wishlistSchema.index({ userId: 1, itemId: 1 }, { unique: true });
exports.Wishlist = (0, mongoose_1.model)('Wishlist', wishlistSchema);
