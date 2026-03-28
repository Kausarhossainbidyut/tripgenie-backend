// Enhanced Booking Controller - All New Features
import { Request, Response } from 'express';
import { Booking } from '../models/booking.model';
import { Item } from '../models/item.model';
import { User } from '../models/user.model';
import { sendBookingConfirmationEmail, sendBookingStatusEmail } from '../utils/email.service';

// ... existing createBooking function ...

// Enhanced getBookings with filters and pagination
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

    // Extract query parameters
    const {
      status,
      paymentStatus,
      searchQuery,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20
    } = req.query;

    // Build filter object
    const filter: any = {};
    
    // Filter by user role
    if (userRole !== 'admin') {
      filter.userId = userId;
    }

    // Status filter
    if (status) {
      filter.status = status;
    }

    // Payment status filter
    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom as string);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo as string);
    }

    // Search filter
    if (searchQuery) {
      const searchRegex = new RegExp(searchQuery as string, 'i');
      
      // Get all users matching search
      const users = await User.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex }
        ]
      }).select('_id');
      
      const userIds = users.map(u => u._id.toString());
      
      // Get all items matching search
      const items = await Item.find({
        $or: [
          { title: searchRegex },
          { location: searchRegex }
        ]
      }).select('_id');
      
      const itemIds = items.map(i => i._id.toString());
      
      // Search in bookings
      filter.$or = [
        { userId: { $in: userIds } },
        { itemId: { $in: itemIds } }
      ];
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Fetch bookings with pagination and populate with FULL user and item data
    const bookings = await Booking.find(filter)
      .populate('userId', 'name email phone avatar role address createdAt')
      .populate('itemId', 'title description location price quantity category image gallery rating reviews amenities features cancellationPolicy checkInTime checkOutTime facilities rules host contact createdAt updatedAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Verify and enrich data for each booking
    const enrichedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const bookingObj = booking.toObject();
        
        // Verify user data exists
        if (!bookingObj.userId) {
          console.warn(`Booking ${bookingObj._id} has no user data`);
          bookingObj.userId = {
            _id: null,
            name: 'Unknown User',
            email: 'N/A',
            phone: 'N/A',
            avatar: null
          };
        }

        // Verify item data exists
        if (!bookingObj.itemId) {
          console.warn(`Booking ${bookingObj._id} has no item data`);
          bookingObj.itemId = {
            _id: null,
            title: 'Unknown Destination',
            location: 'N/A',
            image: null,
            price: 0
          };
        }

        // Calculate additional booking info
        bookingObj.bookingDetails = {
          nights: bookingObj.quantity || 1,
          perNightPrice: bookingObj.totalPrice / (bookingObj.quantity || 1),
          guestCount: 1, // Can be extended later
          isRefundable: bookingObj.refundAmount > 0,
          daysSinceBooking: bookingObj.createdAt ? Math.ceil((Date.now() - new Date(bookingObj.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : null
        };

        return bookingObj;
      })
    );

    // Get total count
    const total = await Booking.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'Bookings fetched successfully with complete user and item data',
      data: {
        bookings: enrichedBookings,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        limit: limitNum
      },
    });
  } catch (err: any) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Get booking analytics
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

    // Recent bookings
    const recentBookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('itemId', 'title image')
      .sort({ createdAt: -1 })
      .limit(10);

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

// Update payment status
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
    ).populate('userId', 'name email').populate('itemId', 'title');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Send email notification
    try {
      await sendBookingStatusEmail(booking, `Payment status updated to ${paymentStatus}`);
    } catch (emailErr) {
      console.error('Email notification failed:', emailErr);
    }

    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      data: booking,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: err.message,
    });
  }
};

// Bulk update status
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

// Bulk delete bookings
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

// Export to CSV
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
      .populate('userId', 'name email phone')
      .populate('itemId', 'title location price')
      .sort({ createdAt: -1 });

    // Create CSV content
    const csvRows = [];
    
    // Header
    csvRows.push('Booking ID,Customer Name,Customer Email,Destination,Location,Price,Status,Payment Status,Booking Date');

    // Data rows
    bookings.forEach(booking => {
      const row = [
        booking._id,
        (booking.userId as any)?.name || 'N/A',
        (booking.userId as any)?.email || 'N/A',
        (booking.itemId as any)?.title || 'N/A',
        (booking.itemId as any)?.location || 'N/A',
        booking.totalPrice,
        booking.status,
        booking.paymentStatus,
        new Date(booking.createdAt).toISOString()
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

// Get activity timeline
const getActivityTimeline = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findById(id)
      .populate('userId', 'name email')
      .populate('itemId', 'title');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Create activity timeline from booking history
    const activities = [
      {
        action: 'Booking Created',
        timestamp: booking.createdAt,
        user: (booking.userId as any)?.name || 'System',
        details: {
          status: booking.status,
          totalPrice: booking.totalPrice
        }
      }
    ];

    // If booking was updated, add update events
    if (booking.updatedAt && booking.updatedAt.getTime() !== booking.createdAt.getTime()) {
      activities.push({
        action: 'Booking Updated',
        timestamp: booking.updatedAt,
        user: 'Admin',
        details: {
          status: booking.status,
          paymentStatus: booking.paymentStatus
        }
      });
    }

    // If cancelled, add cancellation event
    if (booking.cancelledAt) {
      activities.push({
        action: 'Booking Cancelled',
        timestamp: booking.cancelledAt,
        user: (booking.userId as any)?.name || 'User',
        details: {
          reason: booking.cancellationReason,
          refundAmount: booking.refundAmount
        }
      });
    }

    // Sort by timestamp descending
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.status(200).json({
      success: true,
      data: activities
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity timeline',
      error: err.message,
    });
  }
};

// Send confirmation email
const sendConfirmationEmail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findById(id)
      .populate('userId', 'name email')
      .populate('itemId', 'title location');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    await sendBookingConfirmationEmail(booking);

    res.status(200).json({
      success: true,
      message: 'Confirmation email sent successfully'
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: err.message,
    });
  }
};

export const enhancedBookingControllers = {
  getBookings,
  getAnalytics,
  updatePaymentStatus,
  bulkUpdateStatus,
  bulkDeleteBookings,
  exportToCSV,
  getActivityTimeline,
  sendConfirmationEmail
};
