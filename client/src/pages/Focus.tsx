import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useCreateSession } from "@/hooks/use-sessions";
import { Button } from "@/components/Button";
import { Pause, Play, StopCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function Focus() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const niyyah = searchParams.get("niyyah") || "Focus Session";
  
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [startTime] = useState(new Date());

  const { mutate: saveSession, isPending } = useCreateSession();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
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
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-between p-8 animate-fade-in relative overflow-hidden">
      
      {/* Subtle Background Animation */}
      <div className={cn(
        "absolute inset-0 bg-primary/5 transition-opacity duration-1000",
        isActive ? "opacity-100" : "opacity-30"
      )} />
      
      {/* Header Info */}
      <div className="z-10 w-full text-center mt-12 space-y-2">
        <p className="text-sm uppercase tracking-widest text-muted-foreground">Current Intention</p>
        <h2 className="text-2xl md:text-3xl font-serif text-foreground/80 italic">
          "{niyyah}"
        </h2>
      </div>

      {/* Main Timer */}
      <div className="z-10 flex flex-col items-center justify-center flex-1">
        <div className="text-[5rem] md:text-[8rem] font-mono font-light text-foreground tabular-nums leading-none tracking-tight">
          {formatTime(seconds)}
        </div>
        <p className="text-muted-foreground mt-4 animate-pulse font-light">
          {isActive ? "Focusing..." : "Paused"}
        </p>
      </div>

      {/* Controls */}
      <div className="z-10 w-full max-w-sm grid grid-cols-2 gap-4 mb-8">
        <Button
          variant="secondary"
          size="lg"
          className="w-full h-20 rounded-2xl flex flex-col gap-2"
          onClick={() => setIsActive(!isActive)}
        >
          {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          <span className="text-xs font-normal uppercase tracking-wider">
            {isActive ? "Pause" : "Resume"}
          </span>
        </Button>

        <Button
          variant="primary"
          size="lg"
          className="w-full h-20 rounded-2xl flex flex-col gap-2 bg-slate-800 text-white hover:bg-slate-700 shadow-xl"
          onClick={handleFinish}
          disabled={isPending}
        >
          {isPending ? (
            <div className="animate-spin w-6 h-6 border-2 border-white/30 border-t-white rounded-full" />
          ) : (
            <StopCircle className="w-6 h-6" />
          )}
          <span className="text-xs font-normal uppercase tracking-wider">
            {isPending ? "Saving..." : "End Session"}
          </span>
        </Button>
      </div>
    </div>
  );
}
