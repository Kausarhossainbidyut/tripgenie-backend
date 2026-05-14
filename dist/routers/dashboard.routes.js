"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardRoutes = void 0;
const express_1 = require("express");
const dashboard_controller_1 = require("../controller/dashboard.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Dashboard stats - Admin only
router.get('/stats', auth_1.verifyToken, auth_1.isAdmin, dashboard_controller_1.dashboardControllers.getStats);
// Chart data - Admin only
router.get('/chart-data', auth_1.verifyToken, auth_1.isAdmin, dashboard_controller_1.dashboardControllers.getChartData);
exports.DashboardRoutes = router;
