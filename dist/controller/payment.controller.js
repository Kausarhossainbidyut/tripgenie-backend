"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentControllers = void 0;
const stripe_1 = __importDefault(require("stripe"));
const db_1 = __importDefault(require("../config/db"));
const booking_model_1 = require("../models/booking.model");
const item_model_1 = require("../models/item.model");
// Lazy Stripe instance — created on first use so env vars are fully loaded
// Top-level new Stripe() crashes the entire serverless function if key is missing
let _stripe = null;
const getStripe = () => {
    if (!_stripe) {
        if (!db_1.default.stripe_secret_key) {
            throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
        }
        _stripe = new stripe_1.default(db_1.default.stripe_secret_key, {
            apiVersion: '2026-04-22.dahlia',
        });
    }
    return _stripe;
};
// Create payment intent
const createPaymentIntent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { bookingId } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: 'Booking ID is required',
            });
        }
        // Get booking details
        const booking = yield booking_model_1.Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }
        // Check if user owns this booking
        if (booking.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only pay for your own bookings.',
            });
        }
        // Check if already paid
        if (booking.paymentStatus === 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Booking is already paid',
            });
        }
        // Get item details
        const item = yield item_model_1.Item.findById(booking.itemId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found',
            });
        }
        // Create payment intent with Stripe
        const paymentIntent = yield getStripe().paymentIntents.create({
            amount: booking.totalPrice * 100, // Convert to cents
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                bookingId: (_b = booking._id) === null || _b === void 0 ? void 0 : _b.toString(),
                userId: booking.userId,
                itemTitle: item.title,
            },
        });
        // Update booking with payment intent ID
        yield booking_model_1.Booking.findByIdAndUpdate(bookingId, {
            paymentIntentId: paymentIntent.id,
        });
        res.status(200).json({
            success: true,
            message: 'Payment intent created successfully',
            data: {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
                amount: booking.totalPrice,
                currency: 'usd',
            },
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to create payment intent',
            error: err.message,
        });
    }
});
// Confirm payment (webhook or manual confirmation)
const confirmPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { paymentIntentId } = req.body;
        if (!paymentIntentId) {
            return res.status(400).json({
                success: false,
                message: 'Payment intent ID is required',
            });
        }
        // Retrieve payment intent from Stripe
        const paymentIntent = yield getStripe().paymentIntents.retrieve(paymentIntentId);
        if (paymentIntent.status === 'succeeded') {
            // Update booking status
            const booking = yield booking_model_1.Booking.findOneAndUpdate({ paymentIntentId }, {
                paymentStatus: 'paid',
                status: 'confirmed',
            }, { new: true });
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found',
                });
            }
            res.status(200).json({
                success: true,
                message: 'Payment confirmed successfully',
                data: {
                    booking,
                    paymentStatus: paymentIntent.status,
                },
            });
        }
        else {
            res.status(400).json({
                success: false,
                message: `Payment status: ${paymentIntent.status}`,
                data: {
                    status: paymentIntent.status,
                },
            });
        }
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to confirm payment',
            error: err.message,
        });
    }
});
// Get payment status
const getPaymentStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { bookingId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
        const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
        const booking = yield booking_model_1.Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }
        // Check if user owns this booking or is admin
        if (userRole !== 'admin' && booking.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
            });
        }
        res.status(200).json({
            success: true,
            message: 'Payment status retrieved',
            data: {
                bookingId: booking._id,
                paymentStatus: booking.paymentStatus,
                paymentIntentId: booking.paymentIntentId,
                totalPrice: booking.totalPrice,
            },
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to get payment status',
            error: err.message,
        });
    }
});
// Process refund
const processRefund = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookingId } = req.body;
        const booking = yield booking_model_1.Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }
        // Check if payment was made
        if (booking.paymentStatus !== 'paid' || !booking.paymentIntentId) {
            return res.status(400).json({
                success: false,
                message: 'No payment found for this booking',
            });
        }
        // Process refund with Stripe
        const refund = yield getStripe().refunds.create({
            payment_intent: booking.paymentIntentId,
            amount: booking.refundAmount ? booking.refundAmount * 100 : undefined, // Full refund if not specified
        });
        // Update booking
        const updatedBooking = yield booking_model_1.Booking.findByIdAndUpdate(bookingId, {
            paymentStatus: 'refunded',
            refundStatus: 'completed',
        }, { new: true });
        res.status(200).json({
            success: true,
            message: 'Refund processed successfully',
            data: {
                booking: updatedBooking,
                refundId: refund.id,
                refundAmount: refund.amount ? refund.amount / 100 : 0,
                status: refund.status,
            },
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to process refund',
            error: err.message,
        });
    }
});
exports.paymentControllers = {
    createPaymentIntent,
    confirmPayment,
    getPaymentStatus,
    processRefund,
};
