import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scale, ExternalLink } from "lucide-react";
import CardModal from "@/components/CardModal";
import type { CreditCard } from "@shared/schema";

interface CreditCardGridProps {
  cards: CreditCard[];
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

export default function CreditCardGrid({ cards }: CreditCardGridProps) {
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);



  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return num === 0 ? '₹0' : `₹${num.toLocaleString('en-IN')}`;
  };

  const getCardGradient = (index: number) => {
    return cardGradients[index % cardGradients.length];
  };

  const openApplyLink = (url: string | null, e: React.MouseEvent) => {
    e.stopPropagation();
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {cards.map((card, index) => {
          const specialPerks = Array.isArray(card.specialPerks) ? card.specialPerks : [];

          return (
            <Card 
              key={card.id} 
              className="hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer"
              onClick={() => setSelectedCard(card)}
            >
              <div className={`bg-gradient-to-r ${getCardGradient(index)} h-32 relative`}>
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="text-lg font-bold">{card.name}</div>
                  <div className="text-sm opacity-90">{card.issuer}</div>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Annual Fee</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(card.annualFee)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Reward Rate</span>
                    <span className="font-semibold text-secondary">
                      {card.rewardRate}
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="text-sm text-gray-600 mb-2">Special Perks</div>
                    <div className="flex flex-wrap gap-1">
                      {specialPerks.slice(0, 2).map((perk, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {perk}
                        </Badge>
                      ))}
                      {specialPerks.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{specialPerks.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <Button 
                    className="flex-1 bg-primary hover:bg-blue-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCard(card);
                    }}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={(e) => openApplyLink(card.applyLink, e)}
                    title="Apply Now"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedCard && (
        <CardModal 
          card={selectedCard} 
          isOpen={!!selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </>
  );
}
