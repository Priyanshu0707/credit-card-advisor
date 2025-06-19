import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, Send, User, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { apiRequest } from "@/lib/queryClient";
import type { CreditCard } from "@shared/schema";

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface Recommendation {
  card: CreditCard;
  matchPercentage: number;
  reason: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: "Hi! I'm your AI credit card advisor. I'll ask you a few questions to recommend the best cards for your needs. Let's start - what's your approximate monthly income?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const [progress, setProgress] = useState(20);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', '/api/chat', {
        message,
        sessionId
      });
      return response.json();
    },
    onMutate: async (message) => {
      // Add user message immediately
      const userMessage: ChatMessage = {
        id: `user_${Date.now()}`,
        content: message,
        isUser: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      setInputMessage("");
      setIsTyping(true);
    },
    onSuccess: (data) => {
      setIsTyping(false);
      
      // Add bot response
      const botMessage: ChatMessage = {
        id: `bot_${Date.now()}`,
        content: data.message,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);

      // Update recommendations if available
      if (data.recommendations && data.recommendations.length > 0) {
        const formattedRecommendations: Recommendation[] = data.recommendations.map((card: CreditCard, index: number) => ({
          card,
          matchPercentage: Math.max(85 - (index * 5), 70), // Simple scoring
          reason: getRecommendationReason(card)
        }));
        setRecommendations(formattedRecommendations);
      }

      // Update progress
      if (data.stage) {
        switch (data.stage) {
          case 'income':
            setProgress(40);
            break;
          case 'spending':
            setProgress(60);
            break;
          case 'credit_score':
            setProgress(80);
            break;
          case 'recommendations':
            setProgress(100);
            break;
        }
      }
    },
    onError: (error) => {
      setIsTyping(false);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getRecommendationReason = (card: CreditCard): string => {
    if (card.cardType === 'dining') {
      return `Perfect for dining rewards with ${card.rewardRate}`;
    } else if (card.cardType === 'travel') {
      return `Excellent for travel benefits and rewards`;
    } else if (card.cardType === 'cashback') {
      return `Great cashback rates for your spending pattern`;
    } else if (card.annualFee === '0') {
      return `Zero annual fee with good rewards`;
    }
    return `Matches your income and spending requirements`;
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(inputMessage.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickResponses = [
    "₹25,000-50,000",
    "₹50,000-75,000", 
    "₹75,000+",
    "Dining & Travel",
    "Online Shopping",
    "Above 750 credit score"
  ];

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return num === 0 ? '₹0' : `₹${num.toLocaleString('en-IN')}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-200px)]">
      {/* Chat Messages Area */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
        <CardHeader className="border-b border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Credit Card Advisor</h3>
              <p className="text-sm text-gray-500">I'll help you find the perfect credit card</p>
            </div>
          </div>
        </CardHeader>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: 'calc(100vh - 400px)' }}>
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex items-start space-x-3 ${message.isUser ? 'justify-end' : ''}`}
            >
              {!message.isUser && (
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="bg-primary text-white text-xs">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div className={`rounded-lg p-3 max-w-xs ${
                message.isUser 
                  ? 'bg-primary text-white rounded-tr-none' 
                  : 'bg-gray-100 text-gray-800 rounded-tl-none'
              }`}>
                <p className="text-sm">{message.content}</p>
                <div className={`text-xs mt-1 ${
                  message.isUser ? 'text-blue-200' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {message.isUser && (
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="bg-gray-600 text-white text-xs">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start space-x-3">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="bg-primary text-white text-xs">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-gray-100 rounded-lg rounded-tl-none p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-2 mb-2">
            <Input
              type="text"
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sendMessageMutation.isPending}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={sendMessageMutation.isPending || !inputMessage.trim()}
              className="bg-primary hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Quick Response Buttons */}
          <div className="flex flex-wrap gap-2">
            {quickResponses.map((response, index) => (
              <Button
                key={index}
                variant="secondary"
                size="sm"
                onClick={() => setInputMessage(response)}
                className="text-xs"
              >
                {response}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Current Recommendations</h3>
        
        <div className="space-y-4 mb-6">
          {recommendations.length > 0 ? (
            recommendations.map((rec, index) => (
              <Card key={rec.card.id} className="border hover:border-primary transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{rec.card.name}</h4>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">{rec.matchPercentage}% Match</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{rec.reason}</p>
                  <div className="flex justify-between text-xs text-gray-500 mb-3">
                    <span>{formatCurrency(rec.card.annualFee)} Annual Fee</span>
                    <span>{rec.card.rewardRate}</span>
                  </div>
                  <Button size="sm" className="w-full bg-primary hover:bg-blue-700">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Bot className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Chat with me to get personalized recommendations!</p>
            </div>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Assessment Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-500" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {progress < 100 
              ? `${Math.ceil((100 - progress) / 20)} more questions to get better recommendations`
              : "Assessment complete! Check your recommendations above."
            }
          </p>
        </div>
      </div>
    </div>
  );
}
