import { useState, useEffect } from "react";
import { Button } from "@/components/Button";
import { Pause, Play, StopCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useCreateSession } from "@/hooks/use-sessions";
import { format } from "date-fns";

interface FocusStackProps {
  onBackToHome: () => void;
}

export default function FocusStack({ onBackToHome }: FocusStackProps) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [startTime] = useState(new Date());

  const { mutate: saveSession, isPending } = useCreateSession();

  const handleFinish = async () => {
    setIsActive(false);

    saveSession({
      startTime: startTime,
      endTime: new Date(),
      durationSeconds: seconds,
      date: format(new Date(), 'yyyy-MM-dd'),
    }, {
      onSuccess: () => {
        onBackToHome(); // Go back to home after saving
      },
      onError: (error) => {
        setIsActive(true);
        alert(`Failed to save session: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  };

  // Timer effect
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    return () => clearInterval(interval);
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

  return (
    <motion.div 
      className="min-h-screen bg-background flex flex-col items-center justify-between p-8 relative overflow-hidden"
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
          onClick={() => {
            if (isActive && seconds > 0) {
              const confirmed = window.confirm(
                'You have an active session. Are you sure you want to leave? Your progress will not be saved.'
              );
              if (!confirmed) return;
            }
            onBackToHome();
          }}
          className="p-3 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-white/50 backdrop-blur-sm"
          title="Back to home"
        >
          ← Back
        </button>
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
          key={seconds}
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