import { Request, Response } from 'express';
import { Review } from '../models/review.model';
import { Item } from '../models/item.model';

// Helper function to update item rating
const updateItemRating = async (itemId: string) => {
  const reviews = await Review.find({ itemId });
  
  if (reviews.length === 0) {
    // No reviews, set rating to 0
    await Item.findByIdAndUpdate(itemId, { rating: 0 });
    return 0;
  }
  
  // Calculate average rating
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;
  
  // Update item with new rating (rounded to 1 decimal)
  await Item.findByIdAndUpdate(itemId, { 
    rating: Math.round(averageRating * 10) / 10 
  });
  
  return averageRating;
};

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

    // Update item rating
    const newAverageRating = await updateItemRating(itemId);

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: {
        review: newReview,
        itemRating: newAverageRating
      }
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

    // Get itemId before deleting
    const itemId = review.itemId;
    
    await Review.findByIdAndDelete(id);

    // Update item rating after deletion
    const newAverageRating = await updateItemRating(itemId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
      data: {
        itemRating: newAverageRating
      }
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
