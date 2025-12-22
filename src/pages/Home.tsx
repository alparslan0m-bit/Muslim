import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { usePrayerTimes } from "@/hooks/use-prayer-times";
import { Button } from "@/components/Button";
import { Loader2, ArrowRight, Sun, Moon, CloudSun, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const { prayerInfo, loading, error, isUsingFallback } = usePrayerTimes();
  const [, setLocation] = useLocation();
  const [timeLeft, setTimeLeft] = useState<string>("--:--:--");

  // Format time remaining until next prayer - memoized to prevent recreation
  const formatTimeLeft = useCallback((nextPrayerTime: Date) => {
    const now = new Date();
    const diff = nextPrayerTime.getTime() - now.getTime();

    if (diff <= 0) return "Now";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    if (!prayerInfo) {
      // If no prayer info yet, show a placeholder or default time
      if (!loading) {
        setTimeLeft("--:--:--");
      }
      return;
    }

    // Update every second for smooth countdown
    const timer = setInterval(() => {
      setTimeLeft(formatTimeLeft(prayerInfo.nextPrayerTime));
    }, 1000);

    // Set initial value immediately
    setTimeLeft(formatTimeLeft(prayerInfo.nextPrayerTime));

    return () => clearInterval(timer);
  }, [prayerInfo, loading, formatTimeLeft]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-md space-y-12 flex flex-col items-center">
          {/* Header Skeleton */}
          <div className="space-y-4 flex flex-col items-center w-full animate-pulse">
            <div className="h-4 w-32 bg-muted rounded-full" />
            <div className="h-10 w-48 bg-muted rounded-lg" />
          </div>

          {/* Timer Skeleton - Premium Ring */}
          <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full border-4 border-muted/30 flex items-center justify-center">
            <div className="w-full h-full rounded-full border-t-4 border-primary/50 animate-spin absolute" style={{ animationDuration: '3s' }} />
            <div className="h-16 w-32 bg-muted rounded-lg animate-pulse" />
          </div>

          {/* Button Skeleton */}
          <div className="w-full space-y-4">
            <div className="h-14 w-full bg-muted rounded-xl animate-pulse" />
            <div className="h-3 w-48 bg-muted rounded-full mx-auto animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const handleRetry = () => {
      window.location.reload();
    };

    const handleSkipLocation = () => {
      // Force reload to trigger location request again, but this time it might work
      // Or we could implement a manual city selection here
      window.location.reload();
    };

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-sm w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <RefreshCw className="w-10 h-10 text-destructive" />
          </motion.div>

          <motion.h2
            className="text-2xl font-serif text-destructive mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Location Access Required
          </motion.h2>

          <motion.p
            className="text-muted-foreground mb-6 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            {error}
          </motion.p>

          <motion.p
            className="text-sm text-muted-foreground/80 max-w-xs mb-8 mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            This app requires location access to calculate accurate prayer times for your area.
          </motion.p>

          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <Button
              onClick={handleRetry}
              className="w-full flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>

            <Button
              onClick={handleSkipLocation}
              variant="outline"
              className="w-full"
            >
              Continue with Default Location
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Prayer Time Overlay
  if (prayerInfo?.isPrayerTimeNow) {
    return (
      <motion.div
        className="min-h-screen flex flex-col items-center justify-center bg-primary text-primary-foreground p-6 text-center relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Animated background elements */}
        <motion.div
          className="absolute inset-0 opacity-10"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/20 rounded-full blur-xl" />
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-white/20 rounded-full blur-xl" />
        </motion.div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8, type: "spring", stiffness: 100 }}
        >
          <CloudSun className="w-20 h-20 mb-8 opacity-90 animate-breathe" />
        </motion.div>

        <motion.h1
          className="text-5xl md:text-6xl font-serif mb-6"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Time for Salah
        </motion.h1>

        <motion.p
          className="text-xl opacity-90 font-light leading-relaxed max-w-md"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          Disconnect to reconnect with your Creator.
        </motion.p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col bg-background relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Decorative Background Elements */}
      <motion.div
        className="absolute top-[-10%] right-[-10%] w-[50vh] h-[50vh] bg-primary/5 rounded-full blur-3xl -z-10"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-[-10%] left-[-10%] w-[40vh] h-[40vh] bg-accent/20 rounded-full blur-3xl -z-10"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 pb-24 max-w-md mx-auto w-full">

        {/* Fallback Location Indicator */}
        {isUsingFallback && (
          <motion.div
            className="mb-6 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs text-amber-700 font-medium">
              📍 Using default location (Mecca). <button onClick={() => window.location.reload()} className="underline hover:no-underline">Try again</button>
            </p>
          </motion.div>
        )}

        <motion.div
          className="flex flex-col items-center text-center space-y-2 mb-12"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <span className="text-sm uppercase tracking-widest text-muted-foreground font-medium">
            {prayerInfo ? "Next Prayer" : "Loading Prayer Times"}
          </span>
          <h2 className="text-3xl font-serif text-foreground">
            {prayerInfo ? prayerInfo.nextPrayerName : "Please wait..."}
          </h2>
        </motion.div>

        {/* Timer Display */}
        <motion.div
          className="relative w-56 h-56 md:w-80 md:h-80 flex items-center justify-center mb-16"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8, type: "spring", stiffness: 100 }}
        >
          <div className="absolute inset-0 border border-primary/10 rounded-full" />
          <div className="absolute inset-4 border border-primary/20 rounded-full" />

          <div className="text-center z-10 px-4">
            <motion.div
              className="text-5xl md:text-7xl font-mono font-light tracking-tight text-primary break-words"
              key={timeLeft} // Re-animate when time changes
              initial={{ scale: 0.95, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {timeLeft}
            </motion.div>
            <p className="text-sm text-muted-foreground mt-2">
              {prayerInfo ? "until Adhan" : "calculating..."}
            </p>
          </div>
        </motion.div>

        {/* Action */}
        <motion.div
          className="w-full space-y-4"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <motion.div
            whileHover={prayerInfo ? { scale: 1.02 } : {}}
            whileTap={prayerInfo ? { scale: 0.98 } : {}}
          >
            <Button
              onClick={() => setLocation('/niyyah')}
              size="lg"
              className="w-full text-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
              disabled={!prayerInfo || loading}
              aria-label="Start a new focus session with intention"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  Start Focus Session
                  <ArrowRight className="ml-2 w-5 h-5 opacity-80" />
                </>
              )}
            </Button>
          </motion.div>

          <motion.p
            className="text-xs text-center text-muted-foreground/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            {prayerInfo ? "Use this time to work with intention" : "Please wait while we calculate prayer times"}
          </motion.p>
        </motion.div>
      </main>
    </motion.div>
  );
}
