import { Link, useLocation } from "wouter";
import { Home, History, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Today" },
    { href: "/history", icon: History, label: "History" },
  ];

  // Don't show nav on Focus or Niyyah screens to prevent distraction
  if (location === "/focus" || location === "/niyyah") return null;

  return (
    <motion.nav 
      className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent z-50"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-md mx-auto bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-white/50 px-6 py-3 flex justify-around items-center">
        {navItems.map((item, index) => (
          <motion.div
            key={item.href}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8 + index * 0.1, duration: 0.4, type: "spring", stiffness: 300 }}
          >
            <Link href={item.href}>
              <motion.div
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 cursor-pointer group",
                  location === item.href
                    ? "text-primary scale-110"
                    : "text-muted-foreground hover:text-foreground"
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <motion.div
                  animate={location === item.href ? { y: [0, -2, 0] } : {}}
                  transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <item.icon
                    className={cn(
                      "w-6 h-6 transition-all duration-300",
                      location === item.href ? "stroke-[2.5px]" : "stroke-2"
                    )}
                  />
                </motion.div>
                <motion.span 
                  className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-5"
                  initial={{ opacity: 0, y: 5 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.label}
                </motion.span>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.nav>
  );
}
