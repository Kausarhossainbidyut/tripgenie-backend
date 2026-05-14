"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRoutes = void 0;
const express_1 = require("express");
const payment_controller_1 = require("../controller/payment.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Create payment intent
router.post('/create-intent', auth_1.verifyToken, payment_controller_1.paymentControllers.createPaymentIntent);
// Confirm payment
router.post('/confirm', auth_1.verifyToken, payment_controller_1.paymentControllers.confirmPayment);
// Get payment status
router.get('/status/:bookingId', auth_1.verifyToken, payment_controller_1.paymentControllers.getPaymentStatus);
// Process refund (admin only)
router.post('/refund', auth_1.verifyToken, auth_1.isAdmin, payment_controller_1.paymentControllers.processRefund);
exports.PaymentRoutes = router;
