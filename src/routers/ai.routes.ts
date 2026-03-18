import { Router } from 'express';
import { verifyToken } from '../middlewares/auth';
import { aiControllers } from '../controller/ai.controller';

const router = Router();

// AI Chatbot - Public
router.post('/chat', aiControllers.chat);

// Generate description - Protected
router.post('/generate-description', verifyToken, aiControllers.generateItemDescription);

// Get recommendations - Public
router.post('/recommendations', aiControllers.getAIRecommendations);

// Summarize reviews - Public
router.post('/review-summary', aiControllers.summarizeItemReviews);

export const AIRoutes = router;
