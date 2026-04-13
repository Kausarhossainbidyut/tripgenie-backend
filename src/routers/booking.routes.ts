import { Router } from 'express';
import { bookingControllers } from '../controller/booking.controller';
import { enhancedBookingControllers } from '../controller/booking.enhanced.controller';
import { verifyToken, isAdmin } from '../middlewares/auth';

const router = Router();

// Create booking (protected)
router.post('/', verifyToken, bookingControllers.createBooking);

// Get all bookings with filters (protected - admin sees all, user sees own)
router.get('/', verifyToken, bookingControllers.getBookings);

// Get booking analytics (protected - admin only)
router.get('/analytics', verifyToken, isAdmin, bookingControllers.getAnalytics);

// Export bookings to CSV (protected - admin only)
router.get('/export/csv', verifyToken, isAdmin, bookingControllers.exportToCSV);

// Bulk update status (protected - admin only)
router.post('/bulk/status', verifyToken, isAdmin, bookingControllers.bulkUpdateStatus);

// Bulk delete bookings (protected - admin only)
router.post('/bulk/delete', verifyToken, isAdmin, bookingControllers.bulkDeleteBookings);

// Get booking by ID (protected)
router.get('/:id', verifyToken, bookingControllers.getBookingById);

// Update booking status (protected - admin only)
router.patch('/:id', verifyToken, isAdmin, bookingControllers.updateBooking);

// Update payment status (protected - admin only)
router.patch('/:id/payment', verifyToken, isAdmin, bookingControllers.updatePaymentStatus);

// Cancel booking (protected - user can cancel own, admin can cancel any)
router.patch('/:id/cancel', verifyToken, bookingControllers.cancelBooking);

// Delete booking (protected - admin only)
router.delete('/:id', verifyToken, isAdmin, bookingControllers.deleteBooking);

// Enhanced booking endpoints
router.get('/:id/activity', verifyToken, enhancedBookingControllers.getActivityTimeline);
router.post('/:id/email/confirmation', verifyToken, enhancedBookingControllers.sendConfirmationEmail);

export const BookingRoutes = router;
