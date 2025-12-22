import { useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import { X, Download, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    setIsStandalone(isStandalone || isInWebAppiOS);

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show prompt after some user interaction (e.g., after 30 seconds)
      setTimeout(() => {
        if (!isStandalone && !localStorage.getItem('installPromptDismissed')) {
          setShowPrompt(true);
        }
      }, 30000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show instructions
    if (isIOS && !isInWebAppiOS && !localStorage.getItem('iosInstallInstructionsShown')) {
      setTimeout(() => setShowPrompt(true), 15000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }

      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptDismissed', 'true');
  };

  const handleIOSInstructions = () => {
    setShowPrompt(false);
    localStorage.setItem('iosInstallInstructionsShown', 'true');
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <div className={cn(
        "bg-white/95 backdrop-blur-md border border-primary/20 rounded-2xl p-4 shadow-lg",
        "animate-in slide-in-from-bottom-4 duration-300"
      )}>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-xl flex-shrink-0">
            <Smartphone className="w-5 h-5 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm">
              Install Muslim Focus
            </h3>

            {isIOS ? (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground mb-3">
                  Tap the share button <span className="inline-block w-4 h-4 bg-gray-200 rounded text-xs text-center">⬆️</span> then "Add to Home Screen"
                </p>
                <Button
                  onClick={handleIOSInstructions}
                  size="sm"
                  className="w-full text-xs h-8"
                >
                  Got it
                </Button>
              </div>
            ) : (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground mb-3">
                  Install our app for the best experience with offline access and notifications.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleInstall}
                    size="sm"
                    className="flex-1 text-xs h-8"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Install
                  </Button>
                  <Button
                    onClick={handleDismiss}
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 px-3"
                  >
                    Later
                  </Button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleDismiss}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}