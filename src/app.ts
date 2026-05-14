// this is express app setup
// src/app.ts
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
// import router from './routes';
import uploadRoutes from './routers/upload.routes';
import { AuthRoutes } from './routers/auth.routes';
import { UserRoutes } from './routers/user.routes';
import { ItemRoutes } from './routers/item.routes';
import { BookingRoutes } from './routers/booking.routes';
import { ReviewRoutes } from './routers/review.routes';
import { WishlistRoutes } from './routers/wishlist.routes';
import { AIRoutes } from './routers/ai.routes';
import { DashboardRoutes } from './routers/dashboard.routes';
import { PaymentRoutes } from './routers/payment.routes';
const app: Application = express();

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
].filter(Boolean) as string[];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, mobile apps, server-to-server)
    if (!origin) return callback(null, true);
    // Allow any Vercel preview/production deployment of this project
    if (origin.endsWith(".vercel.app")) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked: ${origin}`), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

// Handle preflight for all routes FIRST, before any other middleware
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

app.use(express.json());    


// API Routes
// ---------------------
// app.use('/api/v1', router);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/auth', AuthRoutes);
app.use('/api/users', UserRoutes);
app.use('/api/items', ItemRoutes);
app.use('/api/bookings', BookingRoutes);
app.use('/api/reviews', ReviewRoutes);
app.use('/api/wishlist', WishlistRoutes);
app.use('/api/ai', AIRoutes);
app.use('/api/dashboard', DashboardRoutes);
app.use('/api/payments', PaymentRoutes);

// Health Check / Root Route
// ---------------------
app.get('/', (req: Request, res: Response) => {
  res.send('TripGenie AI Travel Backend is running!');
});


//* 404 Not Found Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});


//* Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

export default app;
