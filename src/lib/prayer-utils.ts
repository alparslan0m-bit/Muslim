import { Prayer } from 'adhan';

export function prayerNameToString(prayer: Prayer): string {
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
