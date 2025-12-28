import { Home, History, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useHapticFeedback } from "@/hooks/use-pwa";

interface NavigationProps {
  activeTab: 'home' | 'focus' | 'history';
  onTabChange: (tab: 'home' | 'focus' | 'history') => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const haptic = useHapticFeedback();

  const navItems = [
    { id: 'home' as const, icon: Home, label: "Today" },
    { id: 'focus' as const, icon: Compass, label: "Focus" },
    { id: 'history' as const, icon: History, label: "History" },
  ];

  const handleNavClick = () => {
    haptic.tap();
  };

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-black/5 dark:border-white/10"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center justify-around px-4 py-2 relative">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                handleNavClick();
                onTabChange(item.id);
              }}
              className="flex flex-col items-center justify-center flex-1 py-3 min-h-[56px] relative"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute w-14 h-14 bg-primary/10 rounded-full shadow-[0_0_12px_rgba(157,193,131,0.3)]"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <motion.div
                className={cn(
                  "flex flex-col items-center gap-1 transition-all duration-200 relative z-10",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
                whileTap={{ scale: 0.95 }}
              >
                <item.icon
                  className={cn(
                    "w-6 h-6 transition-all duration-200",
                    isActive 
                      ? "stroke-[2.5px] text-primary" // Thicker stroke + Color
                      : "stroke-[1.5px] text-muted-foreground"
                  )}
                />
                <span className="text-xs font-medium">{item.label}</span>
              </motion.div>
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
}

