import { Router } from 'express';
import { itemControllers } from '../controller/item.controller';
import { verifyToken } from '../middlewares/auth';

const router = Router();

// Create item (protected)
router.post('/', verifyToken, itemControllers.createItem);

// Get all items (public)
router.get('/', itemControllers.getItems);

// Get item by ID (public)
router.get('/:id', itemControllers.getItemById);

// Update item (protected)
router.patch('/:id', verifyToken, itemControllers.updateItem);

// Delete item (protected)
router.delete('/:id', verifyToken, itemControllers.deleteItem);

export const ItemRoutes = router;
