import { Router } from 'express';
import { userControllers } from '../controller/user.controller';

const router = Router();

// Register user
router.post('/register', userControllers.register);

// Login user
router.post('/login', userControllers.login);

// Refresh token
router.post('/refresh-token', userControllers.refreshToken);

// Forgot password
router.post('/forgot-password', userControllers.forgotPassword);

// Reset password
router.post('/reset-password', userControllers.resetPassword);

export const AuthRoutes = router;
