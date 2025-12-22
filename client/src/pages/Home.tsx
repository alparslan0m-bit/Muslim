import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { usePrayerTimes } from "@/hooks/use-prayer-times";
import { Button } from "@/components/Button";
import { Loader2, ArrowRight, Sun, Moon, CloudSun } from "lucide-react";
import { formatDistanceStrict, differenceInSeconds } from "date-fns";
import { cn } from "@/lib/utils";

export default function Home() {
  const { prayerInfo, loading, error } = usePrayerTimes();
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!prayerInfo) return;

    const timer = setInterval(() => {
      const now = new Date();
      const diff = prayerInfo.nextPrayerTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft("Now");
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [prayerInfo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground font-serif">Locating...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <h2 className="text-2xl font-serif text-destructive mb-2">Location Error</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <p className="text-sm text-muted-foreground/80 max-w-xs">
          This app requires location access to calculate accurate prayer times for your area.
        </p>
      </div>
    );
  }

  // Prayer Time Overlay
  if (prayerInfo?.isPrayerTimeNow) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-primary text-primary-foreground p-6 text-center animate-fade-in">
        <CloudSun className="w-16 h-16 mb-6 opacity-90 animate-breathe" />
        <h1 className="text-4xl md:text-5xl font-serif mb-4">Time for Salah</h1>
        <p className="text-xl opacity-90 font-light">
          Disconnect to reconnect.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[50vh] h-[50vh] bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40vh] h-[40vh] bg-accent/20 rounded-full blur-3xl -z-10" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 pb-24 max-w-md mx-auto w-full">
        
        <div className="flex flex-col items-center text-center space-y-2 mb-12">
          <span className="text-sm uppercase tracking-widest text-muted-foreground font-medium">Next Prayer</span>
          <h2 className="text-3xl font-serif text-foreground">{prayerInfo?.nextPrayerName}</h2>
        </div>

        {/* Timer Display */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center mb-16">
          <div className="absolute inset-0 border border-primary/10 rounded-full scale-100 animate-breathe" />
          <div className="absolute inset-4 border border-primary/20 rounded-full" />
          
          <div className="text-center z-10">
            <div className="text-6xl md:text-7xl font-mono font-light tracking-tight text-primary">
              {timeLeft}
            </div>
            <p className="text-sm text-muted-foreground mt-2">until Adhan</p>
          </div>
        </div>

        {/* Action */}
        <div className="w-full space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Button 
            onClick={() => setLocation('/niyyah')}
            size="lg" 
            className="w-full text-lg shadow-lg shadow-primary/20 hover:shadow-primary/30"
          >
            Start Focus Session
            <ArrowRight className="ml-2 w-5 h-5 opacity-80" />
          </Button>
          
          <p className="text-xs text-center text-muted-foreground/60">
            Use this time to work with intention
          </p>
        </div>
      </main>
    </div>
  );
}
