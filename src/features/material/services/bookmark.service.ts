import { readJson, writeJson, STORAGE_KEYS } from '@/lib/storage/localStore';
import { getBrowserId } from '@/features/participant/participant.service';

/** Bookmark bab, per peserta (browser). Struktur: { [browserId]: chapterId[] } */
type BookmarkMap = Record<string, string[]>;

function readAll(): BookmarkMap {
  return readJson<BookmarkMap>(STORAGE_KEYS.bookmarks, {});
}

export function listBookmarks(): string[] {
  return readAll()[getBrowserId()] ?? [];
}

export function isBookmarked(chapterId: string): boolean {
  return listBookmarks().includes(chapterId);
}

export function toggleBookmark(chapterId: string): boolean {
  const all = readAll();
  const bid = getBrowserId();
  const current = all[bid] ?? [];
  const exists = current.includes(chapterId);
  all[bid] = exists
    ? current.filter((id) => id !== chapterId)
    : [...current, chapterId];
  writeJson(STORAGE_KEYS.bookmarks, all);
  return !exists;
}
