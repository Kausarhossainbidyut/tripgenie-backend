"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRoutes = void 0;
const express_1 = require("express");
const review_controller_1 = require("../controller/review.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Create review (protected)
router.post('/', auth_1.verifyToken, review_controller_1.reviewControllers.createReview);
// Get reviews by item ID (public)
router.get('/item/:itemId', review_controller_1.reviewControllers.getReviewsByItem);
// Delete review (protected - owner or admin)
router.delete('/:id', auth_1.verifyToken, review_controller_1.reviewControllers.deleteReview);
exports.ReviewRoutes = router;
