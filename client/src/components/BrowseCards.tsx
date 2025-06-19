import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, Loader2 } from "lucide-react";
import CreditCardGrid from "@/components/CreditCardGrid";
import type { CreditCard } from "@shared/schema";

export default function BrowseCards() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [issuer, setIssuer] = useState("All Issuers");
  const [cardType, setCardType] = useState("All Types");
  const [sortBy, setSortBy] = useState("Sort by Popularity");
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const limit = 12;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['/api/cards', { page, search, issuer, cardType, sortBy, limit }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(issuer !== "All Issuers" && { issuer }),
        ...(cardType !== "All Types" && { cardType }),
        ...(sortBy !== "Sort by Popularity" && { sortBy }),
      });

      const response = await fetch(`/api/cards?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch cards');
      }
      return response.json() as Promise<{ cards: CreditCard[], total: number }>;
    },
  });

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      refetch();
    }, 500);

    return () => clearTimeout(timer);
  }, [search, issuer, cardType, sortBy, refetch]);

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    setPage(prev => prev + 1);
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      setIsLoadingMore(false);
    }, 1000);
  };

  const hasMoreCards = data ? (page * limit) < data.total : false;

  return (
    <div>
      {/* Search and Filter Section */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search credit cards..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Select value={issuer} onValueChange={setIssuer}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Issuers">All Issuers</SelectItem>
                  <SelectItem value="HDFC Bank">HDFC Bank</SelectItem>
                  <SelectItem value="ICICI Bank">ICICI Bank</SelectItem>
                  <SelectItem value="SBI Card">SBI Card</SelectItem>
                  <SelectItem value="Axis Bank">Axis Bank</SelectItem>
                  <SelectItem value="Kotak Bank">Kotak Bank</SelectItem>
                  <SelectItem value="YES Bank">YES Bank</SelectItem>
                  <SelectItem value="Standard Chartered">Standard Chartered</SelectItem>
                  <SelectItem value="American Express">American Express</SelectItem>
                </SelectContent>
              </Select>

              <Select value={cardType} onValueChange={setCardType}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Types">All Types</SelectItem>
                  <SelectItem value="Cashback">Cashback</SelectItem>
                  <SelectItem value="Travel">Travel</SelectItem>
                  <SelectItem value="Dining">Dining</SelectItem>
                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                  <SelectItem value="Fuel">Fuel</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sort by Popularity">Sort by Popularity</SelectItem>
                  <SelectItem value="Lowest Annual Fee">Lowest Annual Fee</SelectItem>
                  <SelectItem value="Highest Cashback">Highest Cashback</SelectItem>
                  <SelectItem value="Best for Travel">Best for Travel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="bg-gray-300 h-32 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <CreditCardGrid cards={data?.cards || []} />
          
          {/* Load More Section */}
          <div className="flex justify-center mt-8">
            {isLoadingMore ? (
              <div className="flex items-center space-x-2 text-gray-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading more cards...</span>
              </div>
            ) : hasMoreCards ? (
              <Button
                onClick={handleLoadMore}
                variant="outline"
                size="lg"
                className="border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300"
              >
                <Plus className="h-4 w-4 mr-2" />
                Load More Cards
              </Button>
            ) : (
              data?.cards && data.cards.length > 0 && (
                <div className="text-center text-gray-500">
                  <p>No more cards to load</p>
                </div>
              )
            )}
          </div>
        </>
      )}

      {/* Empty State */}
      {!isLoading && (!data?.cards || data.cards.length === 0) && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No cards found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}
