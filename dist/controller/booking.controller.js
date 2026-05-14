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
exports.bookingControllers = void 0;
const booking_model_1 = require("../models/booking.model");
const item_model_1 = require("../models/item.model");
const user_model_1 = require("../models/user.model");
const email_service_1 = require("../utils/email.service");
// Create new booking
const createBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
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
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
        }
        // Get item details to calculate total price
        const item = yield item_model_1.Item.findById(itemId);
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
        const newBooking = yield booking_model_1.Booking.create({
            userId,
            itemId,
            quantity,
            totalPrice,
            status: 'pending'
        });
        // Decrease item quantity
        item.quantity -= quantity;
        yield item.save();
        // Send booking confirmation email
        try {
            const user = yield user_model_1.User.findOne({ email: userId });
            if (user) {
                yield (0, email_service_1.sendBookingConfirmationEmail)(user.email, user.name, {
                    itemTitle: item.title,
                    quantity,
                    totalPrice,
                    status: 'pending'
                });
            }
        }
        catch (emailErr) {
            // Don't fail booking if email fails
        }
        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: newBooking,
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to create booking',
            error: err.message,
        });
    }
});
// Get all bookings (Admin - all, User - own bookings) with filters
const getBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
        const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
        const { status } = req.query;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
        }
        // Build filter
        const filter = {};
        // Filter by user (unless admin)
        if (userRole !== 'admin') {
            filter.userId = userId;
        }
        // Filter by status if provided
        if (status && ['pending', 'confirmed', 'cancelled'].includes(status)) {
            filter.status = status;
        }
        let bookings;
        if (userRole === 'admin') {
            // Admin sees all bookings (with optional status filter) with populated user and item details
            bookings = yield booking_model_1.Booking.find(filter)
                .sort({ createdAt: -1 });
            // Manual population for userId (since it's stored as email string, not ObjectId)
            const enrichedBookings = yield Promise.all(bookings.map((booking) => __awaiter(void 0, void 0, void 0, function* () {
                const user = yield user_model_1.User.findOne({ email: booking.userId }).select('name email phone avatar');
                const item = yield item_model_1.Item.findById(booking.itemId).select('title location image price');
                return Object.assign(Object.assign({}, booking.toObject()), { userId: user || { name: 'Unknown User', email: booking.userId }, itemId: item || { title: 'Unknown Destination', location: 'N/A' } });
            })));
            bookings = enrichedBookings;
        }
        else {
            // User sees only their bookings (with optional status filter) with populated details
            bookings = yield booking_model_1.Booking.find(filter)
                .sort({ createdAt: -1 });
            // Manual population for userId and itemId
            const enrichedBookings = yield Promise.all(bookings.map((booking) => __awaiter(void 0, void 0, void 0, function* () {
                const user = yield user_model_1.User.findOne({ email: booking.userId }).select('name email phone avatar');
                const item = yield item_model_1.Item.findById(booking.itemId).select('title location image price');
                return Object.assign(Object.assign({}, booking.toObject()), { userId: user || { name: 'Unknown User', email: booking.userId }, itemId: item || { title: 'Unknown Destination', location: 'N/A' } });
            })));
            bookings = enrichedBookings;
        }
        res.status(200).json({
            success: true,
            message: 'Bookings fetched successfully',
            data: bookings,
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings',
            error: err.message,
        });
    }
});
// Get booking by ID
const getBookingById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
        const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
        const booking = yield booking_model_1.Booking.findById(id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }
        // Manual population for userId (since it's stored as email string, not ObjectId)
        const user = yield user_model_1.User.findOne({ email: booking.userId }).select('name email phone avatar');
        const item = yield item_model_1.Item.findById(booking.itemId).select('title location image price');
        const enrichedBooking = Object.assign(Object.assign({}, booking.toObject()), { userId: user || { name: 'Unknown User', email: booking.userId }, itemId: item || { title: 'Unknown Destination', location: 'N/A' } });
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
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch booking',
            error: err.message,
        });
    }
});
// Update booking status
const updateBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updatedBooking = yield booking_model_1.Booking.findByIdAndUpdate(id, { status }, { new: true });
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
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to update booking',
            error: err.message,
        });
    }
});
// Delete booking
const deleteBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deletedBooking = yield booking_model_1.Booking.findByIdAndDelete(id);
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
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete booking',
            error: err.message,
        });
    }
});
// Cancel booking
const cancelBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
        const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
        }
        const booking = yield booking_model_1.Booking.findById(id);
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
        const item = yield item_model_1.Item.findById(booking.itemId);
        if (item) {
            // Restore item quantity
            item.quantity += booking.quantity;
            yield item.save();
        }
        else {
            // Item not found for stock restoration is expected
        }
        // Calculate refund amount (100% for pending, 80% for confirmed)
        let refundAmount = 0;
        if (booking.status === 'pending') {
            refundAmount = booking.totalPrice; // 100% refund
        }
        else if (booking.status === 'confirmed') {
            refundAmount = Math.round(booking.totalPrice * 0.8); // 80% refund
        }
        // Update booking status
        const cancelledBooking = yield booking_model_1.Booking.findByIdAndUpdate(id, {
            status: 'cancelled',
            refundStatus: refundAmount > 0 ? 'pending' : 'none',
            refundAmount,
            cancelledAt: new Date(),
            cancellationReason: reason || 'No reason provided'
        }, { new: true });
        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully',
            data: {
                booking: cancelledBooking,
                refundAmount,
                stockRestored: booking.quantity
            }
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to cancel booking',
            error: err.message,
        });
    }
});
// Get booking analytics (Admin only)
const getAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // Total revenue
        const totalRevenueResult = yield booking_model_1.Booking.aggregate([
            { $match: { status: 'confirmed' } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);
        const totalRevenue = ((_a = totalRevenueResult[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
        // Total bookings
        const totalBookings = yield booking_model_1.Booking.countDocuments();
        // Average booking value
        const avgBookingResult = yield booking_model_1.Booking.aggregate([
            { $group: { _id: null, avg: { $avg: '$totalPrice' } } }
        ]);
        const averageBookingValue = ((_b = avgBookingResult[0]) === null || _b === void 0 ? void 0 : _b.avg) || 0;
        // Bookings by status
        const bookingsByStatus = yield booking_model_1.Booking.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        // Bookings by payment status
        const bookingsByPaymentStatus = yield booking_model_1.Booking.aggregate([
            { $group: { _id: '$paymentStatus', count: { $sum: 1 } } }
        ]);
        // Recent bookings - Manual enrichment instead of populate
        const recentBookingsRaw = yield booking_model_1.Booking.find()
            .sort({ createdAt: -1 })
            .limit(10);
        const recentBookings = yield Promise.all(recentBookingsRaw.map((booking) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield user_model_1.User.findOne({ email: booking.userId }).select('name email');
            const item = yield item_model_1.Item.findById(booking.itemId).select('title image');
            return Object.assign(Object.assign({}, booking.toObject()), { userId: user || { name: 'Unknown', email: booking.userId }, itemId: item || { title: 'Unknown', image: '' } });
        })));
        // Top destinations
        const topDestinations = yield booking_model_1.Booking.aggregate([
            { $group: { _id: '$itemId', count: { $sum: 1 }, totalRevenue: { $sum: '$totalPrice' } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);
        // Enrich top destinations with item details
        const enrichedTopDestinations = yield Promise.all(topDestinations.map((dest) => __awaiter(void 0, void 0, void 0, function* () {
            const item = yield item_model_1.Item.findById(dest._id);
            return {
                itemId: dest._id,
                title: (item === null || item === void 0 ? void 0 : item.title) || 'Unknown',
                count: dest.count,
                totalRevenue: dest.totalRevenue
            };
        })));
        // Monthly trend (last 12 months)
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
        const monthlyTrend = yield booking_model_1.Booking.aggregate([
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
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch analytics',
            error: err.message,
        });
    }
});
// Export to CSV (Admin only)
const exportToCSV = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, paymentStatus, dateFrom, dateTo } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        if (paymentStatus)
            filter.paymentStatus = paymentStatus;
        if (dateFrom || dateTo) {
            filter.createdAt = {};
            if (dateFrom)
                filter.createdAt.$gte = new Date(dateFrom);
            if (dateTo)
                filter.createdAt.$lte = new Date(dateTo);
        }
        const bookings = yield booking_model_1.Booking.find(filter)
            .sort({ createdAt: -1 });
        // Manual population for CSV export
        const enrichedBookings = yield Promise.all(bookings.map((booking) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield user_model_1.User.findOne({ email: booking.userId }).select('name email phone');
            const item = yield item_model_1.Item.findById(booking.itemId).select('title location price');
            return Object.assign(Object.assign({}, booking.toObject()), { userId: user || { name: 'N/A', email: booking.userId }, itemId: item || { title: 'N/A', location: 'N/A' } });
        })));
        // Create CSV content
        const csvRows = [];
        // Header
        csvRows.push('Booking ID,Customer Name,Customer Email,Destination,Location,Price,Status,Payment Status,Booking Date');
        // Data rows
        enrichedBookings.forEach(booking => {
            var _a, _b, _c, _d;
            const row = [
                booking._id,
                ((_a = booking.userId) === null || _a === void 0 ? void 0 : _a.name) || 'N/A',
                ((_b = booking.userId) === null || _b === void 0 ? void 0 : _b.email) || 'N/A',
                ((_c = booking.itemId) === null || _c === void 0 ? void 0 : _c.title) || 'N/A',
                ((_d = booking.itemId) === null || _d === void 0 ? void 0 : _d.location) || 'N/A',
                booking.totalPrice,
                booking.status,
                booking.paymentStatus,
                booking.createdAt.toISOString()
            ];
            csvRows.push(row.join(','));
        });
        const csvContent = csvRows.join('\n');
        // Set headers for file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=bookings.csv');
        res.send(csvContent);
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to export CSV',
            error: err.message,
        });
    }
});
// Bulk update status (Admin only)
const bulkUpdateStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const result = yield booking_model_1.Booking.updateMany({ _id: { $in: bookingIds } }, { status });
        res.status(200).json({
            success: true,
            message: `Successfully updated ${result.modifiedCount} bookings`,
            data: { count: result.modifiedCount }
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to bulk update',
            error: err.message,
        });
    }
});
// Bulk delete bookings (Admin only)
const bulkDeleteBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookingIds } = req.body;
        if (!Array.isArray(bookingIds) || bookingIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide booking IDs',
            });
        }
        const result = yield booking_model_1.Booking.deleteMany({
            _id: { $in: bookingIds }
        });
        res.status(200).json({
            success: true,
            message: `Successfully deleted ${result.deletedCount} bookings`,
            data: { count: result.deletedCount }
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to bulk delete',
            error: err.message,
        });
    }
});
// Update payment status (Admin only)
const updatePaymentStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { paymentStatus } = req.body;
        if (!paymentStatus || !['pending', 'paid', 'failed', 'refunded'].includes(paymentStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment status',
            });
        }
        const booking = yield booking_model_1.Booking.findByIdAndUpdate(id, { paymentStatus }, { new: true, runValidators: true });
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }
        // Manual population for userId and itemId
        const user = yield user_model_1.User.findOne({ email: booking.userId }).select('name email');
        const item = yield item_model_1.Item.findById(booking.itemId).select('title');
        const enrichedBooking = Object.assign(Object.assign({}, booking.toObject()), { userId: user || { name: 'Unknown User', email: booking.userId }, itemId: item || { title: 'Unknown Destination' } });
        res.status(200).json({
            success: true,
            message: 'Payment status updated successfully',
            data: enrichedBooking,
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to update payment status',
            error: err.message,
        });
    }
});
exports.bookingControllers = {
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
