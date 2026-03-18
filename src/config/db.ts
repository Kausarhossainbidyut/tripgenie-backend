import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const config = {
  port: process.env.PORT || 5000,
  database_url: process.env.MONGO_CONNECTION_STRING || 'mongodb://127.0.0.1:27017/tripgenie',
  bcrypt_salt_rounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
  jwt_secret: process.env.JWT_SECRET || 'default_jwt_secret',
  jwt_expires_in: process.env.JWT_EXPIRES_IN || '7d',
  gemini_api_key: process.env.GEMINI_API_KEY || '',
  openrouter_api_key: process.env.OPENROUTER_API_KEY || '',
  client_url: process.env.CLIENT_URL || 'http://localhost:3000',
  imgbb_api_key: process.env.IMGBB_API_KEY || '',
  email_host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  email_port: process.env.EMAIL_PORT || 587,
  email_user: process.env.EMAIL_USER || '',
  email_pass: process.env.EMAIL_PASS || '',
  stripe_secret_key: process.env.STRIPE_SECRET_KEY || '',
  stripe_publishable_key: process.env.STRIPE_PUBLISHABLE_KEY || '',
};

export default config;
