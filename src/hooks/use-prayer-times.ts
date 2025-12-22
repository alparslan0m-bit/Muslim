import { useState, useEffect } from 'react';
import { Coordinates, CalculationMethod, PrayerTimes, Prayer } from 'adhan';
import { prayerNameToString } from '@/lib/prayer-utils';

export interface PrayerInfo {
  name: string;
  time: Date;
  nextPrayerName: string;
  nextPrayerTime: Date;
  isPrayerTimeNow: boolean; // Simple check if we are within X minutes of a prayer
}

// Cache for prayer times to avoid recalculation
const prayerCache = new Map<string, PrayerInfo>();

export function usePrayerTimes() {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [prayerInfo, setPrayerInfo] = useState<PrayerInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Changed from true to false - don't block initial render

  // 1. Get Location with shorter timeout and non-blocking
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    let timeoutId: NodeJS.Timeout;
    const handleSuccess = (position: GeolocationPosition) => {
      clearTimeout(timeoutId);
      setCoords(new Coordinates(position.coords.latitude, position.coords.longitude));
      setError(null); // Clear any previous errors
      setLoading(false);
    };

    const handleError = (err: GeolocationPositionError) => {
      clearTimeout(timeoutId);
      setError("Unable to retrieve your location. Please enable location access.");
      setLoading(false);
      console.error(err);
    };

    // Set shorter 5 second timeout and start loading
    setLoading(true);
    timeoutId = setTimeout(() => {
      setError("Location request timed out. Using default location.");
      setLoading(false);
      // Set default coordinates (Mecca) as fallback
      setCoords(new Coordinates(21.4225, 39.8262));
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

    const cacheKey = `${coords.latitude},${coords.longitude}`;
    const cached = prayerCache.get(cacheKey);
    
    // If we have cached data and it's less than 1 hour old, use it
    if (cached && (Date.now() - cached.time.getTime()) < 3600000) {
      setPrayerInfo(cached);
      return;
    }

    const calculate = () => {
      const date = new Date();
      const params = CalculationMethod.MuslimWorldLeague();
      const prayerTimes = new PrayerTimes(coords, date, params);

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
        const diffMinutes = (now.getTime() - currentPrayerTime.getTime()) / 1000 / 60;
        if (diffMinutes >= 0 && diffMinutes < 20) {
          isPrayerTimeNow = true;
        }
      }

      const newPrayerInfo = {
        name: current === Prayer.None ? 'Isha' : prayerNameToString(current),
        time: now,
        nextPrayerName,
        nextPrayerTime: nextPrayerTime!,
        isPrayerTimeNow
      };

      // Cache the result
      prayerCache.set(cacheKey, newPrayerInfo);
      setPrayerInfo(newPrayerInfo);
    };

    calculate();
    // Recalculate every minute
    const interval = setInterval(calculate, 60000);
    return () => clearInterval(interval);

  }, [coords]);

  return { prayerInfo, error, loading, coords };
}
