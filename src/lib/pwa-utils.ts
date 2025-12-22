/**
 * Premium PWA Utilities
 * Haptic feedback, gestures, and enhanced interactions
 */

/**
 * Haptic Feedback Patterns
 */
export const hapticPatterns = {
  // Light, quick feedback
  tap: () => {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  },

  // Double tap feedback
  doubleTap: () => {
    if (navigator.vibrate) {
      navigator.vibrate([10, 20, 10]);
    }
  },

  // Success feedback
  success: () => {
    if (navigator.vibrate) {
      navigator.vibrate([0, 10, 5, 10]);
    }
  },

  // Error/warning feedback
  error: () => {
    if (navigator.vibrate) {
      navigator.vibrate([50, 50, 50]);
    }
  },

  // Heavy press feedback
  heavyPress: () => {
    if (navigator.vibrate) {
      navigator.vibrate([20, 30, 20]);
    }
  },

  // Long press feedback
  longPress: () => {
    if (navigator.vibrate) {
      navigator.vibrate([40, 20, 40]);
    }
  },

  // Selection feedback
  selection: () => {
    if (navigator.vibrate) {
      navigator.vibrate(15);
    }
  },

  // Focus session start
  focusStart: () => {
    if (navigator.vibrate) {
      navigator.vibrate([0, 15, 10, 15, 10, 15]);
    }
  },

  // Focus session end
  focusEnd: () => {
    if (navigator.vibrate) {
      navigator.vibrate([30, 20, 30]);
    }
  },

  // Prayer time alert
  prayerTime: () => {
    if (navigator.vibrate) {
      navigator.vibrate([0, 20, 15, 20, 15, 20]);
    }
  },
};

/**
 * Gesture Detection
 */
export function setupGestureDetection(element: HTMLElement) {
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  const handleSwipe = (direction: 'left' | 'right' | 'up' | 'down') => {
    // Dispatch custom event for swipe
    element.dispatchEvent(
      new CustomEvent('swipe', {
        detail: { direction },
        bubbles: true,
        cancelable: true,
      })
    );
  };

  element.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  });

  element.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleGesture();
  });

  const handleGesture = () => {
    const swipeThreshold = 50;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (Math.abs(diffX) > swipeThreshold) {
        if (diffX > 0) {
          handleSwipe('left');
        } else {
          handleSwipe('right');
        }
      }
    } else {
      if (Math.abs(diffY) > swipeThreshold) {
        if (diffY > 0) {
          handleSwipe('up');
        } else {
          handleSwipe('down');
        }
      }
    }
  };
}

/**
 * Long Press Detection Hook
 */
export function useLongPress(onLongPress: () => void, duration = 500) {
  let timeoutId: NodeJS.Timeout | null = null;

  const handleMouseDown = () => {
    timeoutId = setTimeout(() => {
      onLongPress();
      hapticPatterns.longPress();
    }, duration);
  };

  const handleMouseUp = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return {
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseLeave,
    onTouchStart: handleMouseDown,
    onTouchEnd: handleMouseUp,
    onTouchCancel: handleMouseLeave,
  };
}

/**
 * App Installation Check
 */
export function isAppInstalled(): boolean {
  const standaloneCheck = window.matchMedia('(display-mode: standalone)').matches;
  const isInWebAppiOS = (window.navigator as any).standalone === true;
  return standaloneCheck || isInWebAppiOS;
}

/**
 * Get Platform Info
 */
export function getPlatformInfo() {
  const userAgent = navigator.userAgent.toLowerCase();
  return {
    isIOS: /iphone|ipad|ipod/.test(userAgent),
    isAndroid: /android/.test(userAgent),
    isMobile: /mobile|android|iphone/.test(userAgent),
    isTablet: /ipad|android(?!.*mobi)/.test(userAgent),
    isDesktop: !(/mobile|android|iphone/.test(userAgent)),
  };
}

/**
 * Connection Quality
 */
