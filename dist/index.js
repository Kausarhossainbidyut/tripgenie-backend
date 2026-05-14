"use strict";
/**
 * Vercel Serverless Entry Point
 *
 * Vercel is serverless — it does NOT support app.listen().
 * We connect to MongoDB once (cached across warm invocations)
 * and export the Express app as the default export.
 */
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
function connectDB() {
    return __awaiter(this, void 0, void 0, function* () {
        if (isConnected)
            return;
        if (!db_1.default.database_url) {
            throw new Error('MONGO_CONNECTION_STRING is not set in environment variables');
        }
        yield mongoose_1.default.connect(db_1.default.database_url);
        isConnected = true;
    });
}
// Connect on cold start (Vercel will await this before handling requests)
connectDB().catch(console.error);
// Export the Express app — Vercel uses this as the serverless handler
exports.default = app_1.default;
module.exports = app_1.default;
