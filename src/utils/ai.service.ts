import axios from 'axios';
import config from '../config/db';

// Lazy client — created on first use so env vars are fully loaded
const getOpenRouterClient = () => {
  return axios.create({
    baseURL: 'https://openrouter.ai/api/v1',
    headers: {
      'Authorization': `Bearer ${config.openrouter_api_key || ''}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': config.client_url || 'https://tripgenie.vercel.app',
      'X-Title': 'TripGenie AI',
    },
  });
};

export const chatWithAI = async (message: string): Promise<string> => {
  try {
    const prompt = `You are TripGenie, an AI travel assistant for Bangladesh tourism. 
    Help users with travel-related questions, suggestions, and recommendations.
    Be friendly, informative, and focus on Bangladesh destinations.
    
    User: ${message}
    
    TripGenie:`;
    const response = await getOpenRouterClient().post('/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });
    return response.data.choices[0]?.message?.content || 'No response from AI';
  } catch (error: any) {
    console.error('OpenRouter API Error:', error.message);
    throw new Error(`AI Error: ${error.message || 'Failed to get AI response'}`);
  }
};

export const generateDescription = async (title: string): Promise<string> => {
  try {
    const prompt = `Write an attractive travel description for "${title}" in Bangladesh. 
    Include: what makes it special, best time to visit, and key attractions.
    Keep it under 150 words and engaging for tourists.`;
    const response = await getOpenRouterClient().post('/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });
    return response.data.choices[0]?.message?.content || 'No description generated';
  } catch (error: any) {
    console.error('OpenRouter API Error:', error.message);
    throw new Error(`AI Error: ${error.message || 'Failed to generate description'}`);
  }
};

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
    const response = await getOpenRouterClient().post('/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });
    return response.data.choices[0]?.message?.content || 'No recommendations generated';
  } catch (error: any) {
    console.error('OpenRouter API Error:', error.message);
    throw new Error(`AI Error: ${error.message || 'Failed to get recommendations'}`);
  }
};

export const summarizeReviews = async (reviews: string[]): Promise<string> => {
  try {
    const reviewsText = reviews.join('\n---\n');
    const prompt = `Summarize these customer reviews into a concise paragraph (max 100 words).
    Highlight: overall sentiment, common praises, and any complaints.
    
    Reviews:
    ${reviewsText}
    
    Summary:`;
    const response = await getOpenRouterClient().post('/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });
    return response.data.choices[0]?.message?.content || 'No summary generated';
  } catch (error: any) {
    console.error('OpenRouter API Error:', error.message);
    throw new Error(`AI Error: ${error.message || 'Failed to summarize reviews'}`);
  }
};
