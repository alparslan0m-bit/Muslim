import { Link, useLocation } from "wouter";
import { Home, History, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Today" },
    { href: "/history", icon: History, label: "History" },
  ];

  // Don't show nav on Focus or Niyyah screens to prevent distraction
  if (location === "/focus" || location === "/niyyah") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent z-50">
      <div className="max-w-md mx-auto bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-white/50 px-6 py-3 flex justify-around items-center">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 cursor-pointer group",
                location === item.href
                  ? "text-primary scale-110"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "w-6 h-6 transition-all duration-300",
                  location === item.href ? "stroke-[2.5px]" : "stroke-2"
                )}
              />
              <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-5">
                {item.label}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </nav>
  );
}
