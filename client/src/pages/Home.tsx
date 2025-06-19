import { useState } from "react";
import Header from "@/components/Header";
import BrowseCards from "@/components/BrowseCards";
import ChatInterface from "@/components/ChatInterface";

export default function Home() {
  const [activeTab, setActiveTab] = useState<'browse' | 'chat'>('browse');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'browse' && <BrowseCards />}
        {activeTab === 'chat' && <ChatInterface />}
      </main>
    </div>
  );
}
