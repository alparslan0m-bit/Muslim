import { Link, useLocation } from "wouter";
import { Home, History, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useHapticFeedback } from "@/hooks/use-pwa";

export function Navigation() {
  const [location] = useLocation();
  const haptic = useHapticFeedback();

  const navItems = [
    { href: "/", icon: Home, label: "Today" },
    { href: "/niyyah", icon: Compass, label: "Focus" },
    { href: "/history", icon: History, label: "History" },
  ];

  const handleNavClick = () => {
    haptic.tap();
  };

  // Don't show nav on Focus screen or active session
  if (location === "/focus") return null;

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-black/5 dark:border-white/10"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center justify-around px-4 py-2">
        {navItems.map((item) => {
          const isActive = location === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className="flex flex-col items-center justify-center flex-1 py-2"
            >
              <motion.div
                className={cn(
                  "flex flex-col items-center gap-1 transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
                whileTap={{ scale: 0.95 }}
              >
                <item.icon
                  className={cn(
                    "w-6 h-6",
                    isActive ? "stroke-[2px]" : "stroke-[1.5px]"
                  )}
                />
                <span className="text-xs font-medium">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}

