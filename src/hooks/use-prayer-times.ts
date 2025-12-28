import { useState, useEffect } from 'react';
import { Coordinates, CalculationMethod, PrayerTimes, Prayer } from 'adhan';
import { prayerNameToString } from '@/lib/prayer-utils';

export interface PrayerInfo {
  name: string;
  time: Date;
  nextPrayerName: string;
  nextPrayerTime: Date;
  isPrayerTimeNow: boolean;
}

// Cache for prayer times with timestamps to avoid recalculation
interface CachedPrayerInfo extends PrayerInfo {
  cachedAt: number; // Timestamp in milliseconds
}

const prayerCache = new Map<string, CachedPrayerInfo>();

// Cache validity duration: 5 minutes
const CACHE_DURATION_MS = 5 * 60 * 1000;

// Default location (Mecca) - can be overridden
const DEFAULT_COORDINATES = {
  latitude: 21.4225,
  longitude: 39.8262,
  label: 'Mecca'
};

// Get user's saved location preference or default
const getDefaultLocation = (): { coords: Coordinates; label: string } => {
  try {
    const saved = localStorage.getItem('prayer_location');
    if (saved) {
      const { latitude, longitude, label } = JSON.parse(saved);
      return {
        coords: new Coordinates(latitude, longitude),
        label: label || 'Saved Location'
      };
    }
  } catch (error) {
    console.error('Failed to load saved location:', error);
  }
  return {
    coords: new Coordinates(DEFAULT_COORDINATES.latitude, DEFAULT_COORDINATES.longitude),
    label: DEFAULT_COORDINATES.label
  };
};

export function usePrayerTimes() {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [prayerInfo, setPrayerInfo] = useState<PrayerInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Start loading immediately
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  // 1. Get Location
  useEffect(() => {
    if (!navigator.geolocation) {
      // If no geo support, fallback immediately
      const fallbackLocation = getDefaultLocation();
      setCoords(fallbackLocation.coords);
      setIsUsingFallback(true);
      return;
    }

    let timeoutId: NodeJS.Timeout;

    const handleSuccess = (position: GeolocationPosition) => {
      clearTimeout(timeoutId);
      const newCoords = new Coordinates(position.coords.latitude, position.coords.longitude);
      setCoords(newCoords);
      setError(null);
      setIsUsingFallback(false);
      // NOTE: We do NOT set loading to false here yet. 
      // We wait until prayer times are calculated in the next effect.
      
      // Save user's location preference
      try {
        localStorage.setItem('prayer_location', JSON.stringify({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          label: 'My Location'
        }));
      } catch (e) {
        console.error('Failed to save location:', e);
      }
    };

    const handleError = (err: GeolocationPositionError) => {
      clearTimeout(timeoutId);
      console.warn('Geolocation error, using fallback:', err);
      // Use fallback location instead of showing error
      const fallbackLocation = getDefaultLocation();
      setCoords(fallbackLocation.coords);
      setIsUsingFallback(true);
      setError(null);
      // Keep loading true until calculation finishes
    };

    // Start loading and request location
    timeoutId = setTimeout(() => {
      // Timeout: use fallback location gracefully
      const fallbackLocation = getDefaultLocation();
      setCoords(fallbackLocation.coords);
      setIsUsingFallback(true);
      setError(null);
    }, 5000);

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 300000 // 5 minutes
    });

    return () => clearTimeout(timeoutId);
  }, []);

  // 2. Calculate Times with caching
  useEffect(() => {
    if (!coords) return; 

    const date = new Date();
    const today = date.toDateString();
    const cacheKey = `${coords.latitude},${coords.longitude},${today}`;
    const cached = prayerCache.get(cacheKey);
    
    // Check if cache is still valid
    if (cached) {
      const cacheAge = Date.now() - cached.cachedAt;
      if (cacheAge < CACHE_DURATION_MS) {
        setPrayerInfo(cached);
        setLoading(false); // Data is ready
        return;
      }
    }

    const calculate = () => {
      try {
        const params = CalculationMethod.MuslimWorldLeague();
        const prayerTimes = new PrayerTimes(coords, new Date(), params);

        const next = prayerTimes.nextPrayer();
        const current = prayerTimes.currentPrayer();
        
        let nextPrayerTime = prayerTimes.timeForPrayer(next);
        let nextPrayerName = prayerNameToString(next);
        
        // If next is None, it means we passed Isha, next is Fajr tomorrow
        if (next === Prayer.None) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowPrayerTimes = new PrayerTimes(coords, tomorrow, params);
          nextPrayerTime = tomorrowPrayerTimes.fajr;
          nextPrayerName = "Fajr";
        }

        // "Time for Salah" logic: if current time is within 15 mins after a prayer start
        const now = new Date();
        let isPrayerTimeNow = false;
        
        if (current !== Prayer.None) {
          const currentPrayerTime = prayerTimes.timeForPrayer(current);
          if (currentPrayerTime) {
             const diffMinutes = (now.getTime() - currentPrayerTime.getTime()) / 1000 / 60;
             if (diffMinutes >= 0 && diffMinutes < 20) {
               isPrayerTimeNow = true;
             }
          }
        }

        const newPrayerInfo: CachedPrayerInfo = {
          name: current === Prayer.None ? 'Isha' : prayerNameToString(current),
          time: now,
          nextPrayerName,
          nextPrayerTime: nextPrayerTime || new Date(), // Fallback safety
          isPrayerTimeNow,
          cachedAt: Date.now()
        };

        // Cache the result
        prayerCache.set(cacheKey, newPrayerInfo);
        setPrayerInfo(newPrayerInfo);
        setError(null);
      } catch (err) {
        console.error("Error calculating prayer times:", err);
        setError("Failed to calculate prayer times");
      } finally {
        setLoading(false); // Calculation done (success or fail)
      }
    };

    calculate();

    // Recalculate every minute (not 5 mins) for accurate "Time Left" and "Current Prayer" states
    const interval = setInterval(calculate, 60000);
    return () => clearInterval(interval);

  }, [coords]);

  return { prayerInfo, error, loading, coords, isUsingFallback };
}
