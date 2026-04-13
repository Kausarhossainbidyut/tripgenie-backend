import { Request, Response } from 'express';
import Stripe from 'stripe';
import config from '../config/db';
import { Booking } from '../models/booking.model';
import { Item } from '../models/item.model';

// Initialize Stripe
const stripe = new Stripe(config.stripe_secret_key || '', {
  apiVersion: '2023-10-16',
});

// Create payment intent
const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user?.email;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required',
      });
    }

    // Get booking details
    const booking = await Booking.findById(bookingId);
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
    const item = await Item.findById(booking.itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: booking.totalPrice * 100, // Convert to cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        bookingId: booking._id?.toString(),
        userId: booking.userId,
        itemTitle: item.title,
      },
    });

    // Update booking with payment intent ID
    await Booking.findByIdAndUpdate(bookingId, {
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
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: err.message,
    });
  }
};

// Confirm payment (webhook or manual confirmation)
const confirmPayment = async (req: Request, res: Response) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID is required',
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update booking status
      const booking = await Booking.findOneAndUpdate(
        { paymentIntentId },
        {
          paymentStatus: 'paid',
          status: 'confirmed',
        },
        { new: true }
      );

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
    } else {
      res.status(400).json({
        success: false,
        message: `Payment status: ${paymentIntent.status}`,
        data: {
          status: paymentIntent.status,
        },
      });
    }
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment',
      error: err.message,
    });
  }
};

// Get payment status
const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user?.email;
    const userRole = req.user?.role;

    const booking = await Booking.findById(bookingId);
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
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status',
      error: err.message,
    });
  }
};

// Process refund
const processRefund = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
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
    const refund = await stripe.refunds.create({
      payment_intent: booking.paymentIntentId,
      amount: booking.refundAmount ? booking.refundAmount * 100 : undefined, // Full refund if not specified
    });

    // Update booking
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        paymentStatus: 'refunded',
        refundStatus: 'completed',
      },
      { new: true }
    );

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
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      error: err.message,
    });
  }
};

export const paymentControllers = {
  createPaymentIntent,
  confirmPayment,
  getPaymentStatus,
  processRefund,
};
