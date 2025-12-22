import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw, WifiX, Signal, SignalLow } from 'lucide-react';
import { cn } from '@/lib/utils';

export function NetworkStatus() {
    const [isOnline, setIsOnline] = useState(true);
    const [showOfflineToast, setShowOfflineToast] = useState(false);
    const [showReconnectedToast, setShowReconnectedToast] = useState(false);
    const [wasOffline, setWasOffline] = useState(false);
    const [connectionQuality, setConnectionQuality] = useState<'good' | 'poor'>('good');

    // Detect connection quality
    useEffect(() => {
        if (!navigator.connection) return;
        
        const updateConnectionQuality = () => {
            const connection = (navigator as any).connection;
            if (connection && connection.effectiveType) {
                const effectiveType = connection.effectiveType;
                setConnectionQuality(['4g', '3g'].includes(effectiveType) ? 'good' : 'poor');
            }
        };

        updateConnectionQuality();
        window.addEventListener('online', updateConnectionQuality);
        
        return () => window.removeEventListener('online', updateConnectionQuality);
    }, []);

    useEffect(() => {
        // Set initial state
        setIsOnline(navigator.onLine);

        const handleOnline = () => {
            setIsOnline(true);
            if (wasOffline) {
                setShowReconnectedToast(true);
                setTimeout(() => setShowReconnectedToast(false), 4000);
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
            {/* Offline Toast - Premium */}
            <AnimatePresence>
                {showOfflineToast && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        className="fixed top-4 left-4 right-4 z-[70] md:left-auto md:right-4 md:w-96"
                    >
                        <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl p-4 shadow-2xl shadow-amber-500/30 border border-amber-400/50">
                            {/* Animated background gradient */}
                            <motion.div
                                animate={{ x: [0, 100, 0] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                            />
                            
                            <div className="flex items-center gap-3 relative">
                                <motion.div
                                    animate={{ scale: [1, 1.15, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="p-2 bg-white/20 rounded-xl flex-shrink-0 backdrop-blur-sm"
                                >
                                    <WifiOff className="w-5 h-5" />
                                </motion.div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-sm">Offline Mode Activated</h3>
                                    <p className="text-xs opacity-90 mt-0.5">
                                        ✨ Your data is safe—the app works offline
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowOfflineToast(false)}
                                    className="p-1 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                                    aria-label="Dismiss"
                                >
                                    <span className="text-lg">×</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reconnected Toast - Premium */}
            <AnimatePresence>
                {showReconnectedToast && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        className="fixed top-4 left-4 right-4 z-[70] md:left-auto md:right-4 md:w-96"
                    >
                        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl p-4 shadow-2xl shadow-emerald-500/30 border border-emerald-400/50">
                            {/* Success pulse animation */}
                            <motion.div
                                animate={{ scale: [0, 1], opacity: [1, 0] }}
                                transition={{ duration: 0.6 }}
                                className="absolute inset-0 rounded-2xl border-2 border-white/30"
                            />
                            
                            <div className="flex items-center gap-3 relative">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                    className="p-2 bg-white/20 rounded-xl flex-shrink-0 backdrop-blur-sm"
                                >
                                    <Wifi className="w-5 h-5" />
                                </motion.div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-sm flex items-center gap-1">
                                        Back Online! 
                                        <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity }}>
                                            🎉
                                        </motion.span>
                                    </h3>
                                    <p className="text-xs opacity-90 mt-0.5">
                                        {connectionQuality === 'good' 
                                            ? 'Strong connection restored' 
                                            : 'Connection is weak but available'}
                                    </p>
                                </div>
                                {connectionQuality === 'poor' && (
                                    <div className="flex-shrink-0">
                                        <SignalLow className="w-4 h-4 text-yellow-200" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Persistent offline indicator - Subtle premium bar */}
            <AnimatePresence>
                {!isOnline && !showOfflineToast && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: 'spring', damping: 30 }}
                        className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-amber-500/95 to-amber-600/95 text-white overflow-hidden backdrop-blur-md"
                    >
                        <div className="flex items-center justify-center gap-2 py-2 text-xs font-medium">
                            <motion.div animate={{ opacity: [0.5, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                                <WifiOff className="w-3.5 h-3.5" />
                            </motion.div>
                            <span>Offline • App data is cached locally</span>
                            <motion.span animate={{ x: [0, 2, 0] }} transition={{ duration: 1, repeat: Infinity }}>
                                •
                            </motion.span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
