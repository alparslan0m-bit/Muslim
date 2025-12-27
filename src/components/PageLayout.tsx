import { ReactNode, useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface PageLayoutProps {
  title: string;
  children: ReactNode;
}

export function PageLayout({ title, children }: PageLayoutProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        setIsScrolled(scrollRef.current.scrollTop > 50);
      }
    };

    const element = scrollRef.current;
    if (element) {
      element.addEventListener('scroll', handleScroll);
      return () => element.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Large Title */}
      <motion.div
        className="px-6 pt-12 pb-6"
        animate={{
          y: isScrolled ? -50 : 0,
          opacity: isScrolled ? 0 : 1
        }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-foreground">{title}</h1>
      </motion.div>

      {/* Navigation Bar (appears on scroll) */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-b border-black/5 dark:border-white/10"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
        animate={{
          opacity: isScrolled ? 1 : 0,
          y: isScrolled ? 0 : -100
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-center h-12 px-6">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        </div>
      </motion.div>

      {/* Scrollable Content */}
      <div
        ref={scrollRef}
        className="h-screen overflow-y-auto"
        style={{ paddingTop: isScrolled ? 'calc(env(safe-area-inset-top, 0px) + 64px)' : '0' }}
      >
        <div className="px-6 pb-20">
          {children}
        </div>
      </div>
    </div>
  );
}