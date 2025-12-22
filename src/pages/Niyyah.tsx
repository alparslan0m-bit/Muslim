import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/Button";
import { ArrowLeft, BookOpen, Briefcase, Heart, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
    <motion.div 
      className="min-h-screen bg-background flex flex-col p-6 max-w-md mx-auto animate-fade-in"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Header */}
      <motion.div 
        className="flex items-center mb-8 pt-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <button 
          onClick={() => setLocation("/")}
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
          "Actions are dependent upon their intentions." <br/>
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
          const isSelected = selected === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => setSelected(item.id)}
              className={cn(
                "group relative flex items-center p-5 rounded-2xl border-2 text-left transition-all duration-300",
                isSelected
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                  : "border-transparent bg-white hover:bg-white/60 hover:border-border shadow-sm hover:shadow-md"
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label={`Select intention: ${item.title} - ${item.description}`}
              aria-pressed={isSelected}
              role="radio"
              aria-checked={isSelected}
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
          whileHover={{ scale: selected ? 1.02 : 1 }}
          whileTap={{ scale: selected ? 0.98 : 1 }}
        >
          <Button 
            onClick={handleStart}
            disabled={!selected}
            size="lg"
            className="w-full text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            Begin Session
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
