"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const express_1 = require("express");
const user_controller_1 = require("../controller/user.controller");
const router = (0, express_1.Router)();
// Register user
router.post('/register', user_controller_1.userControllers.register);
// Login user
router.post('/login', user_controller_1.userControllers.login);
// Refresh token
router.post('/refresh-token', user_controller_1.userControllers.refreshToken);
// Forgot password
router.post('/forgot-password', user_controller_1.userControllers.forgotPassword);
// Reset password
router.post('/reset-password', user_controller_1.userControllers.resetPassword);
exports.AuthRoutes = router;
