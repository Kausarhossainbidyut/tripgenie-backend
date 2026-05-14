"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// this is express app setup
// src/app.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// import router from './routes';
const upload_routes_1 = __importDefault(require("./routers/upload.routes"));
const auth_routes_1 = require("./routers/auth.routes");
const user_routes_1 = require("./routers/user.routes");
const item_routes_1 = require("./routers/item.routes");
const booking_routes_1 = require("./routers/booking.routes");
const review_routes_1 = require("./routers/review.routes");
const wishlist_routes_1 = require("./routers/wishlist.routes");
const ai_routes_1 = require("./routers/ai.routes");
const dashboard_routes_1 = require("./routers/dashboard.routes");
const payment_routes_1 = require("./routers/payment.routes");
const app = (0, express_1.default)();
// Middleware
const allowedOrigins = [
    // Local development
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:4173",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    // Production frontend — set CLIENT_URL in Vercel environment variables
    process.env.CLIENT_URL,
].filter(Boolean);
const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (Postman, mobile apps, server-to-server)
        if (!origin)
            return callback(null, true);
        // Allow any Vercel preview/production deployment of this project
        if (origin.endsWith(".vercel.app"))
            return callback(null, true);
        if (allowedOrigins.includes(origin))
            return callback(null, true);
        return callback(new Error(`CORS blocked: ${origin}`), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
};
// Handle preflight for all routes FIRST, before any other middleware
app.options("/{*path}", (0, cors_1.default)(corsOptions));
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
// API Routes
// ---------------------
// app.use('/api/v1', router);
app.use('/api/v1/upload', upload_routes_1.default);
app.use('/api/auth', auth_routes_1.AuthRoutes);
app.use('/api/users', user_routes_1.UserRoutes);
app.use('/api/items', item_routes_1.ItemRoutes);
app.use('/api/bookings', booking_routes_1.BookingRoutes);
app.use('/api/reviews', review_routes_1.ReviewRoutes);
app.use('/api/wishlist', wishlist_routes_1.WishlistRoutes);
app.use('/api/ai', ai_routes_1.AIRoutes);
app.use('/api/dashboard', dashboard_routes_1.DashboardRoutes);
app.use('/api/payments', payment_routes_1.PaymentRoutes);
// Health Check / Root Route
// ---------------------
app.get('/', (req, res) => {
    res.send('TripGenie AI Travel Backend is running!');
});
//* 404 Not Found Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});
//* Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});
exports.default = app;
