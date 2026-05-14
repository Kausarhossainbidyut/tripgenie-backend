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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userControllers = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../config/db"));
const user_model_1 = require("../models/user.model");
const booking_model_1 = require("../models/booking.model");
const email_service_1 = require("../utils/email.service");
// Generate tokens helper
const generateTokens = (email, role) => {
    const accessToken = jsonwebtoken_1.default.sign({ email, role, type: 'access' }, db_1.default.jwt_secret, { expiresIn: '15m' } // Short lived access token
    );
    const refreshToken = jsonwebtoken_1.default.sign({ email, role, type: 'refresh' }, db_1.default.jwt_secret, { expiresIn: '7d' } // Long lived refresh token
    );
    return { accessToken, refreshToken };
};
// Register user
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, avatar } = req.body;
        // Check if user already exists
        const isUserExist = yield user_model_1.User.findOne({ email });
        if (isUserExist) {
            return res.status(400).json({
                success: false,
                message: 'User already exists!',
            });
        }
        // Hash password
        const hashedPassword = yield bcrypt_1.default.hash(password, Number(db_1.default.bcrypt_salt_rounds));
        // Create user
        const savedUser = yield user_model_1.User.create({
            name,
            email,
            password: hashedPassword,
            avatar: avatar || ''
        });
        // Omit password from response
        const userResponse = savedUser.toObject();
        delete userResponse.password;
        // Send welcome email
        try {
            yield (0, email_service_1.sendWelcomeEmail)(savedUser.email, savedUser.name);
        }
        catch (emailErr) {
            // Don't fail registration if email fails
        }
        res.status(201).json({
            success: true,
            message: 'User registered successfully. Please login to get access token.',
            data: userResponse,
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to register user',
            error: err.message,
        });
    }
});
// Login user
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Check if user exists
        const user = yield user_model_1.User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }
        // Compare passwords
        const isPasswordMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }
        // Generate access and refresh tokens
        const { accessToken, refreshToken } = generateTokens(user.email, user.role);
        // Omit password from response
        const userResponse = user.toObject();
        delete userResponse.password;
        res.status(200).json({
            success: true,
            message: 'User logged in successfully',
            data: {
                user: userResponse,
                accessToken,
                refreshToken,
            },
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to login',
            error: err.message,
        });
    }
});
// Get all users
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield user_model_1.User.find().select('-password');
        res.status(200).json({
            success: true,
            message: 'Users fetched successfully',
            data: users,
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: err.message,
        });
    }
});
// Get user by ID
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield user_model_1.User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
        res.status(200).json({
            success: true,
            message: 'User fetched successfully',
            data: user,
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user',
            error: err.message,
        });
    }
});
// Update user
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, avatar, phone, address, role } = req.body;
        // Build update object with only provided fields
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (avatar !== undefined)
            updateData.avatar = avatar;
        if (phone !== undefined)
            updateData.phone = phone;
        if (address !== undefined)
            updateData.address = address;
        if (role !== undefined)
            updateData.role = role;
        const updatedUser = yield user_model_1.User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: updatedUser,
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to update user',
            error: err.message,
        });
    }
});
// Delete user
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deletedUser = yield user_model_1.User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            error: err.message,
        });
    }
});
// Get user bookings
const getUserBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
        const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
        // Check if user is requesting their own bookings or is admin
        const targetUser = yield user_model_1.User.findById(id);
        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
        if (userRole !== 'admin' && targetUser.email !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only view your own bookings.',
            });
        }
        // Get bookings with item details
        const bookings = yield booking_model_1.Booking.find({ userId: targetUser.email })
            .populate({
            path: 'itemId',
            model: 'Item',
            select: 'title description image price location category'
        })
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            message: 'User bookings fetched successfully',
            data: bookings,
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user bookings',
            error: err.message,
        });
    }
});
// Refresh token
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token is required',
            });
        }
        // Verify refresh token
        const decoded = jsonwebtoken_1.default.verify(refreshToken, db_1.default.jwt_secret);
        // Check if it's a refresh token
        if (decoded.type !== 'refresh') {
            return res.status(403).json({
                success: false,
                message: 'Invalid token type',
            });
        }
        // Generate new tokens
        const tokens = generateTokens(decoded.email, decoded.role);
        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            data: tokens,
        });
    }
    catch (err) {
        res.status(403).json({
            success: false,
            message: 'Invalid or expired refresh token',
            error: err.message,
        });
    }
});
// Forgot password - send reset email
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required',
            });
        }
        const user = yield user_model_1.User.findOne({ email });
        if (!user) {
            // Don't reveal if user exists
            return res.status(200).json({
                success: true,
                message: 'If an account exists, a password reset email has been sent.',
            });
        }
        // Generate reset token (valid for 1 hour)
        const resetToken = jsonwebtoken_1.default.sign({ email: user.email, type: 'password-reset' }, db_1.default.jwt_secret, { expiresIn: '1h' });
        // Send password reset email
        try {
            yield (0, email_service_1.sendPasswordResetEmail)(user.email, user.name, resetToken);
        }
        catch (emailErr) {
            console.error('Failed to send password reset email:', emailErr);
            return res.status(500).json({
                success: false,
                message: 'Failed to send password reset email',
            });
        }
        res.status(200).json({
            success: true,
            message: 'If an account exists, a password reset email has been sent.',
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to process forgot password request',
            error: err.message,
        });
    }
});
// Reset password with token
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Token and new password are required',
            });
        }
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, db_1.default.jwt_secret);
        if (decoded.type !== 'password-reset') {
            return res.status(400).json({
                success: false,
                message: 'Invalid token type',
            });
        }
        // Hash new password
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, Number(db_1.default.bcrypt_salt_rounds));
        // Update user password
        const updatedUser = yield user_model_1.User.findOneAndUpdate({ email: decoded.email }, { password: hashedPassword }, { new: true });
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
        res.status(200).json({
            success: true,
            message: 'Password reset successfully',
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: 'Invalid or expired token',
            error: err.message,
        });
    }
});
exports.userControllers = {
    register,
    login,
    refreshToken,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    getUserBookings,
    forgotPassword,
    resetPassword,
};