export function getConnectionQuality(): 'excellent' | 'good' | 'fair' | 'poor' {
  if (!navigator.connection) return 'good';

  const connection = (navigator as any).connection;
  if (!connection.effectiveType) return 'good';

  const effectiveType = connection.effectiveType;
  switch (effectiveType) {
    case '4g':
      return 'excellent';
    case '3g':
      return 'good';
    case '2g':
      return 'fair';
    case 'slow-2g':
      return 'poor';
    default:
      return 'good';
  }
}

/**
 * Battery Status (if available)
 */
export async function getBatteryStatus() {
  if (!navigator.getBattery) {
    return null;
  }

  try {
    const battery = await navigator.getBattery?.();
    return {
      level: battery?.level,
      charging: battery?.charging,
      chargingTime: battery?.chargingTime,
      dischargingTime: battery?.dischargingTime,
    };
  } catch (error) {
    console.error('Failed to get battery status:', error);
    return null;
  }
}

/**
 * Request Persistent Storage
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (!navigator.storage?.persist) {
    return false;
  }

  try {
    const result = await navigator.storage.persist();
    console.log(`Persistent storage ${result ? 'granted' : 'denied'}`);
    return result;
  } catch (error) {
    console.error('Failed to request persistent storage:', error);
    return false;
  }
}

/**
 * Check Storage Quota
 */
export async function getStorageQuota() {
  if (!navigator.storage?.estimate) {
    return null;
  }

  try {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage,
      quota: estimate.quota,
      percentage: (estimate.usage / estimate.quota) * 100,
    };
  } catch (error) {
    console.error('Failed to get storage quota:', error);
    return null;
  }
}

/**
 * Share API Integration
 */
export async function shareContent(data: ShareData): Promise<boolean> {
  if (!navigator.share) {
    return false;
  }

  try {
    await navigator.share(data);
    return true;
  } catch (error) {
    if (error instanceof Error && error.name !== 'AbortError') {
      console.error('Share failed:', error);
    }
    return false;
  }
}

/**
 * Clipboard API
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    hapticPatterns.success();
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    hapticPatterns.error();
    return false;
  }
}

/**
 * Full Screen API
 */
export function requestFullscreen(element: HTMLElement): Promise<void> {
  if (element.requestFullscreen) {
    return element.requestFullscreen();
  } else if ((element as any).webkitRequestFullscreen) {
    return (element as any).webkitRequestFullscreen();
  }
  return Promise.reject(new Error('Fullscreen API not supported'));
}

/**
 * Screen Wake Lock API
 */
export async function requestWakeLock(): Promise<WakeLockSentinel | null> {
  if (!navigator.wakeLock) {
    console.log('Wake Lock API not supported');
    return null;
  }

  try {
    const wakeLock = await navigator.wakeLock.request('screen');
    console.log('Wake Lock acquired');
    return wakeLock;
  } catch (error) {
    console.error('Failed to acquire Wake Lock:', error);
    return null;
  }
}

/**
 * Notification Permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return 'denied';
  }

  if (Notification.permission !== 'default') {
    return Notification.permission;
  }

  return Notification.requestPermission();
}

/**
 * Send Notification
 */
export function sendNotification(
  title: string,
  options?: NotificationOptions
): Promise<void> {
  if (!('Notification' in window)) {
    return Promise.reject(new Error('Notifications not supported'));
  }

  if (Notification.permission === 'granted') {
    if ('serviceWorker' in navigator) {
      return navigator.serviceWorker.ready.then((registration) => {
        return registration.showNotification(title, {
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-96x96.png',
          ...options,
        });
      });
    }
    new Notification(title, options);
    return Promise.resolve();
  }

  return Promise.reject(new Error('Notification permission not granted'));
}

/**
 * Fullscreen change handler
 */
export function setupFullscreenHandler(callback: (isFullscreen: boolean) => void) {
  const handleFullscreenChange = () => {
    const isFullscreen = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement
    );
    callback(isFullscreen);
  };

  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

  return () => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
  };
}
