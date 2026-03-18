import { Router } from 'express';
import { dashboardControllers } from '../controller/dashboard.controller';
import { verifyToken, isAdmin } from '../middlewares/auth';

const router = Router();

// Dashboard stats - Admin only
router.get('/stats', verifyToken, isAdmin, dashboardControllers.getStats);

// Chart data - Admin only
router.get('/chart-data', verifyToken, isAdmin, dashboardControllers.getChartData);

export const DashboardRoutes = router;
