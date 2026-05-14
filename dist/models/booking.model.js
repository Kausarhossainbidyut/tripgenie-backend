"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Booking = void 0;
const mongoose_1 = require("mongoose");
const bookingSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, ref: 'User' },
    itemId: { type: String, required: true, ref: 'Item' },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    totalPrice: { type: Number, required: true, min: 0 },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentIntentId: { type: String, default: '' },
    refundStatus: {
        type: String,
        enum: ['none', 'pending', 'completed'],
        default: 'none'
    },
    refundAmount: { type: Number, default: 0 },
    cancelledAt: { type: Date },
    cancellationReason: { type: String, default: '' },
}, { timestamps: true });
exports.Booking = (0, mongoose_1.model)('Booking', bookingSchema);
