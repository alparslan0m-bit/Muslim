import { useState, useEffect } from 'react';
import { Coordinates, CalculationMethod, PrayerTimes, Prayer } from 'adhan';

export interface PrayerInfo {
  name: string;
  time: Date;
  nextPrayerName: string;
  nextPrayerTime: Date;
  isPrayerTimeNow: boolean; // Simple check if we are within X minutes of a prayer
}

export function usePrayerTimes() {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [prayerInfo, setPrayerInfo] = useState<PrayerInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Get Location with timeout
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    let timeoutId: NodeJS.Timeout;
    const handleSuccess = (position: GeolocationPosition) => {
      clearTimeout(timeoutId);
      setCoords(new Coordinates(position.coords.latitude, position.coords.longitude));
      setLoading(false);
    };

    const handleError = (err: GeolocationPositionError) => {
      clearTimeout(timeoutId);
      setError("Unable to retrieve your location. Please enable location access.");
      setLoading(false);
      console.error(err);
    };

    // Set 10 second timeout for geolocation
    timeoutId = setTimeout(() => {
      setError("Location request timed out. Please enable location access.");
      setLoading(false);
    }, 10000);

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError);

    return () => clearTimeout(timeoutId);
  }, []);

  // 2. Calculate Times
  useEffect(() => {
    if (!coords) return;

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

      setPrayerInfo({
        name: current === Prayer.None ? 'Isha' : prayerNameToString(current),
        time: new Date(), // Just placeholder for now
        nextPrayerName,
        nextPrayerTime: nextPrayerTime!,
        isPrayerTimeNow
      });
    };

    calculate();
    // Recalculate every minute
    const interval = setInterval(calculate, 60000);
    return () => clearInterval(interval);

  }, [coords]);

  return { prayerInfo, error, loading, coords };
}

function prayerNameToString(prayer: Prayer): string {
  switch (prayer) {
    case Prayer.Fajr: return 'Fajr';
    case Prayer.Sunrise: return 'Sunrise';
    case Prayer.Dhuhr: return 'Dhuhr';
    case Prayer.Asr: return 'Asr';
    case Prayer.Maghrib: return 'Maghrib';
    case Prayer.Isha: return 'Isha';
    default: return 'None';
  }
}
