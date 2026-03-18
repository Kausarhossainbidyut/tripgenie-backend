import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { Item } from '../models/item.model';
import { Booking } from '../models/booking.model';
import { Review } from '../models/review.model';

// Get dashboard stats
const getStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalItems = await Item.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalReviews = await Review.countDocuments();

    // Calculate total revenue
    const bookings = await Booking.find({ status: { $ne: 'cancelled' } });
    const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

    // Get pending bookings count
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });

    // Get confirmed bookings count
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });

    res.status(200).json({
      success: true,
      message: 'Dashboard stats retrieved successfully',
      data: {
        totalUsers,
        totalItems,
        totalBookings,
        totalReviews,
        totalRevenue,
        pendingBookings,
        confirmedBookings,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard stats',
      error: err.message,
    });
  }
};

// Get chart data
const getChartData = async (req: Request, res: Response) => {
  try {
    // Bookings by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const bookingsByMonth = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    // Bookings by status
    const bookingsByStatus = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Users by role
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);

    // Items by category
    const itemsByCategory = await Item.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: 'Chart data retrieved successfully',
      data: {
        bookingsByMonth,
        bookingsByStatus,
        usersByRole,
        itemsByCategory,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to get chart data',
      error: err.message,
    });
  }
};

export const dashboardControllers = {
  getStats,
  getChartData,
};
