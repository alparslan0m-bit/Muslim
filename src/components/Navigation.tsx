import { Link, useLocation } from "wouter";
import { Home, History, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
      className="fixed bottom-6 left-0 right-0 z-40 flex justify-center pointer-events-none"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} // Custom easing
    >
      <div className="pointer-events-auto bg-white/80 dark:bg-black/60 backdrop-blur-xl rounded-full shadow-lg shadow-black/5 border border-white/20 dark:border-white/10 p-1.5 flex items-center gap-1 mx-4">
        {navItems.map((item) => {
          const isActive = location === item.href;

          return (
            <Link key={item.href} href={item.href} onClick={triggerHaptic}>
              <div className="relative">
                {/* Active Indicator Background */}
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className={cn(
                      "absolute inset-0 rounded-full",
                      item.isAction ? "bg-primary/10" : "bg-primary/10"
                    )}
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                <motion.div
                  className={cn(
                    "relative px-5 py-3 rounded-full flex flex-col items-center gap-1 transition-colors duration-300 min-w-[72px]",
                    isActive
                      ? "text-primary dark:text-primary"
                      : "text-muted-foreground hover:text-foreground active:text-foreground"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    animate={isActive && item.isAction ? {
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    } : {}}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <item.icon
                      className={cn(
                        "w-6 h-6 transition-all duration-300",
                        isActive ? "stroke-[2.5px] fill-current/10" : "stroke-2",
                        item.isAction && !isActive && "text-primary"
                      )}
                    />
                  </motion.div>

                  {/* Label - Only visible when active for cleaner look, or always visible if preferred */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.span
                        className="text-[10px] font-semibold absolute -bottom-5"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 5 }}
                        exit={{ opacity: 0, y: -5 }}
                      >
                        <span className="w-1 h-1 rounded-full bg-primary block" />
                      </motion.span>
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
