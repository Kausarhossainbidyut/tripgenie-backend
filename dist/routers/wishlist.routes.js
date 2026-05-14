"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistRoutes = void 0;
const express_1 = require("express");
const wishlist_controller_1 = require("../controller/wishlist.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Add to wishlist (protected)
router.post('/', auth_1.verifyToken, wishlist_controller_1.wishlistControllers.addToWishlist);
// Get user's wishlist (protected)
router.get('/', auth_1.verifyToken, wishlist_controller_1.wishlistControllers.getWishlist);
// Check if item is in wishlist (protected)
router.get('/check/:itemId', auth_1.verifyToken, wishlist_controller_1.wishlistControllers.checkWishlist);
// Remove from wishlist (protected)
router.delete('/:id', auth_1.verifyToken, wishlist_controller_1.wishlistControllers.removeFromWishlist);
exports.WishlistRoutes = router;
