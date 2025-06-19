import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Bot, Heart, Search } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold text-gray-900">CardWise</h1>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-primary hover:bg-blue-700"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Find Your Perfect
            <span className="text-primary block">Credit Card</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Get AI-powered recommendations tailored to your spending habits, income, and lifestyle. 
            Compare the best Indian credit cards and make informed decisions.
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            className="bg-primary hover:bg-blue-700 text-lg px-8 py-4"
          >
            Get Started for Free
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>AI-Powered Advisor</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Our intelligent chat advisor asks the right questions to understand your needs 
                and recommends the best cards for your lifestyle.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle>Smart Browse & Filter</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Browse through 25+ Indian credit cards with advanced filters by issuer, 
                card type, rewards, and annual fees.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Save Favorites</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Save your favorite cards, compare features side-by-side, and keep track 
                of cards that match your preferences.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Find Your Ideal Credit Card?
          </h2>
          <p className="text-gray-600 mb-6">
            Join thousands of users who have found their perfect credit card match with CardWise.
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            className="bg-primary hover:bg-blue-700 text-lg px-8 py-4"
          >
            Start Your Search Now
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2025 CardWise. Your trusted credit card advisor.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
