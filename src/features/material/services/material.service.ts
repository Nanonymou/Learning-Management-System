import type { MaterialChapter } from '../types';
import { foodHandlerMaterial } from '../data/foodHandlerMaterial';

/**
 * Sumber materi. Saat ini dari dataset hasil ingest DOCX; saat tahap database
 * cukup ganti implementasi ini agar membaca dari Supabase (material_chapters/
 * material_blocks) — antarmuka tetap sama.
 */
export function getChapters(): MaterialChapter[] {
  return [...foodHandlerMaterial].sort((a, b) => a.order - b.order);
}

export function getChapter(id: string): MaterialChapter | undefined {
  return getChapters().find((c) => c.id === id);
}

export function getChapterCount(): number {
  return foodHandlerMaterial.length;
}

export interface SearchHit {
  chapter: MaterialChapter;
  snippet: string;
}

/** Pencarian sederhana pada judul & isi blok. */
export function searchMaterial(query: string): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const hits: SearchHit[] = [];
  for (const chapter of getChapters()) {
    if (chapter.title.toLowerCase().includes(q)) {
      hits.push({ chapter, snippet: chapter.title });
      continue;
    }
    for (const block of chapter.blocks) {
      const text =
        'text' in block ? block.text : 'items' in block ? block.items.join(' ') : '';
      if (text.toLowerCase().includes(q)) {
        const at = text.toLowerCase().indexOf(q);
        hits.push({
          chapter,
          snippet: `…${text.slice(Math.max(0, at - 24), at + 40)}…`,
        });
        break;
      }
    }
  }
  return hits;
}
