import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { type CreditCard } from "@shared/schema";
import { z } from "zod";

// Hugging Face API configuration
const HF_API_URL = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium";
const HF_API_KEY = process.env.HUGGING_FACE_API_KEY || process.env.HF_API_KEY || "default_key";

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Chat conversation management (simplified without user sessions)
const conversationState = new Map<string, {
  messages: ChatMessage[];
  userProfile: any;
  stage: string;
}>();

async function callHuggingFaceAPI(messages: ChatMessage[]): Promise<string> {
  try {
    // Convert messages to DialoGPT format
    const conversationText = messages
      .map(msg => msg.role === 'user' ? `User: ${msg.content}` : `Bot: ${msg.content}`)
      .join('\n');

    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: conversationText,
        parameters: {
          max_length: 100,
          do_sample: true,
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error);
    }

    // Extract the generated response
    let botResponse = result[0]?.generated_text || '';
    
    // Clean up the response to get only the new bot message
    const lastBotIndex = botResponse.lastIndexOf('Bot:');
    if (lastBotIndex !== -1) {
      botResponse = botResponse.substring(lastBotIndex + 4).trim();
    }

    return botResponse || "I understand. Let me help you find the right credit card.";
  } catch (error) {
    console.error("Hugging Face API error:", error);
    // Fallback response
    return "I'm here to help you find the perfect credit card. Could you tell me more about your preferences?";
  }
}

