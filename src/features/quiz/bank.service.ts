import type { Question } from '@/types/domain';
import { readCollection, writeCollection, STORAGE_KEYS } from '@/lib/storage/localStore';
import { uid } from '@/lib/utils/id';
import { questionBank as defaultBank } from './data/questionBank';

/**
 * Manajemen Bank Soal (dapat dikelola admin).
 *
 * Sumber: localStorage, di-seed dari bank bawaan (data/questionBank.ts) pada
 * pemakaian pertama. Ujian mengambil soal dari sini sehingga perubahan admin
 * langsung berlaku.
 */

export function getQuestions(): Question[] {
  const stored = readCollection<Question>(STORAGE_KEYS.questionBank);
  if (stored.length > 0) return stored;
  writeCollection(STORAGE_KEYS.questionBank, defaultBank);
  return defaultBank;
}

function persist(questions: Question[]): void {
  writeCollection(STORAGE_KEYS.questionBank, questions);
}

export interface QuestionInput {
  questionText: string;
  chapterRef: string;
  explanation: string;
  options: { text: string; isCorrect: boolean }[];
}

function toQuestion(id: string, input: QuestionInput): Question {
  return {
    id,
    chapterRef: input.chapterRef.trim(),
    questionText: input.questionText.trim(),
    explanation: input.explanation.trim(),
    options: input.options.map((o, i) => ({
      id: `${id}-o${i + 1}`,
      text: o.text.trim(),
      isCorrect: o.isCorrect,
    })),
  };
}

export type BankResult = { ok: true; question: Question } | { ok: false; error: string };

function validate(input: QuestionInput): string | null {
  if (!input.questionText.trim()) return 'Pertanyaan wajib diisi.';
  const filled = input.options.filter((o) => o.text.trim());
  if (filled.length < 2) return 'Minimal 2 pilihan jawaban.';
  if (!input.options.some((o) => o.isCorrect && o.text.trim()))
    return 'Tandai satu jawaban yang benar.';
  return null;
}

export function addQuestion(input: QuestionInput): BankResult {
  const err = validate(input);
  if (err) return { ok: false, error: err };
  const question = toQuestion(uid(), {
    ...input,
    options: input.options.filter((o) => o.text.trim()),
  });
  persist([...getQuestions(), question]);
  return { ok: true, question };
}

export function updateQuestion(id: string, input: QuestionInput): BankResult {
  const err = validate(input);
  if (err) return { ok: false, error: err };
  const question = toQuestion(id, {
    ...input,
    options: input.options.filter((o) => o.text.trim()),
  });
  persist(getQuestions().map((q) => (q.id === id ? question : q)));
  return { ok: true, question };
}

export function deleteQuestion(id: string): void {
  persist(getQuestions().filter((q) => q.id !== id));
}

/** Kembalikan bank soal ke bawaan. */
export function resetBank(): void {
  writeCollection(STORAGE_KEYS.questionBank, defaultBank);
}

export function questionCount(): number {
  return getQuestions().length;
}
