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
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardControllers = void 0;
const user_model_1 = require("../models/user.model");
const item_model_1 = require("../models/item.model");
const booking_model_1 = require("../models/booking.model");
const review_model_1 = require("../models/review.model");
// Get dashboard stats
const getStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalUsers = yield user_model_1.User.countDocuments();
        const totalItems = yield item_model_1.Item.countDocuments();
        const totalBookings = yield booking_model_1.Booking.countDocuments();
        const totalReviews = yield review_model_1.Review.countDocuments();
        // Calculate total revenue
        const bookings = yield booking_model_1.Booking.find({ status: { $ne: 'cancelled' } });
        const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
        // Get pending bookings count
        const pendingBookings = yield booking_model_1.Booking.countDocuments({ status: 'pending' });
        // Get confirmed bookings count
        const confirmedBookings = yield booking_model_1.Booking.countDocuments({ status: 'confirmed' });
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
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to get dashboard stats',
            error: err.message,
        });
    }
});
// Get chart data
const getChartData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Bookings by month (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const bookingsByMonth = yield booking_model_1.Booking.aggregate([
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
        const bookingsByStatus = yield booking_model_1.Booking.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);
        // Users by role
        const usersByRole = yield user_model_1.User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 },
                },
            },
        ]);
        // Items by category
        const itemsByCategory = yield item_model_1.Item.aggregate([
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
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to get chart data',
            error: err.message,
        });
    }
});
exports.dashboardControllers = {
    getStats,
    getChartData,
};
