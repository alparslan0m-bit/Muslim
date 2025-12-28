import { useState, useEffect } from "react";
import { Button } from "@/components/Button";
import { Pause, Play, StopCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useCreateSession } from "@/hooks/use-sessions";
import { format } from "date-fns";

interface FocusStackProps {
  onBackToHome: () => void;
  isVisible: boolean;
}

export default function FocusStack({ onBackToHome, isVisible }: FocusStackProps) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [accumulatedTime, setAccumulatedTime] = useState(0);
  const [lastResumeTime, setLastResumeTime] = useState<Date | null>(null);

  const { mutate: saveSession, isPending } = useCreateSession();

  const resetSession = () => {
    setSeconds(0);
    setAccumulatedTime(0);
    setLastResumeTime(null);
    setStartTime(new Date());
    setIsActive(false);
  };

  const handleTogglePause = () => {
    if (isActive) {
      // Pausing
      if (lastResumeTime) {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - lastResumeTime.getTime()) / 1000);
        setAccumulatedTime(prev => prev + elapsed);
      }
      setLastResumeTime(null);
      setIsActive(false);
    } else {
      // Resuming
      setLastResumeTime(new Date());
      setIsActive(true);
    }
  };

  const handleFinish = async () => {
    setIsActive(false);

    // Calculate final accurate seconds
    let finalSeconds = accumulatedTime;
    if (lastResumeTime) {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - lastResumeTime.getTime()) / 1000);
      finalSeconds = accumulatedTime + elapsed;
    }

    saveSession({
      startTime: startTime,
      endTime: new Date(),
      durationSeconds: finalSeconds,
      date: format(new Date(), 'yyyy-MM-dd'),
    }, {
      onSuccess: () => {
        // Celebration animation
        const timerElement = document.querySelector('.timer-display');
        if (timerElement) {
          timerElement.animate([
            { transform: 'scale(1)' },
            { transform: 'scale(1.1)' },
            { transform: 'scale(1)' }
          ], {
            duration: 600,
            easing: 'ease-out'
          });
        }
        // Short delay to let animation play before resetting
        setTimeout(() => {
          resetSession();
          onBackToHome();
        }, 600);
      },
      onError: (error) => {
        setIsActive(true);
        alert(`Failed to save session: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  };

  // Timer effect
  useEffect(() => {
    if (!isActive || !lastResumeTime) return;

    const calculate = () => {
      const now = new Date();
      const elapsedSinceResume = Math.floor((now.getTime() - lastResumeTime.getTime()) / 1000);
      setSeconds(accumulatedTime + elapsedSinceResume);
    };

    // Calculate immediately when this effect runs (e.g., when returning to app)
    calculate();

    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [isActive, lastResumeTime, accumulatedTime, isVisible]);

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
      className="min-h-screen bg-background flex flex-col items-center justify-between p-6 pt-12 pb-32 relative overflow-hidden"
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
          background: [
            "radial-gradient(circle at 30% 30%, rgba(157, 193, 131, 0.1) 0%, transparent 70%)",
            "radial-gradient(circle at 70% 70%, rgba(157, 193, 131, 0.15) 0%, transparent 70%)",
            "radial-gradient(circle at 30% 30%, rgba(157, 193, 131, 0.1) 0%, transparent 70%)"
          ]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
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
              resetSession();
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
        className="z-10 flex flex-col items-center justify-center flex-1 relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8, type: "spring", stiffness: 100 }}
      >
        {/* Circular Progress Ring */}
        <div className="relative w-80 h-80 md:w-96 md:h-96 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-muted-foreground/20"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              className="text-primary"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: seconds > 0 ? Math.min(seconds / 3600, 1) : 0 }} // Example: fill based on hours, max 1 hour
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </svg>
          
          <motion.div 
            className="timer-display text-[5rem] md:text-[8rem] font-mono font-light text-foreground tabular-nums leading-none tracking-tight"
            key={seconds}
            initial={{ scale: 0.95, opacity: 0.9 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {formatTime(seconds)}
          </motion.div>
        </div>
        <motion.p 
          className="text-muted-foreground mt-4 font-light"
          animate={{ opacity: isActive ? 1 : 0.6 }}
          transition={{ duration: 0.3 }}
        >
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            {seconds === 0 && !isActive ? "Ready" : isActive ? "Focusing" : "Paused"}
          </span>
        </motion.p>
      </motion.div>

      {/* Controls */}
      {!isActive && seconds === 0 ? (
        <motion.div 
          className="z-10 w-full max-w-sm"
          layout
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="primary"
              size="lg"
              className="w-full h-24 rounded-2xl flex flex-col justify-center items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
              onClick={() => {
                setAccumulatedTime(0);
                setLastResumeTime(new Date());
                setStartTime(new Date());
                setIsActive(true);
                setSeconds(0);
              }}
            >
              <Play className="w-8 h-8" />
              <span className="text-sm font-normal uppercase tracking-wider">
                Start Focus
              </span>
            </Button>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div 
          className="z-10 w-full max-w-sm grid grid-cols-2 gap-4 mb-8"
          layout
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
              onClick={handleTogglePause}
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
      )}
    </motion.div>
  );
}