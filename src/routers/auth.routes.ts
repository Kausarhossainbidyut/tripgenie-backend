import { Router } from 'express';
import { userControllers } from '../controller/user.controller';

const router = Router();

// Register user
router.post('/register', userControllers.register);

// Login user
router.post('/login', userControllers.login);

// Refresh token
router.post('/refresh-token', userControllers.refreshToken);

export const AuthRoutes = router;
