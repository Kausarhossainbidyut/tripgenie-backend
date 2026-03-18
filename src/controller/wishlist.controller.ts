import { Request, Response } from 'express';
import { Wishlist } from '../models/wishlist.model';
import { Item } from '../models/item.model';

// Add to wishlist
const addToWishlist = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.body;
    
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

    // Check if already in wishlist
    const existingWishlist = await Wishlist.findOne({ userId, itemId });
    if (existingWishlist) {
      return res.status(400).json({
        success: false,
        message: 'Item already in wishlist',
      });
    }

    const wishlist = await Wishlist.create({
      userId,
      itemId
    });

    res.status(201).json({
      success: true,
      message: 'Added to wishlist successfully',
      data: wishlist,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to add to wishlist',
      error: err.message,
    });
  }
};

// Get user's wishlist
const getWishlist = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.email;

    const wishlist = await Wishlist.find({ userId })
      .populate({
        path: 'itemId',
        model: 'Item',
        select: 'title description image price rating location category'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Wishlist fetched successfully',
      data: wishlist,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlist',
      error: err.message,
    });
  }
};

// Remove from wishlist
const removeFromWishlist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.email;

    const wishlist = await Wishlist.findOne({ _id: id, userId });
    
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist item not found',
      });
    }

    await Wishlist.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Removed from wishlist successfully',
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to remove from wishlist',
      error: err.message,
    });
  }
};

// Check if item is in wishlist
const checkWishlist = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const userId = req.user?.email;

    const wishlist = await Wishlist.findOne({ userId, itemId });

    res.status(200).json({
      success: true,
      message: 'Wishlist status checked',
      data: {
        isInWishlist: !!wishlist,
        wishlistId: wishlist?._id || null
      }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to check wishlist status',
      error: err.message,
    });
  }
};

export const wishlistControllers = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  checkWishlist,
};
