import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, X } from "lucide-react";
import type { CreditCard } from "@shared/schema";

interface CardModalProps {
  card: CreditCard;
  isOpen: boolean;
  onClose: () => void;
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

export default function CardModal({ card, isOpen, onClose }: CardModalProps) {

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return num === 0 ? '₹0' : `₹${num.toLocaleString('en-IN')}`;
  };

  const getCardGradient = () => {
    const hash = card.name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return cardGradients[hash % cardGradients.length];
  };

  const openApplyLink = () => {
    if (card.applyLink) {
      window.open(card.applyLink, '_blank', 'noopener,noreferrer');
    }
  };

  const specialPerks = Array.isArray(card.specialPerks) ? card.specialPerks : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-white border-b pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {card.name}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
          {/* Left Column - Card Visual & Benefits */}
          <div>
            {/* Card Visual */}
            <div className={`bg-gradient-to-r ${getCardGradient()} h-48 rounded-xl relative mb-6`}>
              <div className="absolute inset-0 bg-black bg-opacity-20 rounded-xl"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <div className="text-2xl font-bold">{card.name}</div>
                <div className="text-lg opacity-90">{card.issuer}</div>
              </div>
              <div className="absolute top-6 right-6">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {card.cardType.charAt(0).toUpperCase() + card.cardType.slice(1)}
                </Badge>
              </div>
            </div>

            {/* Key Benefits */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Key Benefits</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Reward Type:</span>
                    <span className="font-medium">{card.rewardType}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Reward Rate:</span>
                    <span className="font-medium text-secondary">{card.rewardRate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Special Perks */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Special Perks</h4>
                <div className="flex flex-wrap gap-2">
                  {specialPerks.map((perk, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {perk}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details & Actions */}
          <div>
            <div className="space-y-6">
              {/* Card Information */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Card Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Joining Fee:</span>
                      <span className="font-medium">{formatCurrency(card.joiningFee)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Annual Fee:</span>
                      <span className="font-medium">{formatCurrency(card.annualFee)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Reward Type:</span>
                      <span className="font-medium">{card.rewardType}</span>
                    </div>
                    {card.minCreditScore && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Min Credit Score:</span>
                        <span className="font-medium">{card.minCreditScore}+</span>
                      </div>
                    )}
                    {card.minIncome && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Min Income:</span>
                        <span className="font-medium">{formatCurrency(card.minIncome)}/month</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Eligibility Criteria */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Eligibility Criteria</h4>
                  <p className="text-sm text-gray-600">{card.eligibilityCriteria}</p>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  onClick={openApplyLink}
                  disabled={!card.applyLink}
                  className="w-full bg-primary hover:bg-blue-700"
                  size="lg"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Apply Now
                </Button>
                


                {card.affiliateLink && (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => window.open(card.affiliateLink!, '_blank', 'noopener,noreferrer')}
                  >
                    Learn More
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
