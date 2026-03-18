import { Router } from 'express';
import { userControllers } from '../controller/user.controller';
import { verifyToken, isAdmin } from '../middlewares/auth';

const router = Router();

// Get all users (protected, admin only)
router.get('/', verifyToken, isAdmin, userControllers.getUsers);

// Get user by ID (protected)
router.get('/:id', verifyToken, userControllers.getUserById);

// Update user (protected)
router.patch('/:id', verifyToken, userControllers.updateUser);

// Delete user (protected, admin only)
router.delete('/:id', verifyToken, isAdmin, userControllers.deleteUser);

export const UserRoutes = router;
