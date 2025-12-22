import { useSessions } from "@/hooks/use-sessions";
import { format } from "date-fns";
import { Loader2, Calendar, Clock, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function History() {
  const { data: sessions, isLoading } = useSessions();

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
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
    <div className="min-h-screen bg-background p-6 pb-24 max-w-md mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8 mt-4">
        <h1 className="text-3xl font-serif text-foreground">History</h1>
        <Link href="/">
          <div className="p-2 bg-white rounded-full shadow-sm border border-border cursor-pointer">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </div>
        </Link>
      </div>

      {!sessions?.length ? (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center opacity-60">
          <Clock className="w-16 h-16 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No sessions yet</p>
          <p className="text-sm">Start your first focus session today.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedDates.map((date) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {format(new Date(date), "EEEE, MMM d")}
                </h3>
              </div>
              
              <div className="space-y-3">
                {groupedSessions?.[date].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()).map((session) => (
                  <div 
                    key={session.id}
                    className="bg-white p-4 rounded-xl shadow-sm border border-transparent hover:border-primary/20 transition-all duration-200"
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
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
