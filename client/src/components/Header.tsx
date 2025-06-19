import { CreditCard, Grid3X3, MessageCircle } from "lucide-react";

interface HeaderProps {
  activeTab: 'browse' | 'chat';
  setActiveTab: (tab: 'browse' | 'chat') => void;
}

export default function Header({ activeTab, setActiveTab }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold text-gray-900">CardWise</h1>
            </div>
            <nav className="hidden md:flex space-x-8 ml-8">
              <button
                onClick={() => setActiveTab('browse')}
                className={`font-medium px-1 py-2 border-b-2 transition-colors ${
                  activeTab === 'browse'
                    ? 'text-primary border-primary'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                Browse Cards
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`font-medium px-1 py-2 border-b-2 transition-colors ${
                  activeTab === 'chat'
                    ? 'text-primary border-primary'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                AI Advisor
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <nav className="flex justify-around py-2">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'browse'
                ? 'text-primary bg-blue-50'
                : 'text-gray-500'
            }`}
          >
            <Grid3X3 className="h-5 w-5 mx-auto mb-1" />
            Browse
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'chat'
                ? 'text-primary bg-blue-50'
                : 'text-gray-500'
            }`}
          >
            <MessageCircle className="h-5 w-5 mx-auto mb-1" />
            AI Advisor
          </button>
        </nav>
      </div>
    </header>
  );
}
