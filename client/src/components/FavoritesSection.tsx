import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Heart, HeartOff, Scale, Grid3X3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import type { CreditCard, UserFavorite } from "@shared/schema";

interface FavoriteCardData extends UserFavorite {
  card: CreditCard;
}

const cardGradients = [
  "from-blue-600 to-purple-600",
  "from-red-600 to-orange-600", 
  "from-green-600 to-teal-600",
  "from-indigo-600 to-blue-600",
  "from-purple-600 to-pink-600",
  "from-yellow-600 to-red-600",
  "from-teal-600 to-green-600",
  "from-gray-700 to-gray-900"
];

export default function FavoritesSection() {
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: favorites, isLoading } = useQuery({
    queryKey: ['/api/favorites'],
    queryFn: async () => {
      const response = await fetch('/api/favorites');
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('401: Unauthorized');
        }
        throw new Error('Failed to fetch favorites');
      }
      return response.json() as Promise<FavoriteCardData[]>;
    },
    retry: false,
  });

  const removeFromFavoritesMutation = useMutation({
    mutationFn: async (cardId: number) => {
      await apiRequest('DELETE', `/api/favorites/${cardId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Success",
        description: "Card removed from favorites",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to remove from favorites",
        variant: "destructive",
      });
    },
  });

  // Check for unauthorized errors
  useEffect(() => {
    if (favorites === undefined && !isLoading) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [favorites, isLoading, toast]);

  const handleRemoveFromFavorites = (cardId: number) => {
    removeFromFavoritesMutation.mutate(cardId);
    setSelectedCards(prev => prev.filter(id => id !== cardId));
  };

  const handleCardSelect = (cardId: number, checked: boolean) => {
    if (checked) {
      setSelectedCards(prev => [...prev, cardId]);
    } else {
      setSelectedCards(prev => prev.filter(id => id !== cardId));
    }
  };

  const handleCompareSelected = () => {
    if (selectedCards.length < 2) {
      toast({
        title: "Selection Required",
        description: "Please select at least 2 cards to compare",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedCards.length > 4) {
      toast({
        title: "Too Many Cards",
        description: "Please select a maximum of 4 cards to compare",
        variant: "destructive",
      });
      return;
    }

    // TODO: Implement comparison modal/page
    toast({
      title: "Feature Coming Soon",
      description: `Comparison for ${selectedCards.length} cards will be available soon!`,
    });
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return num === 0 ? '₹0' : `₹${num.toLocaleString('en-IN')}`;
  };

  const getCardGradient = (index: number) => {
    return cardGradients[index % cardGradients.length];
  };

  const getBestFeature = (card: CreditCard): string => {
    if (card.cardType === 'dining') {
      return `Dining (${card.rewardRate.split(',')[0] || card.rewardRate})`;
    } else if (card.cardType === 'travel') {
      return 'Travel & Miles';
    } else if (card.cardType === 'cashback') {
      return 'Cashback';
    } else if (card.annualFee === '0') {
      return 'Zero Annual Fee';
    }
    return card.cardType.charAt(0).toUpperCase() + card.cardType.slice(1);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border rounded-xl p-4">
                  <div className="bg-gray-300 h-24 rounded-lg mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-gray-900">
            My Favorite Cards
          </CardTitle>
          <Button 
            onClick={handleCompareSelected}
            disabled={selectedCards.length < 2}
            className="bg-primary hover:bg-blue-700"
          >
            <Scale className="h-4 w-4 mr-2" />
            Compare Selected ({selectedCards.length})
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {favorites && favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite, index) => {
              const card = favorite.card;
              const isSelected = selectedCards.includes(card.id);
              
              return (
                <Card key={card.id} className="hover:border-primary transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleCardSelect(card.id, checked as boolean)}
                        />
                        <h3 className="font-semibold text-gray-900">{card.name}</h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFromFavorites(card.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        disabled={removeFromFavoritesMutation.isPending}
                      >
                        <HeartOff className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className={`bg-gradient-to-r ${getCardGradient(index)} h-24 rounded-lg mb-3 relative`}>
                      <div className="absolute bottom-2 left-3 text-white text-sm font-medium">
                        {card.name}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Annual Fee:</span>
                        <span className="font-medium">{formatCurrency(card.annualFee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Best For:</span>
                        <Badge variant="secondary" className="text-xs">
                          {getBestFeature(card)}
                        </Badge>
                      </div>
                    </div>

                    <Button className="w-full mt-3 bg-primary hover:bg-blue-700">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Favorite Cards Yet</h3>
            <p className="text-gray-500 mb-4">
              Start browsing cards and add them to your favorites to see them here
            </p>
            <Button 
              className="bg-primary hover:bg-blue-700"
              onClick={() => {
                // This would trigger a tab change in the parent component
                // For now, we'll show a message
                toast({
                  title: "Navigation",
                  description: "Switch to the Browse Cards tab to explore available cards",
                });
              }}
            >
              <Grid3X3 className="h-4 w-4 mr-2" />
              Browse Cards
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
