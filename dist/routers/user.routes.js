"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = require("express");
const user_controller_1 = require("../controller/user.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Get all users (protected, admin only)
router.get('/', auth_1.verifyToken, auth_1.isAdmin, user_controller_1.userControllers.getUsers);
// Get user by ID (protected)
router.get('/:id', auth_1.verifyToken, user_controller_1.userControllers.getUserById);
// Update user (protected)
router.patch('/:id', auth_1.verifyToken, user_controller_1.userControllers.updateUser);
// Delete user (protected, admin only)
router.delete('/:id', auth_1.verifyToken, auth_1.isAdmin, user_controller_1.userControllers.deleteUser);
// Get user bookings (protected)
router.get('/:id/bookings', auth_1.verifyToken, user_controller_1.userControllers.getUserBookings);
exports.UserRoutes = router;
