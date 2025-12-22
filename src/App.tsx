import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/Navigation";
import { InstallPrompt } from "@/components/InstallPrompt";
import { NetworkStatus } from "@/components/NetworkStatus";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AnimatePresence } from "framer-motion";
import { Suspense, lazy } from "react";

// Lazy load pages for better performance
const Home = lazy(() => import("@/pages/Home"));
const Niyyah = lazy(() => import("@/pages/Niyyah"));
const Focus = lazy(() => import("@/pages/Focus"));
const History = lazy(() => import("@/pages/History"));
const NotFound = lazy(() => import("@/pages/not-found"));
const Offline = lazy(() => import("@/pages/offline"));

// Loading component for lazy-loaded pages
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

function Router() {
  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait">
        <Suspense fallback={<PageLoader />}>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/niyyah" component={Niyyah} />
            <Route path="/focus" component={Focus} />
            <Route path="/history" component={History} />
            <Route path="/offline" component={Offline} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </AnimatePresence>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-background">
          <Toaster />
          <Router />
          <Navigation />
          <InstallPrompt />
          <NetworkStatus />
        </div>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
