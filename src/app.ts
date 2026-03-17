// this is express app setup
// src/app.ts
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
// import router from './routes';
import uploadRoutes from './routers/upload.routes';

const app: Application = express();

// Middleware
app.use(cors());            
app.use(express.json());    


// API Routes
// ---------------------
// app.use('/api/v1', router);
app.use('/api/v1/upload', uploadRoutes);

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
