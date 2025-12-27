import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/Navigation";
import { InstallPrompt } from "@/components/InstallPrompt";
import { NetworkStatus } from "@/components/NetworkStatus";
import { PWASplashScreen } from "@/components/PWASplashScreen";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AnimatePresence, motion } from "framer-motion";
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
  const [location] = useLocation();

  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -30, opacity: 0.5 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="min-h-screen"
        >
          <Suspense fallback={<PageLoader />}>
            <Switch location={location}>
              <Route path="/" component={Home} />
              <Route path="/niyyah" component={Niyyah} />
              <Route path="/focus" component={Focus} />
              <Route path="/history" component={History} />
              <Route path="/offline" component={Offline} />
              <Route component={NotFound} />
            </Switch>
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-background">
          <PWASplashScreen />
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
