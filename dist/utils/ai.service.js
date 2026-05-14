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
exports.summarizeReviews = exports.getRecommendations = exports.generateDescription = exports.chatWithAI = void 0;
const axios_1 = __importDefault(require("axios"));
const db_1 = __importDefault(require("../config/db"));
// OpenRouter API client
const openRouterClient = axios_1.default.create({
    baseURL: 'https://openrouter.ai/api/v1',
    headers: {
        'Authorization': `Bearer ${db_1.default.openrouter_api_key || ''}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5000',
        'X-Title': 'TripGenie AI'
    }
});
// AI Chatbot - General travel assistant
const chatWithAI = (message) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const prompt = `You are TripGenie, an AI travel assistant for Bangladesh tourism. 
    Help users with travel-related questions, suggestions, and recommendations.
    Be friendly, informative, and focus on Bangladesh destinations.
    
    User: ${message}
    
    TripGenie:`;
        const response = yield openRouterClient.post('/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
        });
        return ((_b = (_a = response.data.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || 'No response from AI';
    }
    catch (error) {
        console.error('OpenRouter API Error:', error.message);
        throw new Error(`AI Error: ${error.message || 'Failed to get AI response'}`);
    }
});
exports.chatWithAI = chatWithAI;
// Generate description for destination/item
const generateDescription = (title) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const prompt = `Write an attractive travel description for "${title}" in Bangladesh. 
    Include: what makes it special, best time to visit, and key attractions.
    Keep it under 150 words and engaging for tourists.`;
        const response = yield openRouterClient.post('/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
        });
        return ((_b = (_a = response.data.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || 'No description generated';
    }
    catch (error) {
        console.error('OpenRouter API Error:', error.message);
        throw new Error(`AI Error: ${error.message || 'Failed to generate description'}`);
    }
});
exports.generateDescription = generateDescription;
// Get AI recommendations based on preferences
const getRecommendations = (budget, location, preferences) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const prompt = `Suggest 3-5 travel destinations in Bangladesh based on:
    - Budget: ${budget} BDT
    - Preferred location type: ${location}
    - User preferences: ${preferences}
    
    For each destination, provide: name, brief description, estimated cost, and why it matches.`;
        const response = yield openRouterClient.post('/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
        });
        return ((_b = (_a = response.data.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || 'No recommendations generated';
    }
    catch (error) {
        console.error('OpenRouter API Error:', error.message);
        throw new Error(`AI Error: ${error.message || 'Failed to get recommendations'}`);
    }
});
exports.getRecommendations = getRecommendations;
// Summarize reviews
const summarizeReviews = (reviews) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const reviewsText = reviews.join('\n---\n');
        const prompt = `Summarize these customer reviews into a concise paragraph (max 100 words).
    Highlight: overall sentiment, common praises, and any complaints.
    
    Reviews:
    ${reviewsText}
    
    Summary:`;
        const response = yield openRouterClient.post('/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
        });
        return ((_b = (_a = response.data.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || 'No summary generated';
    }
    catch (error) {
        console.error('OpenRouter API Error:', error.message);
        throw new Error(`AI Error: ${error.message || 'Failed to summarize reviews'}`);
    }
});
exports.summarizeReviews = summarizeReviews;
