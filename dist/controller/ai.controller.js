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
exports.aiControllers = void 0;
const ai_service_1 = require("../utils/ai.service");
const review_model_1 = require("../models/review.model");
const item_model_1 = require("../models/item.model");
// AI Chatbot
const chat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required',
            });
        }
        const reply = yield (0, ai_service_1.chatWithAI)(message);
        res.status(200).json({
            success: true,
            message: 'AI response generated',
            data: {
                reply,
                userMessage: message
            }
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to get AI response',
            error: err.message,
        });
    }
});
// Generate description for item
const generateItemDescription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title } = req.body;
        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Title is required',
            });
        }
        const description = yield (0, ai_service_1.generateDescription)(title);
        res.status(200).json({
            success: true,
            message: 'Description generated successfully',
            data: {
                title,
                description
            }
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to generate description',
            error: err.message,
        });
    }
});
// Get AI recommendations
const getAIRecommendations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { budget, location, preferences } = req.body;
        if (!budget || !location) {
            return res.status(400).json({
                success: false,
                message: 'Budget and location are required',
            });
        }
        const recommendations = yield (0, ai_service_1.getRecommendations)(Number(budget), location, preferences || 'general travel');
        res.status(200).json({
            success: true,
            message: 'Recommendations generated successfully',
            data: {
                budget,
                location,
                preferences: preferences || 'general travel',
                recommendations
            }
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to get recommendations',
            error: err.message,
        });
    }
});
// Summarize reviews for an item
const summarizeItemReviews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { itemId } = req.body;
        if (!itemId) {
            return res.status(400).json({
                success: false,
                message: 'Item ID is required',
            });
        }
        // Check if item exists
        const item = yield item_model_1.Item.findById(itemId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found',
            });
        }
        // Get reviews from database
        const reviews = yield review_model_1.Review.find({ itemId }).select('comment rating -_id');
        if (reviews.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No reviews found for this item',
            });
        }
        // Format reviews for AI
        const reviewTexts = reviews.map(r => `Rating: ${r.rating}/5\nComment: ${r.comment}`);
        const summary = yield (0, ai_service_1.summarizeReviews)(reviewTexts);
        res.status(200).json({
            success: true,
            message: 'Reviews summarized successfully',
            data: {
                itemId,
                itemTitle: item.title,
                totalReviews: reviews.length,
                averageRating: (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1),
                summary
            }
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to summarize reviews',
            error: err.message,
        });
    }
});
exports.aiControllers = {
    chat,
    generateItemDescription,
    getAIRecommendations,
    summarizeItemReviews,
};
