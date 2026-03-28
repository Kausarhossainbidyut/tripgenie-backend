import { Request, Response } from 'express';
import { Booking } from '../models/booking.model';
import { Item } from '../models/item.model';
import { User } from '../models/user.model';
import { sendBookingConfirmationEmail } from '../utils/email.service';

// Create new booking
const createBooking = async (req: Request, res: Response) => {
  try {
    const { itemId, quantity } = req.body;
    
    // Validate required fields
    if (!itemId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Item ID and quantity are required',
      });
    }

    // Get user email from token
    const userId = req.user?.email;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Get item details to calculate total price
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    // Check if item has enough quantity available
    if (item.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Not enough quantity available. Only ${item.quantity} left.`,
      });
    }

    // Validate quantity is positive
    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0',
      });
    }

    const totalPrice = item.price * quantity;

    // Create booking
    const newBooking = await Booking.create({
      userId,
      itemId,
      quantity,
      totalPrice,
      status: 'pending'
    });

    // Decrease item quantity
    item.quantity -= quantity;
    await item.save();

    // Send booking confirmation email
    try {
      const user = await User.findOne({ email: userId });
      if (user) {
        await sendBookingConfirmationEmail(
          user.email,
          user.name,
          {
            itemTitle: item.title,
            quantity,
            totalPrice,
            status: 'pending'
          }
        );
      }
    } catch (emailErr) {
      console.error('Failed to send booking confirmation email:', emailErr);
      // Don't fail booking if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: newBooking,
    });
  } catch (err: any) {
    console.error('Error creating booking:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: err.message,
    });
  }
};

// Get all bookings (Admin - all, User - own bookings)
const getBookings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.email;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    let bookings;
    if (userRole === 'admin') {
      // Admin sees all bookings
      bookings = await Booking.find().sort({ createdAt: -1 });
    } else {
      // User sees only their bookings
      bookings = await Booking.find({ userId }).sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      message: 'Bookings fetched successfully',
      data: bookings,
    });
  } catch (err: any) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: err.message,
    });
  }
};

// Get booking by ID
const getBookingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.email;
    const userRole = req.user?.role;

    const booking = await Booking.findById(id);
    
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
        message: 'Access denied. You can only view your own bookings.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking fetched successfully',
      data: booking,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: err.message,
    });
  }
};

// Update booking status
const updateBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      data: updatedBooking,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update booking',
      error: err.message,
    });
  }
};

// Delete booking
const deleteBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedBooking = await Booking.findByIdAndDelete(id);

    if (!deletedBooking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully',
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete booking',
      error: err.message,
    });
  }
};

// Cancel booking
const cancelBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user?.email;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const booking = await Booking.findById(id);

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
        message: 'Access denied. You can only cancel your own bookings.',
      });
    }

    // Check if booking is already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled',
      });
    }

    // Get item to restore stock (handle case where item may be deleted)
    const item = await Item.findById(booking.itemId);
    if (item) {
      // Restore item quantity
      item.quantity += booking.quantity;
      await item.save();
    } else {
      console.warn(`Item ${booking.itemId} not found for stock restoration`);
    }

    // Calculate refund amount (100% for pending, 80% for confirmed)
    let refundAmount = 0;
    if (booking.status === 'pending') {
      refundAmount = booking.totalPrice; // 100% refund
    } else if (booking.status === 'confirmed') {
      refundAmount = Math.round(booking.totalPrice * 0.8); // 80% refund
    }

    // Update booking status
    const cancelledBooking = await Booking.findByIdAndUpdate(
      id,
      {
        status: 'cancelled',
        refundStatus: refundAmount > 0 ? 'pending' : 'none',
        refundAmount,
        cancelledAt: new Date(),
        cancellationReason: reason || 'No reason provided'
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        booking: cancelledBooking,
        refundAmount,
        stockRestored: booking.quantity
      }
    });
  } catch (err: any) {
    console.error('Error cancelling booking:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: err.message,
    });
  }
};

export const bookingControllers = {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  cancelBooking,
};
