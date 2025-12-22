import { useEffect, useCallback } from 'react';
import {
  hapticPatterns,
  isAppInstalled,
  getPlatformInfo,
  getConnectionQuality,
  requestNotificationPermission,
  sendNotification,
  requestWakeLock,
} from '@/lib/pwa-utils';

/**
 * Hook to enable haptic feedback on elements
 */
export function useHapticFeedback() {
  return {
    tap: hapticPatterns.tap,
    doubleTap: hapticPatterns.doubleTap,
    success: hapticPatterns.success,
    error: hapticPatterns.error,
    heavyPress: hapticPatterns.heavyPress,
    longPress: hapticPatterns.longPress,
    selection: hapticPatterns.selection,
    focusStart: hapticPatterns.focusStart,
    focusEnd: hapticPatterns.focusEnd,
    prayerTime: hapticPatterns.prayerTime,
  };
}

/**
 * Hook to check if app is installed
 */
export function usePWAInstalled() {
  return isAppInstalled();
}

/**
 * Hook to get platform information
 */
export function usePlatformInfo() {
  return getPlatformInfo();
}

/**
 * Hook to monitor connection quality
 */
export function useConnectionQuality() {
  const quality = getConnectionQuality();

  useEffect(() => {
    if (!navigator.connection) return;

    const connection = navigator.connection as any;
    const handleChange = () => {
      // Trigger re-render
    };

    connection.addEventListener('change', handleChange);
    return () => connection.removeEventListener('change', handleChange);
  }, []);

  return quality;
}

/**
 * Hook to setup focus session with wake lock and notifications
 */
export function useFocusSession() {
  const haptic = useHapticFeedback();

  const startSession = useCallback(async () => {
    haptic.focusStart();

    // Request wake lock to keep screen on
    try {
      await requestWakeLock();
    } catch (error) {
      console.log('Wake lock not available');
    }

    // Request notification permission
    const permission = await requestNotificationPermission();
    if (permission === 'granted') {
      // Send notification
      await sendNotification('Focus Session Started', {
        body: 'Stay focused and blessed. الله معك',
        badge: '/icons/icon-96x96.png',
        tag: 'focus-session',
      });
    }
  }, [haptic]);

  const endSession = useCallback(async () => {
    haptic.focusEnd();

    // Release wake lock
    if (navigator.wakeLock) {
      try {
        // The wake lock is automatically released when the page goes hidden
        // But we can manually release it here if needed
      } catch (error) {
        console.log('Error releasing wake lock');
      }
    }

    // Send completion notification
    const permission = window.Notification?.permission;
    if (permission === 'granted') {
      await sendNotification('Focus Session Complete! 🎉', {
        body: 'Great work maintaining your focus',
        badge: '/icons/icon-96x96.png',
        tag: 'focus-session',
      });
    }
  }, [haptic]);

  return { startSession, endSession };
}

/**
 * Hook to detect app installation prompt
 */
export function useInstallPrompt() {
  const isInstalled = usePWAInstalled();
  const platform = usePlatformInfo();

  return {
    isInstalled,
    shouldShowPrompt: !isInstalled && platform.isMobile,
    platform,
  };
}

/**
 * Hook to enable premium PWA gestures
 */
export function usePWAGestures() {
  const haptic = useHapticFeedback();

  const setupSwipeGesture = useCallback((
    element: HTMLElement | null,
    onSwipe: (direction: 'left' | 'right' | 'up' | 'down') => void
  ) => {
    if (!element) return;

    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const diffX = touchStartX - touchEndX;
      const diffY = touchStartY - touchEndY;
      const threshold = 50;

      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > threshold) {
          haptic.selection();
          onSwipe(diffX > 0 ? 'left' : 'right');
        }
      } else {
        if (Math.abs(diffY) > threshold) {
          haptic.selection();
          onSwipe(diffY > 0 ? 'up' : 'down');
        }
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [haptic]);

  const setupLongPress = useCallback((
    element: HTMLElement | null,
    onLongPress: () => void,
    duration = 500
  ) => {
    if (!element) return;

    let timeoutId: NodeJS.Timeout | null = null;

    const handlePointerDown = () => {
      timeoutId = setTimeout(() => {
        haptic.longPress();
        onLongPress();
      }, duration);
    };

    const handlePointerUp = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    element.addEventListener('pointerdown', handlePointerDown, { passive: true });
    element.addEventListener('pointerup', handlePointerUp, { passive: true });
    element.addEventListener('pointercancel', handlePointerUp, { passive: true });

    return () => {
      element.removeEventListener('pointerdown', handlePointerDown);
      element.removeEventListener('pointerup', handlePointerUp);
      element.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [haptic]);

  return {
    setupSwipeGesture,
    setupLongPress,
    triggerHaptic: haptic,
  };
}
