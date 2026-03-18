import { Router } from 'express';
import { userControllers } from '../controller/user.controller';

const router = Router();

// Register user
router.post('/register', userControllers.register);

// Login user
router.post('/login', userControllers.login);

// Refresh token (placeholder - can be implemented later)
router.post('/refresh-token', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Refresh token endpoint - implement as needed'
  });
});

export const AuthRoutes = router;
