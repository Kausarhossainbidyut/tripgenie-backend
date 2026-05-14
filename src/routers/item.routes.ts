import { Router } from 'express';
import { itemControllers } from '../controller/item.controller';
import { verifyToken, isAdmin } from '../middlewares/auth';

const router = Router();

// Create item (admin only)
router.post('/', verifyToken, isAdmin, itemControllers.createItem);

// Get all items (public)
router.get('/', itemControllers.getItems);

// Get item by ID (public)
router.get('/:id', itemControllers.getItemById);

// Update item (admin only)
router.patch('/:id', verifyToken, isAdmin, itemControllers.updateItem);

// Delete item (admin only)
router.delete('/:id', verifyToken, isAdmin, itemControllers.deleteItem);

export const ItemRoutes = router;
