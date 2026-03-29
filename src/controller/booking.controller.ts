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

// Get all bookings (Admin - all, User - own bookings) with filters
const getBookings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.email;
    const userRole = req.user?.role;
    const { status } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Build filter
    const filter: any = {};
    
    // Filter by user (unless admin)
    if (userRole !== 'admin') {
      filter.userId = userId;
    }
    
    // Filter by status if provided
    if (status && ['pending', 'confirmed', 'cancelled'].includes(status as string)) {
      filter.status = status as string;
    }

    let bookings;
    if (userRole === 'admin') {
      // Admin sees all bookings (with optional status filter) with populated user and item details
      bookings = await Booking.find(filter)
        .sort({ createdAt: -1 });
      
      // Manual population for userId (since it's stored as email string, not ObjectId)
      const enrichedBookings = await Promise.all(bookings.map(async (booking) => {
        const user = await User.findOne({ email: booking.userId }).select('name email phone avatar');
        const item = await Item.findById(booking.itemId).select('title location image price');
        return {
          ...booking.toObject(),
          userId: user || { name: 'Unknown User', email: booking.userId },
          itemId: item || { title: 'Unknown Destination', location: 'N/A' }
        };
      }));
      bookings = enrichedBookings;
    } else {
      // User sees only their bookings (with optional status filter) with populated details
      bookings = await Booking.find(filter)
        .sort({ createdAt: -1 });
      
      // Manual population for userId and itemId
      const enrichedBookings = await Promise.all(bookings.map(async (booking) => {
        const user = await User.findOne({ email: booking.userId }).select('name email phone avatar');
        const item = await Item.findById(booking.itemId).select('title location image price');
        return {
          ...booking.toObject(),
          userId: user || { name: 'Unknown User', email: booking.userId },
          itemId: item || { title: 'Unknown Destination', location: 'N/A' }
        };
      }));
      bookings = enrichedBookings;
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

    // Manual population for userId (since it's stored as email string, not ObjectId)
    const user = await User.findOne({ email: booking.userId }).select('name email phone avatar');
    const item = await Item.findById(booking.itemId).select('title location image price');
    
    const enrichedBooking = {
      ...booking.toObject(),
      userId: user || { name: 'Unknown User', email: booking.userId },
      itemId: item || { title: 'Unknown Destination', location: 'N/A' }
    };

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
      data: enrichedBooking,
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

// Get booking analytics (Admin only)
const getAnalytics = async (req: Request, res: Response) => {
  try {
    // Total revenue
    const totalRevenueResult = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    // Total bookings
    const totalBookings = await Booking.countDocuments();

    // Average booking value
    const avgBookingResult = await Booking.aggregate([
      { $group: { _id: null, avg: { $avg: '$totalPrice' } } }
    ]);
    const averageBookingValue = avgBookingResult[0]?.avg || 0;

    // Bookings by status
    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Bookings by payment status
    const bookingsByPaymentStatus = await Booking.aggregate([
      { $group: { _id: '$paymentStatus', count: { $sum: 1 } } }
    ]);

    console.log('=== GET ANALYTICS CALLED ===');
    
    // Recent bookings - Manual enrichment instead of populate
    const recentBookingsRaw = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(10);
    
    const recentBookings = await Promise.all(recentBookingsRaw.map(async (booking) => {
      const user = await User.findOne({ email: booking.userId }).select('name email');
      const item = await Item.findById(booking.itemId).select('title image');
      return {
        ...booking.toObject(),
        userId: user || { name: 'Unknown', email: booking.userId },
        itemId: item || { title: 'Unknown', image: '' }
      };
    }));

    // Top destinations
    const topDestinations = await Booking.aggregate([
      { $group: { _id: '$itemId', count: { $sum: 1 }, totalRevenue: { $sum: '$totalPrice' } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Enrich top destinations with item details
    const enrichedTopDestinations = await Promise.all(
      topDestinations.map(async (dest) => {
        const item = await Item.findById(dest._id);
        return {
          itemId: dest._id,
          title: item?.title || 'Unknown',
          count: dest.count,
          totalRevenue: dest.totalRevenue
        };
      })
    );

    // Monthly trend (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyTrend = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalPrice' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format monthly trend
    const formattedMonthlyTrend = monthlyTrend.map((item) => ({
      month: `${item._id.month}/${item._id.year}`,
      revenue: item.revenue,
      bookings: item.bookings
    }));

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalBookings,
        averageBookingValue: Math.round(averageBookingValue),
        bookingsByStatus,
        bookingsByPaymentStatus,
        recentBookings,
        topDestinations: enrichedTopDestinations,
        monthlyTrend: formattedMonthlyTrend
      }
    });
  } catch (err: any) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: err.message,
    });
  }
};

