/** Model materi e-book (hasil ingest DOCX). Ditampilkan apa adanya. */

export type MaterialBlock =
  | { id: string; type: 'heading'; text: string }
  | { id: string; type: 'paragraph'; text: string }
  | { id: string; type: 'quote'; text: string }
  | { id: string; type: 'list_bullet'; items: string[] }
  | { id: string; type: 'list_check'; ok: boolean; items: string[] }
  | { id: string; type: 'temperature'; items: string[] };

export interface MaterialChapter {
  id: string;
  order: number;
  code: string;
  title: string;
  blocks: MaterialBlock[];
}

export interface ChapterProgress {
  chapterId: string;
  progress: number; // 0..100
  completed: boolean;
}
