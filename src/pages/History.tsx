import { useSessions } from "@/hooks/use-sessions";
import { format } from "date-fns";
import { Loader2, Calendar, Clock, ArrowLeft, RefreshCw } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/Button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function History() {
  const { data: sessions, isLoading, error, refetch } = useSessions();

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

  if (error) {
    return (
      <motion.div 
        className="min-h-screen bg-background p-6 pb-24 max-w-md mx-auto flex flex-col items-center justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 200 }}
          className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4"
        >
          <Clock className="w-8 h-8 text-destructive" />
        </motion.div>
        <motion.h2 
          className="text-xl font-semibold text-foreground mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Failed to Load History
        </motion.h2>
        <motion.p 
          className="text-muted-foreground mb-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {error instanceof Error ? error.message : 'Unknown error'}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <Button onClick={() => refetch()} className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow">
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <motion.div 
        className="min-h-screen flex items-center justify-center bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="flex flex-col items-center gap-4"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-10 h-10 text-primary" />
          </motion.div>
          <motion.p 
            className="text-muted-foreground font-serif"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Loading your sessions...
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  // Loading skeleton for sessions
  const SessionSkeleton = () => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-transparent">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-6 w-16 rounded-md" />
      </div>
    </div>
  );

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
    <motion.div 
      className="min-h-screen bg-background p-6 pb-24 max-w-md mx-auto animate-fade-in"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div 
        className="flex items-center justify-between mb-8 mt-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h1 className="text-3xl font-serif text-foreground">History</h1>
        <Link href="/">
          <motion.div 
            className="p-2 bg-white rounded-full shadow-sm border border-border cursor-pointer hover:bg-white/80 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </Link>
      </motion.div>

      {!sessions?.length ? (
        <motion.div 
          className="flex flex-col items-center justify-center h-[50vh] text-center opacity-60"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5, type: "spring", stiffness: 200 }}
          >
            <Clock className="w-16 h-16 text-muted-foreground mb-4" />
          </motion.div>
          <motion.p 
            className="text-lg font-medium"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            No sessions yet
          </motion.p>
          <motion.p 
            className="text-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            Start your first focus session today.
          </motion.p>
        </motion.div>
      ) : (
        <motion.div 
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {sortedDates.map((date, dateIndex) => (
            <motion.div 
              key={date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + dateIndex * 0.1, duration: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {format(new Date(date), "EEEE, MMM d")}
                </h3>
              </div>
              
              <div className="space-y-3">
                {groupedSessions?.[date].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()).map((session, sessionIndex) => (
                  <motion.div 
                    key={session.id}
                    className="bg-white p-4 rounded-xl shadow-sm border border-transparent hover:border-primary/20 transition-all duration-200 hover:shadow-md"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + dateIndex * 0.1 + sessionIndex * 0.05, duration: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-foreground">{session.niyyah}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(session.startTime), "h:mm a")} • {formatDuration(session.durationSeconds)}
                        </p>
                      </div>
                      <div className="bg-secondary px-2 py-1 rounded-md text-xs font-mono text-secondary-foreground/80">
                        {formatDuration(session.durationSeconds)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
