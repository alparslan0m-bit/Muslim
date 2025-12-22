import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export function NetworkStatus() {
    const [isOnline, setIsOnline] = useState(true);
    const [showOfflineToast, setShowOfflineToast] = useState(false);
    const [showReconnectedToast, setShowReconnectedToast] = useState(false);
    const [wasOffline, setWasOffline] = useState(false);

    useEffect(() => {
        // Set initial state
        setIsOnline(navigator.onLine);

        const handleOnline = () => {
            setIsOnline(true);
            if (wasOffline) {
                setShowReconnectedToast(true);
                setTimeout(() => setShowReconnectedToast(false), 3000);
            }
            setShowOfflineToast(false);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setWasOffline(true);
            setShowOfflineToast(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [wasOffline]);

    return (
        <>
            {/* Offline Toast */}
            <AnimatePresence>
                {showOfflineToast && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        className="fixed top-4 left-4 right-4 z-[70] md:left-auto md:right-4 md:w-80"
                    >
                        <div className={cn(
                            "bg-amber-500 text-white rounded-2xl p-4 shadow-xl",
                            "border border-amber-400"
                        )}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl animate-pulse">
                                    <WifiOff className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-sm">You're Offline</h3>
                                    <p className="text-xs opacity-90 mt-0.5">
                                        Don't worry, the app works offline
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowOfflineToast(false)}
                                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <span className="sr-only">Dismiss</span>
                                    ×
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reconnected Toast */}
            <AnimatePresence>
                {showReconnectedToast && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        className="fixed top-4 left-4 right-4 z-[70] md:left-auto md:right-4 md:w-80"
                    >
                        <div className={cn(
                            "bg-green-500 text-white rounded-2xl p-4 shadow-xl",
                            "border border-green-400"
                        )}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <Wifi className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-sm">Back Online! 🎉</h3>
                                    <p className="text-xs opacity-90 mt-0.5">
                                        Connection restored
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Persistent offline indicator (subtle bar at top) */}
            <AnimatePresence>
                {!isOnline && !showOfflineToast && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="fixed top-0 left-0 right-0 z-[60] bg-amber-500 text-white overflow-hidden"
                    >
                        <div className="flex items-center justify-center gap-2 py-1.5 text-xs font-medium">
                            <WifiOff className="w-3.5 h-3.5" />
                            <span>Offline Mode</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
