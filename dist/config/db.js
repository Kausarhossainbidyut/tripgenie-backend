"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const node_dns_1 = __importDefault(require("node:dns"));
const path_1 = __importDefault(require("path"));
node_dns_1.default.setServers(["8.8.8.8", "1.1.1.1"]);
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), '.env') });
const config = {
    port: process.env.PORT || 5000,
    database_url: process.env.MONGO_CONNECTION_STRING,
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
exports.default = config;
