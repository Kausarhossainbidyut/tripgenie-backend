/**
 * Vercel Serverless Entry Point
 *
 * Vercel is serverless — it does NOT support app.listen().
 * We connect to MongoDB once (cached across warm invocations)
 * and export a handler that ensures DB is ready before each request.
 */
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import app from './app';
import config from './config/db';

let isConnected = false;
let connectionPromise: Promise<void> | null = null;

function connectDB(): Promise<void> {
  if (isConnected) return Promise.resolve();
  if (connectionPromise) return connectionPromise;

  if (!config.database_url) {
    return Promise.reject(
      new Error('MONGO_CONNECTION_STRING env var is not set on Vercel. Go to Vercel Dashboard → Settings → Environment Variables and add it.')
    );
  }

  connectionPromise = mongoose
    .connect(config.database_url, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    })
    .then(() => {
      isConnected = true;
      console.log('MongoDB connected');
    })
    .catch((err) => {
      connectionPromise = null;
      throw err;
    });

  return connectionPromise;
}

// Wrap the Express app to ensure DB is connected before every request
const handler = async (req: Request, res: Response) => {
  try {
    await connectDB();
  } catch (err: any) {
    console.error('DB connection failed:', err.message);
    res.status(500).json({
      success: false,
      message: 'Database connection failed. Check Vercel environment variables.',
      error: err.message,
    });
    return;
  }
  app(req, res);
};

export default handler;
