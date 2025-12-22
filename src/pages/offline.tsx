import { useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNetworkStatus } from '@/hooks/use-network-status';

export default function Offline() {
  const isOnline = useNetworkStatus();

  const handleRetry = () => {
    window.location.reload();
  };

  if (isOnline) {
    // If back online, redirect to home
    window.location.href = '/';
    return null;
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 200 }}
        className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mb-6"
      >
        <WifiOff className="w-12 h-12 text-destructive" />
      </motion.div>

      <motion.h1
        className="text-2xl font-serif text-foreground mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        You're Offline
      </motion.h1>

      <motion.p
        className="text-muted-foreground mb-6 max-w-sm leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        Muslim Focus works offline! Your focus sessions and prayer times are cached locally.
        Please check your internet connection and try again.
      </motion.p>

      <motion.div
        className="space-y-4 w-full max-w-xs"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <Button
          onClick={handleRetry}
          className="w-full flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>

        <div className="text-center">
          <p className="text-xs text-muted-foreground/60">
            <Wifi className="w-3 h-3 inline mr-1" />
            Waiting for connection...
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}