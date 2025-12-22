import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useCreateSession } from "@/hooks/use-sessions";
import { Button } from "@/components/Button";
import { Pause, Play, StopCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Default intentions list
const DEFAULT_INTENTIONS = [
  "Seeking Knowledge",
  "Halal Provision",
  "Ihsan (Excellence)",
  "Silent Reflection",
];

interface FocusPageState {
  niyyah: string;
  startTime: Date;
  seconds: number;
  isActive: boolean;
}

export default function Focus() {
  const [location, setLocation] = useLocation();
  
  // Get niyyah from location state with fallback
  const searchParams = new URLSearchParams(window.location.search);
  const niyyahParam = searchParams.get("niyyah");
  
  // Validate niyyah is from known list
  const validNiyyah = niyyahParam && 
    (DEFAULT_INTENTIONS.includes(decodeURIComponent(niyyahParam)) || 
     niyyahParam.length > 0)
    ? decodeURIComponent(niyyahParam)
    : DEFAULT_INTENTIONS[0];
  
  const [niyyah] = useState<string>(validNiyyah);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [startTime] = useState(new Date());

  const { mutate: saveSession, isPending } = useCreateSession();

  // Warn user before leaving with active session
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isActive && seconds > 0) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isActive, seconds]);

  // Handle back navigation with confirmation
  const handleBack = () => {
    if (isActive && seconds > 0) {
      const confirmed = window.confirm(
        'You have an active session. Are you sure you want to leave? Your progress will not be saved.'
      );
      if (!confirmed) return;
    }
    setLocation('/');
  };

  useEffect(() => {
    // Only set up interval if active
    if (!isActive) {
      return;
    }

    // Set up interval for active state
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    // Proper cleanup: interval is always defined when we reach this point
    return () => {
      clearInterval(interval);
    };
  }, [isActive]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFinish = async () => {
    setIsActive(false);
    
    // Save to DB
    saveSession({
      niyyah,
      startTime: startTime,
      endTime: new Date(),
      durationSeconds: seconds,
      date: format(new Date(), 'yyyy-MM-dd'),
    }, {
      onSuccess: () => {
        setLocation('/history');
      },
      onError: (error) => {
        // Reset state if save fails, allow user to retry
        setIsActive(true);
        alert(`Failed to save session: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  };

  return (
    <motion.div 
      className="min-h-screen bg-background flex flex-col items-center justify-between p-8 animate-fade-in relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      
      {/* Subtle Background Animation */}
      <motion.div
        className={cn(
          "absolute inset-0 bg-primary/5 transition-opacity duration-1000",
          isActive ? "opacity-100" : "opacity-30"
        )}
        animate={{ 
          background: isActive 
            ? "radial-gradient(circle at center, rgba(157, 193, 131, 0.1) 0%, transparent 70%)"
            : "radial-gradient(circle at center, rgba(157, 193, 131, 0.05) 0%, transparent 70%)"
        }}
        transition={{ duration: 1 }}
      />
      
      {/* Back Button */}
      <motion.div 
        className="z-10 absolute top-6 left-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <button
          onClick={handleBack}
          className="p-3 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-white/50 backdrop-blur-sm"
          title="Back to home"
        >
          ← Back
        </button>
      </motion.div>

      {/* Header Info */}
      <motion.div 
        className="z-10 w-full text-center mt-12 space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <p className="text-sm uppercase tracking-widest text-muted-foreground">Current Intention</p>
        <h2 className="text-2xl md:text-3xl font-serif text-foreground/80 italic">
          "{niyyah}"
        </h2>
      </motion.div>

      {/* Main Timer */}
      <motion.div 
        className="z-10 flex flex-col items-center justify-center flex-1"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8, type: "spring", stiffness: 100 }}
      >
        <motion.div 
          className="text-[5rem] md:text-[8rem] font-mono font-light text-foreground tabular-nums leading-none tracking-tight"
          key={seconds} // Re-animate on each second
          initial={{ scale: 0.95, opacity: 0.9 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {formatTime(seconds)}
        </motion.div>
        <motion.p 
          className="text-muted-foreground mt-4 font-light"
          animate={{ opacity: isActive ? 1 : 0.6 }}
          transition={{ duration: 0.3 }}
        >
          {isActive ? "Focusing..." : "Paused"}
        </motion.p>
      </motion.div>

      {/* Controls */}
      <motion.div 
        className="z-10 w-full max-w-sm grid grid-cols-2 gap-4 mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="secondary"
            size="lg"
            className="w-full h-20 rounded-2xl flex flex-col gap-2 shadow-lg hover:shadow-xl transition-all duration-300 focus:ring-2 focus:ring-secondary/50 focus:ring-offset-2"
            onClick={() => setIsActive(!isActive)}
            disabled={isPending}
            aria-label={isActive ? "Pause the focus session" : "Resume the focus session"}
          >
            <motion.div
              animate={isActive ? { rotate: 0 } : { rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </motion.div>
            <span className="text-xs font-normal uppercase tracking-wider">
              {isActive ? "Pause" : "Resume"}
            </span>
          </Button>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="primary"
            size="lg"
            className="w-full h-20 rounded-2xl flex flex-col gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
            onClick={handleFinish}
            disabled={isPending || seconds === 0}
            aria-label="Finish and save the focus session"
          >
            <StopCircle className="w-6 h-6" />
            <span className="text-xs font-normal uppercase tracking-wider">
              {isPending ? "Saving..." : "Finish"}
            </span>
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
