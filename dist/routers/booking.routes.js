"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingRoutes = void 0;
const express_1 = require("express");
const booking_controller_1 = require("../controller/booking.controller");
const booking_enhanced_controller_1 = require("../controller/booking.enhanced.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Create booking (protected)
router.post('/', auth_1.verifyToken, booking_controller_1.bookingControllers.createBooking);
// Get all bookings with filters (protected - admin sees all, user sees own)
router.get('/', auth_1.verifyToken, booking_controller_1.bookingControllers.getBookings);
// Get booking analytics (protected - admin only)
router.get('/analytics', auth_1.verifyToken, auth_1.isAdmin, booking_controller_1.bookingControllers.getAnalytics);
// Export bookings to CSV (protected - admin only)
router.get('/export/csv', auth_1.verifyToken, auth_1.isAdmin, booking_controller_1.bookingControllers.exportToCSV);
// Bulk update status (protected - admin only)
router.post('/bulk/status', auth_1.verifyToken, auth_1.isAdmin, booking_controller_1.bookingControllers.bulkUpdateStatus);
// Bulk delete bookings (protected - admin only)
router.post('/bulk/delete', auth_1.verifyToken, auth_1.isAdmin, booking_controller_1.bookingControllers.bulkDeleteBookings);
// Get booking by ID (protected)
router.get('/:id', auth_1.verifyToken, booking_controller_1.bookingControllers.getBookingById);
// Update booking status (protected - admin only)
router.patch('/:id', auth_1.verifyToken, auth_1.isAdmin, booking_controller_1.bookingControllers.updateBooking);
// Update payment status (protected - admin only)
router.patch('/:id/payment', auth_1.verifyToken, auth_1.isAdmin, booking_controller_1.bookingControllers.updatePaymentStatus);
// Cancel booking (protected - user can cancel own, admin can cancel any)
router.patch('/:id/cancel', auth_1.verifyToken, booking_controller_1.bookingControllers.cancelBooking);
// Delete booking (protected - admin only)
router.delete('/:id', auth_1.verifyToken, auth_1.isAdmin, booking_controller_1.bookingControllers.deleteBooking);
// Enhanced booking endpoints
router.get('/:id/activity', auth_1.verifyToken, booking_enhanced_controller_1.enhancedBookingControllers.getActivityTimeline);
router.post('/:id/email/confirmation', auth_1.verifyToken, booking_enhanced_controller_1.enhancedBookingControllers.sendConfirmationEmail);
exports.BookingRoutes = router;
