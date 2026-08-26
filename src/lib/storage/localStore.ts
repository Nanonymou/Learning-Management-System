/**
 * Lapisan penyimpanan lokal (localStorage) — adapter data sementara.
 *
 * Semua service data memakai helper ini sebagai satu-satunya titik akses
 * penyimpanan. Saat pindah ke Supabase, cukup ganti implementasi service
 * (bukan komponen) — kunci arsitektur agar mudah di-swap & scalable.
 */

const PREFIX = 'lms.';

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

/** Baca sebuah koleksi (array). */
export function readCollection<T>(key: string): T[] {
  return readJson<T[]>(key, []);
}

/** Simpan sebuah koleksi (array). */
export function writeCollection<T>(key: string, items: T[]): void {
  writeJson(key, items);
}

export const STORAGE_KEYS = {
  browserId: 'browserId',
  users: 'users',
  attendance: 'attendance',
  readingProgress: 'readingProgress',
  quizResults: 'quizResults',
  quizAnswers: 'quizAnswers',
  certificates: 'certificates',
  positions: 'positions',
  locations: 'locations',
  bookmarks: 'bookmarks',
} as const;
