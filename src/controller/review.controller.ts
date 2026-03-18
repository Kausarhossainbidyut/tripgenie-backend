import { Request, Response } from 'express';
import { Review } from '../models/review.model';
import { Item } from '../models/item.model';

// Create new review
const createReview = async (req: Request, res: Response) => {
  try {
    const { rating, comment, itemId } = req.body;
    
    // Get user email from token
    const userId = req.user?.email;

    // Check if item exists
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    const newReview = await Review.create({
      rating,
      comment,
      userId,
      itemId
    });

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: newReview,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: err.message,
    });
  }
};

// Get reviews by item ID
const getReviewsByItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;

    // Check if item exists
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    const reviews = await Review.find({ itemId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Reviews fetched successfully',
      data: reviews,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: err.message,
    });
  }
};

// Delete review
const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.email;
    const userRole = req.user?.role;

    const review = await Review.findById(id);
    
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

    await Review.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: err.message,
    });
  }
};

export const reviewControllers = {
  createReview,
  getReviewsByItem,
  deleteReview,
};
