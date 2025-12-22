import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/Button';
import { Wifi, WifiOff, RefreshCw, CheckCircle, Clock, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNetworkStatus } from '@/hooks/use-network-status';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Offline() {
  const isOnline = useNetworkStatus();
  const [, setLocation] = useLocation();
  const [retryCount, setRetryCount] = useState(0);

  // Auto-redirect when online
  useEffect(() => {
    if (isOnline) {
      const timer = setTimeout(() => {
        setLocation('/');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, setLocation]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    window.location.reload();
  };

  const cachedFeatures = [
    {
      icon: Clock,
      title: 'Prayer Times',
      description: 'Your cached prayer times are available',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: BookOpen,
      title: 'Focus Sessions',
      description: 'All your session history is cached',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: CheckCircle,
      title: 'Settings',
      description: 'Your preferences are saved locally',
      color: 'from-emerald-500 to-teal-500'
    },
  ];

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-background/80 p-6 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated background elements */}
      <motion.div
        className="absolute top-10 right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"
        animate={{ y: [0, 20, 0], x: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-10 left-10 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl"
        animate={{ y: [0, -20, 0], x: [0, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center max-w-md z-10"
      >
        {/* Icon */}
        <motion.div
          variants={itemVariants}
          className="mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-gradient-to-br from-amber-500/20 to-orange-500/10 rounded-3xl flex items-center justify-center mx-auto"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <WifiOff className="w-12 h-12 text-amber-600 dark:text-amber-400" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Heading */}
        <motion.h1
          variants={itemVariants}
          className="text-3xl md:text-4xl font-serif text-foreground mb-3 font-bold"
        >
          You're Offline
        </motion.h1>

        {/* Subheading */}
        <motion.p
          variants={itemVariants}
          className="text-base text-muted-foreground mb-8 leading-relaxed"
        >
          No worries! Muslim Focus is built to work offline. Your prayer times, sessions, and settings are safely cached on your device.
        </motion.p>

        {/* Cached Features */}
        <motion.div
          variants={itemVariants}
          className="space-y-3 mb-10 text-left"
        >
          <p className="text-sm font-semibold text-foreground/70 uppercase tracking-wide">
            What's Available Offline
          </p>
          <div className="grid gap-3">
            {cachedFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-r from-muted/50 to-muted/20 border border-border/50 hover:border-border/80 transition-colors"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                  className="p-2.5 bg-primary/10 rounded-lg flex-shrink-0"
                >
                  <feature.icon className="w-5 h-5 text-primary" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-foreground mb-0.5">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Connection Status */}
        <motion.div
          variants={itemVariants}
          className="mb-8 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/5 rounded-2xl border border-cyan-500/20"
        >
          <div className="flex items-center justify-center gap-2 text-sm text-cyan-600 dark:text-cyan-400">
            <motion.div
              animate={{ opacity: [0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Wifi className="w-4 h-4" />
            </motion.div>
            <span className="font-medium">Waiting for connection...</span>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="space-y-3"
        >
          <Button
            onClick={handleRetry}
            className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/25 relative overflow-hidden group"
          >
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100"
            />
            <span className="relative flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Try Again
            </span>
          </Button>

          {retryCount > 2 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-muted-foreground text-center pt-2"
            >
              💡 Tip: Check your WiFi or mobile connection in device settings
            </motion.p>
          )}
        </motion.div>

        {/* Premium Info */}
        <motion.div
          variants={itemVariants}
          className="mt-10 pt-8 border-t border-border/50 text-center"
        >
          <div className="space-y-3">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-3xl"
            >
              📿
            </motion.div>
            <div>
              <h3 className="font-serif text-sm text-foreground font-semibold mb-1">
                Premium PWA
              </h3>
              <p className="text-xs text-muted-foreground">
                Muslim Focus works seamlessly offline with full functionality and data sync when you're back online
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
