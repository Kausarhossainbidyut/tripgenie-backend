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
exports.reviewControllers = void 0;
const review_model_1 = require("../models/review.model");
const item_model_1 = require("../models/item.model");
// Helper function to update item rating
const updateItemRating = (itemId) => __awaiter(void 0, void 0, void 0, function* () {
    const reviews = yield review_model_1.Review.find({ itemId });
    if (reviews.length === 0) {
        // No reviews, set rating to 0
        yield item_model_1.Item.findByIdAndUpdate(itemId, { rating: 0 });
        return 0;
    }
    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    // Update item with new rating (rounded to 1 decimal)
    yield item_model_1.Item.findByIdAndUpdate(itemId, {
        rating: Math.round(averageRating * 10) / 10
    });
    return averageRating;
});
// Create new review
const createReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { rating, comment, itemId } = req.body;
        // Get user email from token
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
        // Check if item exists
        const item = yield item_model_1.Item.findById(itemId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found',
            });
        }
        const newReview = yield review_model_1.Review.create({
            rating,
            comment,
            userId,
            itemId
        });
        // Update item rating
        const newAverageRating = yield updateItemRating(itemId);
        res.status(201).json({
            success: true,
            message: 'Review created successfully',
            data: {
                review: newReview,
                itemRating: newAverageRating
            }
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to create review',
            error: err.message,
        });
    }
});
// Get reviews by item ID
const getReviewsByItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { itemId } = req.params;
        // Check if item exists
        const item = yield item_model_1.Item.findById(itemId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found',
            });
        }
        const reviews = yield review_model_1.Review.find({ itemId }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            message: 'Reviews fetched successfully',
            data: reviews,
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews',
            error: err.message,
        });
    }
});
// Delete review
const deleteReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
        const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
        const review = yield review_model_1.Review.findById(id);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found',
            });
        }
        // Check if user owns this review or is admin
        if (userRole !== 'admin' && review.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only delete your own reviews.',
            });
        }
        // Get itemId before deleting
        const itemId = review.itemId;
        yield review_model_1.Review.findByIdAndDelete(id);
        // Update item rating after deletion
        const newAverageRating = yield updateItemRating(itemId);
        res.status(200).json({
            success: true,
            message: 'Review deleted successfully',
            data: {
                itemRating: newAverageRating
            }
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete review',
            error: err.message,
        });
    }
});
exports.reviewControllers = {
    createReview,
    getReviewsByItem,
    deleteReview,
};
