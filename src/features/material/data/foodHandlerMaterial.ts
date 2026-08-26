import type { MaterialChapter } from '../types';
import raw from './food-handler-material.json';

/**
 * Materi Food Handler — hasil ingest dari file DOCX (scripts/ingest-docx.py).
 * Isi teks tidak diubah (ditampilkan apa adanya). Untuk training lain,
 * ganti file JSON ini dengan hasil ingest DOCX yang bersangkutan.
 */
export const foodHandlerMaterial = raw as unknown as MaterialChapter[];
