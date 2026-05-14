/**
 * Vercel Serverless Entry Point
 * 
 * Vercel is serverless — it does NOT support app.listen().
 * We connect to MongoDB once (cached across warm invocations)
 * and export the Express app as the default export.
 */
import mongoose from 'mongoose';
import app from './app';
import config from './config/db';

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  if (!config.database_url) {
    throw new Error('MONGO_CONNECTION_STRING is not set in environment variables');
  }
  await mongoose.connect(config.database_url);
  isConnected = true;
}

// Connect on cold start (Vercel will await this before handling requests)
connectDB().catch(console.error);

// Export the Express app — Vercel uses this as the serverless handler
export default app;
