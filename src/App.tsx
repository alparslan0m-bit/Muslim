import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/Navigation";
import { View } from "@/components/View";
import { InstallPrompt } from "@/components/InstallPrompt";
import { NetworkStatus } from "@/components/NetworkStatus";
import { PWASplashScreen } from "@/components/PWASplashScreen";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "./lib/queryClient";

// Import pages directly (no lazy loading for state-driven architecture)
import Home from "@/pages/Home";
import FocusStack from "@/pages/FocusStack";
import History from "@/pages/History";

function AppContent() {
  const [activeTab, setActiveTab] = useState<'home' | 'focus' | 'history'>('home');

  const handleTabChange = (tab: 'home' | 'focus' | 'history') => {
    setActiveTab(tab);
  };

  const handleBackToHome = () => {
    setActiveTab('home');
  };

  return (
    <div className="min-h-screen bg-background">
      <PWASplashScreen />
      <Toaster />

      <View isActive={activeTab === 'home'}>
        <Home onNavigate={handleTabChange} /> {/* ✅ Pass the handler */}
      </View>

      <View isActive={activeTab === 'focus'}>
        <FocusStack onBackToHome={handleBackToHome} isVisible={activeTab === 'focus'} />
      </View>

      <View isActive={activeTab === 'history'}>
        <History onBackToHome={handleBackToHome} onTabChange={handleTabChange} />
      </View>

      <Navigation activeTab={activeTab} onTabChange={handleTabChange} />
      <InstallPrompt />
      <NetworkStatus />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
