"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Item = void 0;
const mongoose_1 = require("mongoose");
const itemSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    gallery: [{ type: String }], // Multiple images array
    price: { type: Number, required: true, min: 0 },
    rating: { type: Number, required: true, min: 0, max: 5, default: 0 },
    location: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    createdBy: { type: String, ref: 'User' },
}, { timestamps: true });
exports.Item = (0, mongoose_1.model)('Item', itemSchema);