function generateRuleBasedResponse(userMessage: string, userProfile: any, stage: string): {
  response: string;
  nextStage: string;
  updateProfile: any;
} {
  const message = userMessage.toLowerCase();
  
  switch (stage) {
    case 'welcome':
      if (message.includes('income') || /\d+/.test(message)) {
        const incomeMatch = message.match(/(\d+)/);
        let income = incomeMatch ? parseInt(incomeMatch[1]) : 0;
        // Convert thousands format (50 -> 50000)
        if (income < 1000) {
          income = income * 1000;
        }
        return {
          response: `Great! With a monthly income of ₹${income}, you have good options. What are your main spending categories? For example: dining, shopping, travel, fuel, or online purchases?`,
          nextStage: 'spending',
          updateProfile: { monthlyIncome: income.toString() }
        };
      }
      return {
        response: "I'd be happy to help you find the perfect credit card! Let's start with your approximate monthly income so I can recommend suitable options.",
        nextStage: 'income',
        updateProfile: {}
      };

    case 'income':
      const incomeMatch = message.match(/(\d+)/);
      let income = incomeMatch ? parseInt(incomeMatch[1]) : 0;
      // Convert thousands format (50 -> 50000)
      if (income < 1000) {
        income = income * 1000;
      }
      return {
        response: `Perfect! With ₹${income} monthly income, you qualify for several great cards. Now, what are your main spending categories? For example: dining out, online shopping, travel, fuel, groceries?`,
        nextStage: 'spending',
        updateProfile: { monthlyIncome: income.toString() }
      };

    case 'spending':
      const categories = [];
      if (message.includes('dining') || message.includes('restaurant')) categories.push('dining');
      if (message.includes('travel') || message.includes('flight') || message.includes('hotel')) categories.push('travel');
      if (message.includes('shopping') || message.includes('online')) categories.push('shopping');
      if (message.includes('fuel') || message.includes('petrol') || message.includes('gas')) categories.push('fuel');
      if (message.includes('grocery') || message.includes('groceries')) categories.push('grocery');
      
      return {
        response: `Excellent! I can see you spend on ${categories.join(', ')}. One more question - do you know your approximate credit score? This helps me recommend cards you're likely to get approved for. (You can say: above 750, 700-750, 650-700, or below 650)`,
        nextStage: 'credit_score',
        updateProfile: { spendingCategories: categories }
      };

    case 'credit_score':
      let creditScore = 700; // default
      if (message.includes('750') || message.includes('above 750') || message.includes('excellent')) {
        creditScore = 780;
      } else if (message.includes('700') || message.includes('good')) {
        creditScore = 720;
      } else if (message.includes('650') || message.includes('fair')) {
        creditScore = 670;
      } else if (message.includes('below') || message.includes('poor')) {
        creditScore = 600;
      }

      return {
        response: `Perfect! Based on your profile - income: ₹${userProfile.monthlyIncome}, spending on ${userProfile.spendingCategories?.join(', ')}, and credit score around ${creditScore} - I've found the best cards that match your needs! Check out the recommendations below.`,
        nextStage: 'recommendations',
        updateProfile: { creditScore: creditScore.toString() }
      };

    default:
      return {
        response: "Thank you for that information! Is there anything specific about credit cards you'd like to know more about?",
        nextStage: 'general',
        updateProfile: {}
      };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize credit cards data
  await storage.initializeCards();

  // Health check route
  app.get('/api/health', async (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
  });

  // Credit Cards routes
  app.get('/api/cards', async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      const offset = (page - 1) * limit;
      
      const filters = {
        search: req.query.search as string,
        issuer: req.query.issuer as string,
        cardType: req.query.cardType as string,
        sortBy: req.query.sortBy as string,
      };

      const result = await storage.getCards(offset, limit, filters);
      res.json(result);
    } catch (error) {
      console.error("Error fetching cards:", error);
      res.status(500).json({ message: "Failed to fetch cards" });
    }
  });

  app.get('/api/cards/:id', async (req, res) => {
    try {
      const cardId = parseInt(req.params.id);
      const card = await storage.getCardById(cardId);
      
      if (!card) {
        return res.status(404).json({ message: "Card not found" });
      }

      res.json(card);
    } catch (error) {
      console.error("Error fetching card:", error);
      res.status(500).json({ message: "Failed to fetch card" });
    }
  });



  // Chat routes (simplified without authentication)
  app.post('/api/chat', async (req: any, res) => {
    try {
      const { message, sessionId } = req.body;

      if (!message || !sessionId) {
        return res.status(400).json({ message: "Message and sessionId are required" });
      }

      // Get or create conversation state (using sessionId only)
      const conversationKey = sessionId;
      let conversation = conversationState.get(conversationKey);
      
      if (!conversation) {
        conversation = {
          messages: [{
            role: 'assistant',
            content: "Hi! I'm your AI credit card advisor. I'll ask you a few questions to recommend the best cards for your needs. Let's start - what's your approximate monthly income in rupees?"
          }],
          userProfile: {},
          stage: 'income'
        };
        conversationState.set(conversationKey, conversation);
      }

      // Add user message
      conversation.messages.push({
        role: 'user',
        content: message
      });

      // Generate rule-based response first
      const ruleResponse = generateRuleBasedResponse(
        message, 
        conversation.userProfile, 
        conversation.stage
      );

      // Update user profile and stage
      conversation.userProfile = { ...conversation.userProfile, ...ruleResponse.updateProfile };
      conversation.stage = ruleResponse.nextStage;


      let botResponse = ruleResponse.response;

      // Add bot response
      conversation.messages.push({
        role: 'assistant',
        content: botResponse
      });

      // Save conversation state
      conversationState.set(conversationKey, conversation);

      // Generate recommendations if ready
      let recommendations: CreditCard[] = [];
      if (conversation.stage === 'recommendations' && conversation.userProfile.monthlyIncome) {
        recommendations = await storage.getRecommendations('guest', conversation.userProfile);
      }

      res.json({
        message: botResponse,
        recommendations,
        userProfile: conversation.userProfile,
        stage: conversation.stage
      });

    } catch (error) {
      console.error("Error in chat:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  app.get('/api/chat/:sessionId/history', async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      
      // Return conversation from memory (simplified without database persistence)
      const conversation = conversationState.get(sessionId);
      const history = conversation?.messages || [];
      res.json(history);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });

  // Recommendations route
  app.post('/api/recommendations', async (req: any, res) => {
    try {
      const preferences = req.body;
      
      const recommendations = await storage.getRecommendations('guest', preferences);
      res.json(recommendations);
    } catch (error) {
      console.error("Error getting recommendations:", error);
      res.status(500).json({ message: "Failed to get recommendations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
