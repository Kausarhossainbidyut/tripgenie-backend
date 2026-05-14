"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const db_1 = __importDefault(require("./config/db"));
let isConnected = false;
let connectionPromise = null;
function connectDB() {
    if (isConnected)
        return Promise.resolve();
    if (connectionPromise)
        return connectionPromise;
    if (!db_1.default.database_url) {
        return Promise.reject(new Error('MONGO_CONNECTION_STRING env var is not set on Vercel. Go to Vercel Dashboard → Settings → Environment Variables and add it.'));
    }
    connectionPromise = mongoose_1.default
        .connect(db_1.default.database_url, {
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
const handler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield connectDB();
    }
    catch (err) {
        console.error('DB connection failed:', err.message);
        res.status(500).json({
            success: false,
            message: 'Database connection failed. Check Vercel environment variables.',
            error: err.message,
        });
        return;
    }
    (0, app_1.default)(req, res);
});
exports.default = handler;
