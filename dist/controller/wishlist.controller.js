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
exports.wishlistControllers = void 0;
const wishlist_model_1 = require("../models/wishlist.model");
const item_model_1 = require("../models/item.model");
// Add to wishlist
const addToWishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { itemId } = req.body;
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
        // Check if already in wishlist
        const existingWishlist = yield wishlist_model_1.Wishlist.findOne({ userId, itemId });
        if (existingWishlist) {
            return res.status(400).json({
                success: false,
                message: 'Item already in wishlist',
            });
        }
        const wishlist = yield wishlist_model_1.Wishlist.create({
            userId,
            itemId
        });
        res.status(201).json({
            success: true,
            message: 'Added to wishlist successfully',
            data: wishlist,
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to add to wishlist',
            error: err.message,
        });
    }
});
// Get user's wishlist
const getWishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
        const wishlist = yield wishlist_model_1.Wishlist.find({ userId })
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
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch wishlist',
            error: err.message,
        });
    }
});
// Remove from wishlist
const removeFromWishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
        const wishlist = yield wishlist_model_1.Wishlist.findOne({ _id: id, userId });
        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: 'Wishlist item not found',
            });
        }
        yield wishlist_model_1.Wishlist.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: 'Removed from wishlist successfully',
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to remove from wishlist',
            error: err.message,
        });
    }
});
// Check if item is in wishlist
const checkWishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { itemId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
        const wishlist = yield wishlist_model_1.Wishlist.findOne({ userId, itemId });
        res.status(200).json({
            success: true,
            message: 'Wishlist status checked',
            data: {
                isInWishlist: !!wishlist,
                wishlistId: (wishlist === null || wishlist === void 0 ? void 0 : wishlist._id) || null
            }
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to check wishlist status',
            error: err.message,
        });
    }
});
exports.wishlistControllers = {
    addToWishlist,
    getWishlist,
    removeFromWishlist,
    checkWishlist,
};
