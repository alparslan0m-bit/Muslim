import { useSessions, useClearSessions } from "@/hooks/use-sessions";
import { format } from "date-fns";
import { Clock, ArrowLeft, RefreshCw, Trophy, Flame, Calendar as CalendarIcon, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/Button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface HistoryProps {
  onBackToHome?: () => void;
  onTabChange?: (tab: 'home' | 'focus' | 'history') => void;
}

export default function History({ onBackToHome, onTabChange }: HistoryProps) {
  const { data: sessions, isLoading, error, refetch } = useSessions();
  const { mutate: clearSessions, isPending: isClearing } = useClearSessions();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    if (mins < 1) return "< 1m";
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return `${hrs}h ${remainingMins}m`;
    }
    return `${mins}m`;
  };

  // Stats Calculation
  const totalSessions = sessions?.length || 0;
  const totalMinutes = sessions?.reduce((acc, curr) => acc + (curr.durationSeconds / 60), 0) || 0;
  const totalHours = Math.floor(totalMinutes / 60);

  if (error) {
    return (
      <div className="min-h-screen bg-background bg-noise flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card/50 backdrop-blur-sm p-8 rounded-3xl border border-destructive/10 shadow-lg max-w-sm w-full"
        >
          <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-destructive">
            <RefreshCw className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-serif font-medium text-foreground mb-2">Sync Error</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Unable to load your spiritual journey.<br />Please check your connection.
          </p>
          <Button onClick={() => refetch()} variant="outline" className="w-full">
            Try Again
          </Button>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background bg-noise p-6 pb-24 max-w-md mx-auto space-y-8">
        <div className="flex justify-between items-center mt-2">
          <Skeleton className="h-8 w-32 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-40 rounded-3xl" />
          <Skeleton className="h-40 rounded-3xl" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  // Group sessions by date
  const groupedSessions = sessions?.reduce((acc, session) => {
    const date = session.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(session);
    return acc;
  }, {} as Record<string, typeof sessions>);

  const sortedDates = Object.keys(groupedSessions || {}).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="min-h-[100dvh] bg-background bg-noise text-foreground overflow-x-hidden">
      <motion.div
        className="max-w-md mx-auto p-6 pb-32"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Header */}
        <header className="flex items-center justify-between mb-10 pt-4 sticky top-0 z-10 py-4 bg-background/80 backdrop-blur-xl -mx-6 px-6 border-b border-border/40 supports-[backdrop-filter]:bg-background/60">
          <div>
            <h1 className="text-3xl font-serif text-foreground tracking-tight">My Journey</h1>
            <p className="text-muted-foreground text-sm font-medium tracking-wide opacity-80 mt-1">Track your spiritual growth</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete all history? This cannot be undone.')) {
                  clearSessions();
                }
              }}
              disabled={isClearing}
            >
              <Button variant="ghost" size="icon" className="group rounded-full w-12 h-12 hover:bg-destructive/10 text-destructive hover:text-destructive">
                <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              </Button>
            </button>
            <button onClick={onBackToHome}>
              <Button variant="ghost" size="icon" className="group rounded-full w-12 h-12 hover:bg-muted/60">
                <ArrowLeft className="w-6 h-6 text-foreground/80 group-hover:-translate-x-1 transition-transform duration-300" />
              </Button>
            </button>
          </div>
        </header>

        {/* Stats Grid using Bento-box style */}
        <div className="grid grid-cols-2 gap-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="col-span-1 bg-gradient-to-br from-white to-stone-50 dark:from-stone-900 dark:to-stone-950 p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 dark:border-white/5 relative overflow-hidden group"
          >
            <div className="absolute top-4 right-4 p-2 bg-primary/10 rounded-full text-primary">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="mt-8">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-serif text-foreground tracking-tighter">
                  {totalHours > 0 ? totalHours : Math.round(totalMinutes)}
                </span>
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest text-[10px]">
                  {totalHours > 0 ? 'Hrs' : 'Mins'}
                </span>
              </div>
              <p className="text-muted-foreground/80 text-xs font-medium mt-2">Total Focus Time</p>
            </div>

            {/* Background decoration */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="col-span-1 bg-gradient-to-br from-white to-stone-50 dark:from-stone-900 dark:to-stone-950 p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 dark:border-white/5 relative overflow-hidden group"
          >
            <div className="absolute top-4 right-4 p-2 bg-orange-500/10 rounded-full text-orange-600 dark:text-orange-400">
              <Flame className="w-5 h-5" />
            </div>
            <div className="mt-8">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-serif text-foreground tracking-tighter">{totalSessions}</span>
              </div>
              <p className="text-muted-foreground/80 text-xs font-medium mt-2">Total Sessions</p>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-colors duration-500" />
          </motion.div>
        </div>

        {/* Timeline List */}
        <div className="relative">
          {/* Vertical Line for Timeline Effect (Optional, kept minimal) */}
          <div className="absolute left-[19px] top-4 bottom-0 w-px bg-gradient-to-b from-border/80 via-border/40 to-transparent" />

          {!sessions?.length ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center py-16 px-6 bg-white/40 dark:bg-black/20 backdrop-blur-md rounded-[2rem] border border-dashed border-border"
            >
              <div className="relative w-20 h-20 mx-auto mb-4">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center border border-primary/20"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-2xl"
                  >
                    🕌
                  </motion.div>
                </motion.div>
                <motion.div
                  animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 bg-primary/10 rounded-full blur-xl"
                />
              </div>
              <h3 className="text-lg font-serif text-foreground mb-2">Begin Your Journey</h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-[240px] mx-auto text-balance">
                "The most beloved deeds to Allah are those that are consistent, even if they are small."
              </p>
              <button onClick={() => onTabChange && onTabChange('focus')}>
                <Button className="rounded-full px-8 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                  Start Session
                </Button>
              </button>
            </motion.div>
          ) : (
            <div className="space-y-10">
              {sortedDates.map((date, dateIndex) => (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.3 + dateIndex * 0.1 }}
                  className="relative"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background relative z-10 shadow-sm" />
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      {format(new Date(date), "EEEE, MMM d")}
                    </h3>
                  </div>

                  <motion.div
                    className="space-y-3 pl-10"
                    variants={{
                      hidden: { opacity: 1 },
                      visible: { 
                        opacity: 1,
                        transition: { staggerChildren: 0.05, delayChildren: 0.1 } 
                      }
                    }}
                    initial="hidden"
                    animate="visible"
                  >
                    {groupedSessions?.[date]
                      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                      .map((session, index) => (
                        <motion.div
                          key={session.id}
                          variants={{
                            hidden: { opacity: 0, y: 10 },
                            visible: { opacity: 1, y: 0 }
                          }}
                          transition={{ duration: 0.3 }}
                          className={cn(
                            "group relative bg-white dark:bg-stone-900",
                            "p-4 rounded-2xl border border-border/40 hover:border-primary/30",
                            "shadow-sm hover:shadow-md transition-all duration-300 ease-out",
                            "cursor-default overflow-hidden"
                          )}
                        >
                          <div className="flex justify-between items-center relative z-10">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                                <Clock className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground leading-none mb-1.5">{formatDuration(session.durationSeconds)}</p>
                                <p className="text-xs text-muted-foreground font-mono opacity-80">
                                  {format(new Date(session.startTime), "h:mm a")}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(session.startTime), "MMM d")}
                              </span>
                            </div>
                          </div>
                          {/* Hover Effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        </motion.div>
                      ))}
                  </motion.div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