// Export to CSV (Admin only)
const exportToCSV = async (req: Request, res: Response) => {
  try {
    const { status, paymentStatus, dateFrom, dateTo } = req.query;
    
    const filter: any = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom as string);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo as string);
    }

    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 });

    // Manual population for CSV export
    const enrichedBookings = await Promise.all(bookings.map(async (booking) => {
      const user = await User.findOne({ email: booking.userId }).select('name email phone');
      const item = await Item.findById(booking.itemId).select('title location price');
      return {
        ...booking.toObject(),
        userId: user || { name: 'N/A', email: booking.userId },
        itemId: item || { title: 'N/A', location: 'N/A' }
      };
    }));

    // Create CSV content
    const csvRows = [];
    
    // Header
    csvRows.push('Booking ID,Customer Name,Customer Email,Destination,Location,Price,Status,Payment Status,Booking Date');

    // Data rows
    enrichedBookings.forEach(booking => {
      const row = [
        booking._id,
        (booking.userId as any)?.name || 'N/A',
        (booking.userId as any)?.email || 'N/A',
        (booking.itemId as any)?.title || 'N/A',
        (booking.itemId as any)?.location || 'N/A',
        booking.totalPrice,
        booking.status,
        booking.paymentStatus,
        booking.createdAt!.toISOString()
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=bookings.csv');
    
    res.send(csvContent);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to export CSV',
      error: err.message,
    });
  }
};

// Bulk update status (Admin only)
const bulkUpdateStatus = async (req: Request, res: Response) => {
  try {
    const { bookingIds, status } = req.body;

    if (!Array.isArray(bookingIds) || bookingIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide booking IDs',
      });
    }

    if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const result = await Booking.updateMany(
      { _id: { $in: bookingIds } },
      { status }
    );

    res.status(200).json({
      success: true,
      message: `Successfully updated ${result.modifiedCount} bookings`,
      data: { count: result.modifiedCount }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update',
      error: err.message,
    });
  }
};

// Bulk delete bookings (Admin only)
const bulkDeleteBookings = async (req: Request, res: Response) => {
  try {
    const { bookingIds } = req.body;

    if (!Array.isArray(bookingIds) || bookingIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide booking IDs',
      });
    }

    const result = await Booking.deleteMany({
      _id: { $in: bookingIds }
    });

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} bookings`,
      data: { count: result.deletedCount }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to bulk delete',
      error: err.message,
    });
  }
};

// Update payment status (Admin only)
const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    if (!paymentStatus || !['pending', 'paid', 'failed', 'refunded'].includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status',
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { paymentStatus },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Manual population for userId and itemId
    const user = await User.findOne({ email: booking.userId }).select('name email');
    const item = await Item.findById(booking.itemId).select('title');
    
    const enrichedBooking = {
      ...booking.toObject(),
      userId: user || { name: 'Unknown User', email: booking.userId },
      itemId: item || { title: 'Unknown Destination' }
    };

    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      data: enrichedBooking,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
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
  getAnalytics,
  exportToCSV,
  bulkUpdateStatus,
  bulkDeleteBookings,
  updatePaymentStatus,
};
