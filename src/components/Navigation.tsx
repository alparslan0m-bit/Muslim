import { Link, useLocation } from "wouter";
import { Home, History, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Today" },
    { href: "/niyyah", icon: Compass, label: "Focus", isAction: true }, // Highlighted action button
    { href: "/history", icon: History, label: "History" },
  ];

  // Haptic feedback helper
  const triggerHaptic = () => {
    if (navigator.vibrate) {
      navigator.vibrate(10); // Subtle tick
    }
  };

  // Don't show nav on Focus screen or active session
  if (location === "/focus") return null;

  return (
    <motion.nav
      className="fixed bottom-8 left-0 right-0 z-50 flex justify-center pointer-events-none"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="pointer-events-auto bg-white/90 dark:bg-black/80 backdrop-blur-2xl rounded-full shadow-2xl shadow-black/10 border border-white/20 dark:border-white/10 p-2 flex items-center gap-2 mx-6 supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/60">
        {navItems.map((item) => {
          const isActive = location === item.href;

          return (
            <Link key={item.href} href={item.href} onClick={triggerHaptic}>
              <div className="relative group cursor-pointer">
                {/* Active Indicator Background */}
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className={cn(
                      "absolute inset-0 rounded-full shadow-sm",
                      item.isAction ? "bg-primary/20" : "bg-primary/15"
                    )}
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                <motion.div
                  className={cn(
                    "relative px-6 py-3.5 rounded-full flex flex-col items-center gap-1 transition-colors duration-500",
                    isActive
                      ? "text-primary dark:text-primary"
                      : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 active:text-foreground"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    animate={isActive && item.isAction ? {
                      scale: [1, 1.15, 1],
                      rotate: [0, 10, -10, 0]
                    } : {}}
                    transition={{ duration: 0.6, ease: "easeInOut", repeat: isActive && item.isAction ? Infinity : 0, repeatDelay: 5 }}
                  >
                    <item.icon
                      className={cn(
                        "w-6 h-6 transition-all duration-500",
                        isActive ? "stroke-[2.5px] fill-current/20" : "stroke-[1.5px]",
                        item.isAction && !isActive && "text-primary/70"
                      )}
                    />
                  </motion.div>

                  {/* Dot Indicator for Active State */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        className="absolute -bottom-1"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="w-1 h-1 rounded-full bg-primary shadow-glow-sm" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}

