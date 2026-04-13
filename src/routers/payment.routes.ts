import { Router } from 'express';
import { paymentControllers } from '../controller/payment.controller';
import { verifyToken, isAdmin } from '../middlewares/auth';

const router = Router();

// Create payment intent
router.post('/create-intent', verifyToken, paymentControllers.createPaymentIntent);

// Confirm payment
router.post('/confirm', verifyToken, paymentControllers.confirmPayment);

// Get payment status
router.get('/status/:bookingId', verifyToken, paymentControllers.getPaymentStatus);

// Process refund (admin only)
router.post('/refund', verifyToken, isAdmin, paymentControllers.processRefund);

export const PaymentRoutes = router;
