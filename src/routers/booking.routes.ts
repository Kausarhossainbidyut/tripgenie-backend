import { Router } from 'express';
import { bookingControllers } from '../controller/booking.controller';
import { verifyToken, isAdmin } from '../middlewares/auth';

const router = Router();

// Create booking (protected)
router.post('/', verifyToken, bookingControllers.createBooking);

// Get all bookings (protected - admin sees all, user sees own)
router.get('/', verifyToken, bookingControllers.getBookings);

// Get booking by ID (protected)
router.get('/:id', verifyToken, bookingControllers.getBookingById);

// Update booking status (protected - admin only)
router.patch('/:id', verifyToken, isAdmin, bookingControllers.updateBooking);

// Delete booking (protected - admin only)
router.delete('/:id', verifyToken, isAdmin, bookingControllers.deleteBooking);

// Cancel booking (protected - user can cancel own, admin can cancel any)
router.patch('/:id/cancel', verifyToken, bookingControllers.cancelBooking);

export const BookingRoutes = router;
