import { Request, Response } from 'express';
import { Booking } from '../models/booking.model';
import { Item } from '../models/item.model';

// Create new booking
const createBooking = async (req: Request, res: Response) => {
  try {
    const { itemId, quantity } = req.body;
    
    // Get user email from token
    const userId = req.user?.email;

    // Get item details to calculate total price
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    const totalPrice = item.price * quantity;

    const newBooking = await Booking.create({
      userId,
      itemId,
      quantity,
      totalPrice,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: newBooking,
    });
  } catch (err: any) {
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

export const bookingControllers = {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
};
