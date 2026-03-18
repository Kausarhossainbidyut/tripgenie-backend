import { Request, Response } from 'express';
import { Item } from '../models/item.model';

// Create new item
const createItem = async (req: Request, res: Response) => {
  try {
    const { title, description, image, price, rating, location, category, quantity } = req.body;
    
    // Get user email from token (set by auth middleware)
    const createdBy = req.user?.email;

    const newItem = await Item.create({
      title,
      description,
      image,
      price,
      rating: rating || 0,
      location,
      category,
      quantity: quantity || 0,
      createdBy
    });

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: newItem,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create item',
      error: err.message,
    });
  }
};

// Get all items
const getItems = async (req: Request, res: Response) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: 'Items fetched successfully',
      data: items,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch items',
      error: err.message,
    });
  }
};

// Get item by ID
const getItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await Item.findById(id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Item fetched successfully',
      data: item,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch item',
      error: err.message,
    });
  }
};

// Update item
const updateItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, image, price, rating, location, category, quantity } = req.body;

    const updatedItem = await Item.findByIdAndUpdate(
      id,
      { title, description, image, price, rating, location, category, quantity },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: updatedItem,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update item',
      error: err.message,
    });
  }
};

// Delete item
const deleteItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedItem = await Item.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Item deleted successfully',
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete item',
      error: err.message,
    });
  }
};

export const itemControllers = {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
};
