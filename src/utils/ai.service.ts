import axios from 'axios';
import config from '../config/db';

// OpenRouter API client
const openRouterClient = axios.create({
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    'Authorization': `Bearer ${config.openrouter_api_key || ''}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'http://localhost:5000',
    'X-Title': 'TripGenie AI'
  }
});

// AI Chatbot - General travel assistant
export const chatWithAI = async (message: string): Promise<string> => {
  try {
    const prompt = `You are TripGenie, an AI travel assistant for Bangladesh tourism. 
    Help users with travel-related questions, suggestions, and recommendations.
    Be friendly, informative, and focus on Bangladesh destinations.
    
    User: ${message}
    
    TripGenie:`;
    
    const response = await openRouterClient.post('/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });
    
    return response.data.choices[0]?.message?.content || 'No response from AI';
  } catch (error: any) {
    console.error('OpenRouter API Error:', error.message);
    throw new Error(`AI Error: ${error.message || 'Failed to get AI response'}`);
  }
};

// Generate description for destination/item
export const generateDescription = async (title: string): Promise<string> => {
  try {
    const prompt = `Write an attractive travel description for "${title}" in Bangladesh. 
    Include: what makes it special, best time to visit, and key attractions.
    Keep it under 150 words and engaging for tourists.`;
    
    const response = await openRouterClient.post('/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });
    
    return response.data.choices[0]?.message?.content || 'No description generated';
  } catch (error: any) {
    console.error('OpenRouter API Error:', error.message);
    throw new Error(`AI Error: ${error.message || 'Failed to generate description'}`);
  }
};

// Get AI recommendations based on preferences
export const getRecommendations = async (
  budget: number,
  location: string,
  preferences: string
): Promise<string> => {
  try {
    const prompt = `Suggest 3-5 travel destinations in Bangladesh based on:
    - Budget: ${budget} BDT
    - Preferred location type: ${location}
    - User preferences: ${preferences}
    
    For each destination, provide: name, brief description, estimated cost, and why it matches.`;
    
    const response = await openRouterClient.post('/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });
    
    return response.data.choices[0]?.message?.content || 'No recommendations generated';
  } catch (error: any) {
    console.error('OpenRouter API Error:', error.message);
    throw new Error(`AI Error: ${error.message || 'Failed to get recommendations'}`);
  }
};

// Summarize reviews
export const summarizeReviews = async (reviews: string[]): Promise<string> => {
  try {
    const reviewsText = reviews.join('\n---\n');
    const prompt = `Summarize these customer reviews into a concise paragraph (max 100 words).
    Highlight: overall sentiment, common praises, and any complaints.
    
    Reviews:
    ${reviewsText}
    
    Summary:`;
    
    const response = await openRouterClient.post('/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });
    
    return response.data.choices[0]?.message?.content || 'No summary generated';
  } catch (error: any) {
    console.error('OpenRouter API Error:', error.message);
    throw new Error(`AI Error: ${error.message || 'Failed to summarize reviews'}`);
  }
};
