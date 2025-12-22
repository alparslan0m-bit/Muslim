import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/Button";
import { ArrowLeft, BookOpen, Briefcase, Heart, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

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

export default function Niyyah() {
  const [, setLocation] = useLocation();
  const [selected, setSelected] = useState<string | null>(null);

  const handleStart = () => {
    if (selected) {
      // Pass the selected niyyah to the focus page via query param or state management
      // For simplicity here, passing as query param
      const intention = INTENTIONS.find(i => i.id === selected);
      setLocation(`/focus?niyyah=${encodeURIComponent(intention?.title || "")}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-6 max-w-md mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center mb-8 pt-4">
        <button 
          onClick={() => setLocation("/")}
          className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="mb-10">
        <h1 className="text-3xl font-serif text-foreground mb-3">Set Your Niyyah</h1>
        <p className="text-muted-foreground text-lg font-light leading-relaxed">
          "Actions are dependent upon their intentions." <br/>
          <span className="text-sm opacity-60">— Sahih al-Bukhari</span>
        </p>
      </div>

      {/* Options */}
      <div className="grid gap-4 flex-1">
        {INTENTIONS.map((item) => {
          const isSelected = selected === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSelected(item.id)}
              className={cn(
                "group relative flex items-center p-5 rounded-2xl border-2 text-left transition-all duration-300",
                isSelected
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-transparent bg-white hover:bg-white/60 hover:border-border shadow-sm"
              )}
            >
              <div className={cn(
                "p-3 rounded-xl mr-4 transition-colors",
                item.color,
                isSelected ? "bg-primary text-primary-foreground" : ""
              )}>
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className={cn("font-medium text-lg", isSelected ? "text-primary-800" : "text-foreground")}>
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground/80 mt-0.5">{item.description}</p>
              </div>
              
              {isSelected && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4">
        <Button 
          onClick={handleStart}
          disabled={!selected}
          size="lg"
          className="w-full text-lg shadow-lg"
        >
          Begin Session
        </Button>
      </div>
    </div>
  );
}
