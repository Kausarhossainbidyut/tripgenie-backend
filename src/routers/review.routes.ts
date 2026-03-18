import { Router } from 'express';
import { reviewControllers } from '../controller/review.controller';
import { verifyToken } from '../middlewares/auth';

const router = Router();

// Create review (protected)
router.post('/', verifyToken, reviewControllers.createReview);

// Get reviews by item ID (public)
router.get('/item/:itemId', reviewControllers.getReviewsByItem);

// Delete review (protected - owner or admin)
router.delete('/:id', verifyToken, reviewControllers.deleteReview);

export const ReviewRoutes = router;
