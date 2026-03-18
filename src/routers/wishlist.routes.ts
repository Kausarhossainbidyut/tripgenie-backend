import { Router } from 'express';
import { wishlistControllers } from '../controller/wishlist.controller';
import { verifyToken } from '../middlewares/auth';

const router = Router();

// Add to wishlist (protected)
router.post('/', verifyToken, wishlistControllers.addToWishlist);

// Get user's wishlist (protected)
router.get('/', verifyToken, wishlistControllers.getWishlist);

// Check if item is in wishlist (protected)
router.get('/check/:itemId', verifyToken, wishlistControllers.checkWishlist);

// Remove from wishlist (protected)
router.delete('/:id', verifyToken, wishlistControllers.removeFromWishlist);

export const WishlistRoutes = router;
