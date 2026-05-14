"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const ai_controller_1 = require("../controller/ai.controller");
const router = (0, express_1.Router)();
// AI Chatbot - Public
router.post('/chat', ai_controller_1.aiControllers.chat);
// Generate description - Protected
router.post('/generate-description', auth_1.verifyToken, ai_controller_1.aiControllers.generateItemDescription);
// Get recommendations - Public
router.post('/recommendations', ai_controller_1.aiControllers.getAIRecommendations);
// Summarize reviews - Public
router.post('/review-summary', ai_controller_1.aiControllers.summarizeItemReviews);
exports.AIRoutes = router;
