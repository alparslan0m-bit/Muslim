import { useState } from "react";
import { Button } from "@/components/Button";
import { ArrowLeft, BookOpen, Briefcase, Heart, Moon, Pause, Play, StopCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateSession } from "@/hooks/use-sessions";
import { format } from "date-fns";

const INTENTIONS = [
  {
    id: "knowledge",
    title: "Seeking Knowledge",
    description: "To benefit myself and the Ummah",
    icon: BookOpen,
    color: "bg-primary/10 text-primary border-primary/20",
  },
  {
    id: "provision",
    title: "Halal Provision",
    description: "Working to sustain my family",
    icon: Briefcase,
    color: "bg-primary/10 text-primary border-primary/20",
  },
  {
    id: "ihsan",
    title: "Ihsan (Excellence)",
    description: "Perfecting my craft as worship",
    icon: Heart,
    color: "bg-primary/10 text-primary border-primary/20",
  },
  {
    id: "reflection",
    title: "Silent Reflection",
    description: "Quiet contemplation and peace",
    icon: Moon,
    color: "bg-primary/10 text-primary border-primary/20",
  },
];

type View = 'intention' | 'timer';

interface FocusStackProps {
  onBackToHome: () => void;
}

export default function FocusStack({ onBackToHome }: FocusStackProps) {
  const [view, setView] = useState<View>('intention');
  const [selectedIntention, setSelectedIntention] = useState<string | null>(null);
  const [niyyah, setNiyyah] = useState<string>("");
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [startTime] = useState(new Date());

  const { mutate: saveSession, isPending } = useCreateSession();

  const handleStart = () => {
    if (selectedIntention) {
      const intention = INTENTIONS.find(i => i.id === selectedIntention);
      setNiyyah(intention?.title || "");
      setView('timer');
    }
  };

  const handleBack = () => {
    if (view === 'timer' && isActive && seconds > 0) {
      const confirmed = window.confirm(
        'You have an active session. Are you sure you want to leave? Your progress will not be saved.'
      );
      if (!confirmed) return;
    }
    if (view === 'intention') {
      onBackToHome();
    } else {
      setView('intention');
    }
  };

  const handleFinish = async () => {
    setIsActive(false);

    saveSession({
      niyyah,
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
  useState(() => {
    if (!isActive || view !== 'timer') return;

    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    return () => clearInterval(interval);
  });

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
    <AnimatePresence mode="wait" initial={false}>
      {view === 'intention' && (
        <motion.div
          key="intention"
          className="min-h-screen bg-background flex flex-col p-6 pb-40 max-w-md mx-auto"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          {/* Header */}
          <motion.div
            className="flex items-center mb-8 pt-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <button
              onClick={handleBack}
              className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-white/50"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          </motion.div>

          <motion.div
            className="mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h1 className="text-3xl font-serif text-foreground mb-3">Set Your Niyyah</h1>
            <p className="text-muted-foreground text-lg font-light leading-relaxed">
              "Actions are dependent upon their intentions." <br />
              <span className="text-sm opacity-60">— Sahih al-Bukhari</span>
            </p>
          </motion.div>

          {/* Options */}
          <motion.div
            className="grid gap-4 flex-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            {INTENTIONS.map((item, index) => {
              const isSelected = selectedIntention === item.id;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => setSelectedIntention(item.id)}
                  className={cn(
                    "group relative flex items-center p-5 rounded-2xl border-2 text-left transition-all duration-300",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/10 dark:bg-primary/10"
                      : "border-transparent bg-white hover:bg-white/60 hover:border-border shadow-sm hover:shadow-md dark:bg-card dark:hover:bg-accent/50 dark:hover:border-border"
                  )}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className={cn(
                      "p-3 rounded-xl mr-4 transition-colors",
                      item.color,
                      isSelected ? "bg-primary text-primary-foreground" : ""
                    )}
                    animate={isSelected ? { rotate: [0, -10, 10, 0] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <item.icon className="w-6 h-6" />
                  </motion.div>
                  <div>
                    <h3 className={cn("font-medium text-lg", isSelected ? "text-primary-800" : "text-foreground")}>
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground/80 mt-0.5">{item.description}</p>
                  </div>

                  {isSelected && (
                    <motion.div
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </motion.div>

          {/* Footer */}
          <motion.div
            className="mt-8 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <motion.div
              whileHover={{ scale: selectedIntention ? 1.02 : 1 }}
              whileTap={{ scale: selectedIntention ? 0.98 : 1 }}
            >
              <Button
                onClick={handleStart}
                disabled={!selectedIntention}
                size="lg"
                className="w-full text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                Begin Session
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {view === 'timer' && (
        <motion.div
          key="timer"
          className="min-h-screen bg-background flex flex-col items-center justify-between p-8 relative overflow-hidden"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
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
              title="Back to intention"
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
      )}
    </AnimatePresence>
  );
}