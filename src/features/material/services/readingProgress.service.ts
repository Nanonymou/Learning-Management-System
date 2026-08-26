import { readJson, writeJson, STORAGE_KEYS } from '@/lib/storage/localStore';
import { getBrowserId } from '@/features/participant/participant.service';
import { getChapters } from './material.service';

/**
 * Progres membaca materi per bab, disimpan otomatis per browser (peserta).
 * Struktur: { [browserId]: { [chapterId]: boolean(selesai) } }
 */
type ProgressMap = Record<string, Record<string, boolean>>;

function readAll(): ProgressMap {
  return readJson<ProgressMap>(STORAGE_KEYS.readingProgress, {});
}

function currentMap(): Record<string, boolean> {
  return readAll()[getBrowserId()] ?? {};
}

export function isChapterRead(chapterId: string): boolean {
  return Boolean(currentMap()[chapterId]);
}

export function markChapterRead(chapterId: string, read = true): void {
  const all = readAll();
  const bid = getBrowserId();
  all[bid] = { ...(all[bid] ?? {}), [chapterId]: read };
  writeJson(STORAGE_KEYS.readingProgress, all);
}

export interface ReadingSummary {
  totalChapters: number;
  readChapters: number;
  percent: number;
  completed: boolean;
}

export function getReadingSummary(): ReadingSummary {
  const chapters = getChapters();
  const map = currentMap();
  const read = chapters.filter((c) => map[c.id]).length;
  const total = chapters.length;
  const percent = total === 0 ? 0 : Math.round((read / total) * 100);
  return {
    totalChapters: total,
    readChapters: read,
    percent,
    completed: total > 0 && read === total,
  };
}
