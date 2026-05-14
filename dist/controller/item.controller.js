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
exports.itemControllers = void 0;
const item_model_1 = require("../models/item.model");
// Create new item
const createItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, description, image, gallery, price, rating, location, category, quantity } = req.body;
        // Get user email from token (set by auth middleware)
        const createdBy = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
        const newItem = yield item_model_1.Item.create({
            title,
            description,
            image,
            gallery: gallery || [],
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
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to create item',
            error: err.message,
        });
    }
});
// Get all items with search, filter, sort, pagination
const getItems = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search, category, priceMin, priceMax, sort, page = 1, limit = 10 } = req.query;
        // Build query
        const query = {};
        // Search by title or description
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        // Filter by category
        if (category) {
            query.category = { $regex: category, $options: 'i' };
        }
        // Filter by price range
        if (priceMin || priceMax) {
            query.price = {};
            if (priceMin)
                query.price.$gte = Number(priceMin);
            if (priceMax)
                query.price.$lte = Number(priceMax);
        }
        // Build sort
        let sortOption = {};
        if (sort) {
            const sortField = sort.replace('-', '');
            const sortOrder = sort.startsWith('-') ? -1 : 1;
            sortOption[sortField] = sortOrder;
        }
        else {
            sortOption = { createdAt: -1 };
        }
        // Pagination
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.max(1, Number(limit));
        const skip = (pageNum - 1) * limitNum;
        // Execute query
        const items = yield item_model_1.Item.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(limitNum);
        // Get total count
        const total = yield item_model_1.Item.countDocuments(query);
        res.status(200).json({
            success: true,
            message: 'Items fetched successfully',
            data: items,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch items',
            error: err.message,
        });
    }
});
// Get item by ID
const getItemById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const item = yield item_model_1.Item.findById(id);
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
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch item',
            error: err.message,
        });
    }
});
// Update item
const updateItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { title, description, image, gallery, price, rating, location, category, quantity } = req.body;
        // Only update fields that were actually provided
        const updateData = {};
        if (title !== undefined)
            updateData.title = title;
        if (description !== undefined)
            updateData.description = description;
        if (image !== undefined)
            updateData.image = image;
        if (gallery !== undefined)
            updateData.gallery = gallery;
        if (price !== undefined)
            updateData.price = price;
        if (rating !== undefined)
            updateData.rating = rating;
        if (location !== undefined)
            updateData.location = location;
        if (category !== undefined)
            updateData.category = category;
        if (quantity !== undefined)
            updateData.quantity = quantity;
        const updatedItem = yield item_model_1.Item.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
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
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to update item',
            error: err.message,
        });
    }
});
// Delete item
const deleteItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deletedItem = yield item_model_1.Item.findByIdAndDelete(id);
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
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete item',
            error: err.message,
        });
    }
});
exports.itemControllers = {
    createItem,
    getItems,
    getItemById,
    updateItem,
    deleteItem,
};
