"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemRoutes = void 0;
const express_1 = require("express");
const item_controller_1 = require("../controller/item.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Create item (admin only)
router.post('/', auth_1.verifyToken, auth_1.isAdmin, item_controller_1.itemControllers.createItem);
// Get all items (public)
router.get('/', item_controller_1.itemControllers.getItems);
// Get item by ID (public)
router.get('/:id', item_controller_1.itemControllers.getItemById);
// Update item (admin only)
router.patch('/:id', auth_1.verifyToken, auth_1.isAdmin, item_controller_1.itemControllers.updateItem);
// Delete item (admin only)
router.delete('/:id', auth_1.verifyToken, auth_1.isAdmin, item_controller_1.itemControllers.deleteItem);
exports.ItemRoutes = router;
