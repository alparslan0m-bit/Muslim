import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/Button';
import { X, Download, Smartphone, Share, Plus, Check, Sparkles, Bell, Wifi, WifiOff } from 'lucide-react';
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
  { icon: Bell, text: 'Prayer time notifications' },
  { icon: Wifi, text: 'Works offline' },
  { icon: Sparkles, text: 'Premium experience' },
];

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installStep, setInstallStep] = useState<InstallStep>('prompt');
  const [showUpdateToast, setShowUpdateToast] = useState(false);

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
    localStorage.setItem('installPromptDismissedAt', Date.now().toString());
  }, []);

  const handleIOSInstructions = useCallback(() => {
    setShowPrompt(false);
    localStorage.setItem('iosInstallInstructionsShownAt', Date.now().toString());
  }, []);

  const handleUpdateApp = useCallback(() => {
    window.location.reload();
  }, []);

  if (isStandalone && !showUpdateToast) return null;

  return (
    <>
      {/* Update Toast */}
      <AnimatePresence>
        {showUpdateToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-4 left-4 right-4 z-[60] md:left-auto md:right-4 md:w-80"
          >
            <div className="bg-primary text-primary-foreground rounded-2xl p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">Update Available ✨</h3>
                  <p className="text-xs opacity-90 mt-0.5">
                    A new version is ready to install
                  </p>
                </div>
                <Button
                  onClick={handleUpdateApp}
                  size="sm"
                  variant="secondary"
                  className="text-xs h-8 bg-white/20 hover:bg-white/30 border-0"
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
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
              onClick={handleDismiss}
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 md:bottom-4 md:left-auto md:right-4 md:w-96"
            >
              <div className={cn(
                "bg-card border-t md:border border-border md:rounded-2xl overflow-hidden",
                "shadow-2xl md:shadow-xl"
              )}>
                {/* Handle bar for mobile */}
                <div className="flex justify-center pt-3 md:hidden">
                  <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
                </div>

                {/* Close button */}
                <button
                  onClick={handleDismiss}
                  className="absolute top-3 right-3 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted z-10"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Content */}
                <div className="p-6 pt-4">
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
                          className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                          <Check className="w-10 h-10 text-primary" />
                        </motion.div>
                        <h3 className="text-xl font-serif text-foreground mb-2">
                          Alhamdulillah! 🎉
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          Muslim Focus has been installed successfully
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
                          Please wait a moment
                        </p>
                      </motion.div>
                    ) : installStep === 'ios-instructions' ? (
                      <motion.div
                        key="ios"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-5">
                          <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl">
                            <Smartphone className="w-7 h-7 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-lg font-serif text-foreground">
                              Install Muslim Focus
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Add to your home screen
                            </p>
                          </div>
                        </div>

                        {/* iOS Instructions */}
                        <div className="space-y-4 mb-6">
                          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-semibold text-sm">
                              1
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-foreground">
                                Tap the <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-muted rounded text-xs font-medium"><Share className="w-3 h-3" /> Share</span> button
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-semibold text-sm">
                              2
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-foreground">
                                Scroll and tap <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-muted rounded text-xs font-medium"><Plus className="w-3 h-3" /> Add to Home Screen</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-semibold text-sm">
                              3
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-foreground">
                                Tap <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">Add</span> to confirm
                              </p>
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={handleIOSInstructions}
                          className="w-full h-12 text-base shadow-lg"
                        >
                          Got it, thanks!
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="prompt"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-5">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                            className="p-3 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl"
                          >
                            <Smartphone className="w-7 h-7 text-primary" />
                          </motion.div>
                          <div>
                            <h3 className="text-lg font-serif text-foreground">
                              Install Muslim Focus
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Get the full app experience
                            </p>
                          </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-3 mb-6">
                          {FEATURES.map((feature, index) => (
                            <motion.div
                              key={feature.text}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 + index * 0.1 }}
                              className="flex items-center gap-3"
                            >
                              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <feature.icon className="w-4 h-4 text-primary" />
                              </div>
                              <span className="text-sm text-foreground">{feature.text}</span>
                            </motion.div>
                          ))}
                        </div>

                        {/* CTA */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="space-y-3"
                        >
                          <Button
                            onClick={handleInstall}
                            className="w-full h-12 text-base shadow-lg shadow-primary/20"
                          >
                            <Download className="w-5 h-5 mr-2" />
                            Install App
                          </Button>
                          <button
                            onClick={handleDismiss}
                            className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Maybe later
                          </button>
                        </motion.div>

                        {/* Trust indicator */}
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.7 }}
                          className="text-xs text-center text-muted-foreground mt-4"
                        >
                          ✨ Free • No ads • Privacy focused
                        </motion.p>
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