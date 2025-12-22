import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/Button';
import { X, Download, Smartphone, Share, Plus, Check, Sparkles, Bell, Wifi, WifiOff, Clock, Zap, Shield, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

type InstallStep = 'prompt' | 'installing' | 'success' | 'ios-instructions';

const FEATURES = [
  { icon: Clock, text: 'Accurate prayer times', color: 'from-blue-500 to-cyan-500' },
  { icon: Wifi, text: 'Complete offline support', color: 'from-emerald-500 to-teal-500' },
  { icon: Zap, text: 'Lightning fast performance', color: 'from-amber-500 to-orange-500' },
  { icon: Shield, text: 'Privacy & security focused', color: 'from-purple-500 to-pink-500' },
];

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installStep, setInstallStep] = useState<InstallStep>('prompt');
  const [showUpdateToast, setShowUpdateToast] = useState(false);
  const [countdown, setCountdown] = useState(10);

  // Countdown timer effect
  useEffect(() => {
    if (!showPrompt || installStep !== 'prompt' || countdown <= 0) return;
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [showPrompt, installStep, countdown]);

  useEffect(() => {
    // Check if already installed
    const standaloneCheck = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    setIsStandalone(standaloneCheck || isInWebAppiOS);

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    const iosCheck = /iphone|ipad|ipod/.test(userAgent);
    const androidCheck = /android/.test(userAgent);
    setIsIOS(iosCheck);
    setIsAndroid(androidCheck);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show prompt after 10 seconds for better UX
      const dismissedAt = localStorage.getItem('installPromptDismissedAt');
      const cooldownPeriod = 24 * 60 * 60 * 1000; // 24 hours

      if (dismissedAt && Date.now() - parseInt(dismissedAt) < cooldownPeriod) {
        return; // Don't show prompt if dismissed within cooldown period
      }

      setTimeout(() => {
        if (!standaloneCheck && !isInWebAppiOS) {
          setShowPrompt(true);
          setCountdown(10);
        }
      }, 10000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show instructions after a delay
    if (iosCheck && !isInWebAppiOS) {
      const iosShownAt = localStorage.getItem('iosInstallInstructionsShownAt');
      const cooldownPeriod = 7 * 24 * 60 * 60 * 1000; // 7 days

      if (!iosShownAt || Date.now() - parseInt(iosShownAt) > cooldownPeriod) {
        setTimeout(() => {
          setInstallStep('ios-instructions');
          setShowPrompt(true);
        }, 15000);
      }
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setInstallStep('success');
      setTimeout(() => {
        setShowPrompt(false);
        setDeferredPrompt(null);
      }, 3000);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // Service Worker update detection
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setShowUpdateToast(true);
              }
            });
          }
        });
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (deferredPrompt) {
      setInstallStep('installing');

      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
          console.log('User accepted the install prompt');
          setInstallStep('success');
          setTimeout(() => {
            setShowPrompt(false);
          }, 2500);
        } else {
          setInstallStep('prompt');
          handleDismiss();
        }
      } catch (error) {
        console.error('Install error:', error);
        setInstallStep('prompt');
      }
    }
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShowPrompt(false);
    setCountdown(10);
    localStorage.setItem('installPromptDismissedAt', Date.now().toString());
  }, []);

  const handleIOSInstructions = useCallback(() => {
    setShowPrompt(false);
    localStorage.setItem('iosInstallInstructionsShownAt', Date.now().toString());
  }, []);

  const handleUpdateApp = useCallback(() => {
    window.location.reload();
  }, []);

  // Trigger subtle haptic feedback
  const triggerHaptic = () => {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  if (isStandalone && !showUpdateToast) return null;

  return (
    <>
      {/* Update Toast - Premium Style */}
      <AnimatePresence>
        {showUpdateToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed top-4 left-4 right-4 z-[60] md:left-auto md:right-4 md:w-96"
          >
            <div className="relative overflow-hidden bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-2xl p-4 shadow-2xl shadow-primary/30 border border-primary/30">
              <motion.div
                animate={{ x: [0, 100] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-0 left-0 h-full w-1 bg-primary-foreground/20 rounded-full"
              />
              <div className="flex items-center gap-3 relative">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="p-2 bg-white/20 rounded-xl flex-shrink-0"
                >
                  <Sparkles className="w-5 h-5" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">Update Available ✨</h3>
                  <p className="text-xs opacity-90 mt-0.5">
                    New features and improvements are ready
                  </p>
                </div>
                <Button
                  onClick={handleUpdateApp}
                  size="sm"
                  variant="secondary"
                  className="text-xs h-8 bg-white/20 hover:bg-white/30 border-0 font-semibold"
                  onMouseDown={triggerHaptic}
                >
                  Update
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Install Prompt */}
      <AnimatePresence>
        {showPrompt && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-md z-50"
              onClick={handleDismiss}
            />

            {/* Bottom Sheet - Premium */}
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 md:bottom-4 md:left-auto md:right-4 md:w-96 md:rounded-3xl"
            >
              <div className={cn(
                "bg-gradient-to-b from-card to-card/50 border-t md:border border-border/50 md:rounded-3xl overflow-hidden",
                "shadow-2xl md:shadow-2xl backdrop-blur-xl"
              )}>
                {/* Premium Handle bar for mobile */}
                <motion.div
                  animate={{ scaleX: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex justify-center pt-3 md:hidden"
                >
                  <div className="w-12 h-1 bg-gradient-to-r from-transparent via-muted-foreground/40 to-transparent rounded-full" />
                </motion.div>

                {/* Close button */}
                <button
                  onClick={handleDismiss}
                  className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-all rounded-full z-10"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Content */}
                <div className="p-6 pt-4 space-y-6">
                  <AnimatePresence mode="wait">
                    {installStep === 'success' ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="text-center py-8"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                          className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.5 }}
                          >
                            <Check className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                          </motion.div>
                        </motion.div>
                        <h3 className="text-2xl font-serif text-foreground mb-2">
                          Alhamdulillah! 🎉
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          Muslim Focus is now installed. Welcome!
                        </p>
                      </motion.div>
                    ) : installStep === 'installing' ? (
                      <motion.div
                        key="installing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-8"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                          className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full mx-auto mb-4"
                        />
                        <h3 className="text-lg font-serif text-foreground mb-2">
                          Installing...
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          Preparing your premium app experience
                        </p>
                      </motion.div>
                    ) : installStep === 'ios-instructions' ? (
                      <motion.div
                        key="ios"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                      >
                        {/* Header */}
                        <div className="space-y-3">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1, type: 'spring' }}
                            className="p-4 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl w-fit"
                          >
                            <Smartphone className="w-8 h-8 text-primary" />
                          </motion.div>
                          <div>
                            <h3 className="text-xl font-serif text-foreground">
                              Install Muslim Focus
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Quick setup for iOS
                            </p>
                          </div>
                        </div>

                        {/* iOS Instructions */}
                        <div className="space-y-3">
                          {[
                            { num: 1, icon: Share, text: 'Tap the Share button at the bottom' },
                            { num: 2, icon: Plus, text: 'Scroll and tap "Add to Home Screen"' },
                            { num: 3, icon: Check, text: 'Tap "Add" to confirm' }
                          ].map((step, idx) => (
                            <motion.div
                              key={step.num}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 + idx * 0.1 }}
                              className="flex items-center gap-3 p-4 bg-gradient-to-r from-muted/50 to-muted/20 rounded-2xl border border-border/50 hover:border-border transition-colors"
                            >
                              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
                                {step.num}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-foreground font-medium">
                                  {step.text}
                                </p>
                              </div>
                              <step.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            </motion.div>
                          ))}
                        </div>

                        <Button
                          onClick={handleIOSInstructions}
                          className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20"
                        >
                          Got it!
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="prompt"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                      >
                        {/* Premium Header */}
                        <div className="space-y-4">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                            className="p-5 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-3xl text-center"
                          >
                            <motion.div
                              animate={{ y: [0, -8, 0] }}
                              transition={{ duration: 3, repeat: Infinity }}
                              className="text-6xl"
                            >
                              📿
                            </motion.div>
                          </motion.div>

                          <div className="space-y-2">
                            <motion.h3
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                              className="text-2xl font-serif text-foreground"
                            >
                              Premium App
                            </motion.h3>
                            <motion.p
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                              className="text-sm text-muted-foreground"
                            >
                              Get Muslim Focus on your home screen
                            </motion.p>
                          </div>
                        </div>

                        {/* Feature Grid */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                          className="grid grid-cols-2 gap-3"
                        >
                          {FEATURES.map((feature, index) => (
                            <motion.div
                              key={feature.text}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.5 + index * 0.08 }}
                              className={cn(
                                "p-4 rounded-2xl bg-gradient-to-br border border-border/50",
                                "hover:border-primary/30 transition-all group cursor-default"
                              )}
                            >
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="w-6 h-6 text-primary mb-2"
                              >
                                <feature.icon />
                              </motion.div>
                              <p className="text-xs font-medium text-foreground leading-tight group-hover:text-primary transition-colors">
                                {feature.text}
                              </p>
                            </motion.div>
                          ))}
                        </motion.div>

                        {/* Benefits */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7 }}
                          className="space-y-2"
                        >
                          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-primary/5 to-transparent rounded-xl border border-primary/10">
                            <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
                            <span className="text-xs font-medium text-foreground">Quick access on home screen</span>
                          </div>
                          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-emerald-500/5 to-transparent rounded-xl border border-emerald-500/10">
                            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                            <span className="text-xs font-medium text-foreground">No tracking • Private & secure</span>
                          </div>
                        </motion.div>

                        {/* CTA Buttons */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8 }}
                          className="space-y-3 pt-2"
                        >
                          <Button
                            onClick={() => {
                              triggerHaptic();
                              handleInstall();
                            }}
                            disabled={!deferredPrompt && !isAndroid && !isIOS}
                            className={cn(
                              "w-full h-12 text-base font-semibold shadow-lg shadow-primary/25",
                              "relative overflow-hidden group enabled:hover:shadow-lg enabled:hover:shadow-primary/40"
                            )}
                          >
                            <motion.div
                              animate={{ x: [0, 4, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-enabled:opacity-100"
                            />
                            <motion.span
                              animate={{ scale: [1, 1.02, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="relative flex items-center justify-center gap-2"
                            >
                              {countdown > 0 && (
                                <motion.span
                                  animate={{ opacity: [1, 0.5] }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                  className="text-xs opacity-70"
                                >
                                  {countdown}s
                                </motion.span>
                              )}
                              <Download className="w-5 h-5" />
                              Install Now
                            </motion.span>
                          </Button>

                          <button
                            onClick={handleDismiss}
                            className={cn(
                              "w-full py-3 text-sm font-medium text-muted-foreground",
                              "hover:text-foreground hover:bg-muted/50 rounded-xl transition-all duration-200"
                            )}
                          >
                            Remind me later
                          </button>
                        </motion.div>

                        {/* Trust Indicators */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1 }}
                          className="flex items-center justify-center gap-2 pt-3 border-t border-border/50 text-xs text-muted-foreground"
                        >
                          <span>✨</span>
                          <span>Free & Open Source</span>
                          <span>•</span>
                          <span>No Ads</span>
                          <span>✨</span>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
