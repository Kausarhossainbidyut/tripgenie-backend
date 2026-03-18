import { Request, Response } from 'express';
import { 
  chatWithAI, 
  generateDescription, 
  getRecommendations, 
  summarizeReviews 
} from '../utils/ai.service';
import { Review } from '../models/review.model';
import { Item } from '../models/item.model';

// AI Chatbot
const chat = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    const reply = await chatWithAI(message);

    res.status(200).json({
      success: true,
      message: 'AI response generated',
      data: {
        reply,
        userMessage: message
      }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to get AI response',
      error: err.message,
    });
  }
};

// Generate description for item
const generateItemDescription = async (req: Request, res: Response) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required',
      });
    }

    const description = await generateDescription(title);

    res.status(200).json({
      success: true,
      message: 'Description generated successfully',
      data: {
        title,
        description
      }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate description',
      error: err.message,
    });
  }
};

// Get AI recommendations
const getAIRecommendations = async (req: Request, res: Response) => {
  try {
    const { budget, location, preferences } = req.body;

    if (!budget || !location) {
      return res.status(400).json({
        success: false,
        message: 'Budget and location are required',
      });
    }

    const recommendations = await getRecommendations(
      Number(budget),
      location,
      preferences || 'general travel'
    );

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
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: err.message,
    });
  }
};

// Summarize reviews for an item
const summarizeItemReviews = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.body;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required',
      });
    }

    // Check if item exists
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    // Get reviews from database
    const reviews = await Review.find({ itemId }).select('comment rating -_id');
    
    if (reviews.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No reviews found for this item',
      });
    }

    // Format reviews for AI
    const reviewTexts = reviews.map(r => `Rating: ${r.rating}/5\nComment: ${r.comment}`);
    
    const summary = await summarizeReviews(reviewTexts);

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
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to summarize reviews',
      error: err.message,
    });
  }
};

export const aiControllers = {
  chat,
  generateItemDescription,
  getAIRecommendations,
  summarizeItemReviews,
};
