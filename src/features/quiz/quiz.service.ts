import {
  type ExamQuestion,
  type QuizAnswerDetail,
  type QuizResult,
  type QuizReview,
  EXAM_QUESTION_COUNT,
  PASSING_GRADE,
} from '@/types/domain';
import {
  readCollection,
  writeCollection,
  readJson,
  writeJson,
  STORAGE_KEYS,
} from '@/lib/storage/localStore';
import { uid } from '@/lib/utils/id';
import { shuffle } from '@/lib/utils/format';
import { questionBank } from './data/questionBank';

/** Ujian: seleksi soal acak, penilaian, dan pembahasan. */

const LAST_SET_KEY = 'lastExamSet';
type LastSetMap = Record<string, string[]>;
type AnswersMap = Record<string, QuizAnswerDetail[]>;

export interface ExamSession {
  startedAt: string;
  durationSec: number;
  questions: ExamQuestion[];
}

/**
 * Mulai ujian: pilih 10 soal acak (opsi diacak, tanpa kunci jawaban).
 * Retry memakai set soal berbeda dari percobaan sebelumnya bila memungkinkan.
 */
export function startExam(userId: string): ExamSession {
  const lastMap = readJson<LastSetMap>(LAST_SET_KEY, {});
  const previous = new Set(lastMap[userId] ?? []);

  let pool = questionBank.filter((q) => !previous.has(q.id));
  if (pool.length < EXAM_QUESTION_COUNT) pool = [...questionBank];

  const picked = shuffle(pool).slice(0, EXAM_QUESTION_COUNT);
  lastMap[userId] = picked.map((q) => q.id);
  writeJson(LAST_SET_KEY, lastMap);

  const questions: ExamQuestion[] = picked.map((q) => ({
    id: q.id,
    questionText: q.questionText,
    options: shuffle(q.options).map((o) => ({ id: o.id, text: o.text })),
  }));

  return {
    startedAt: new Date().toISOString(),
    durationSec: 15 * 60,
    questions,
  };
}

export interface SubmitInput {
  userId: string;
  startedAt: string;
  answers: { questionId: string; selectedOptionId: string | null }[];
}

/** Nilai jawaban di sisi service (kunci jawaban tak pernah ke UI ujian). */
export function submitExam(input: SubmitInput): QuizResult {
  const details: QuizAnswerDetail[] = input.answers.map((a) => {
    const q = questionBank.find((x) => x.id === a.questionId)!;
    const correct = q.options.find((o) => o.isCorrect)!;
    const selected = q.options.find((o) => o.id === a.selectedOptionId) ?? null;
    return {
      questionId: q.id,
      questionText: q.questionText,
      explanation: q.explanation,
      selectedOptionId: a.selectedOptionId,
      selectedText: selected?.text ?? '(tidak dijawab)',
      correctText: correct.text,
      isCorrect: Boolean(selected?.isCorrect),
    };
  });

  const total = input.answers.length;
  const correctCount = details.filter((d) => d.isCorrect).length;
  const score = total === 0 ? 0 : Math.round((correctCount / total) * 100);

  const attemptNo =
    resultsForUser(input.userId).length + 1;

  const result: QuizResult = {
    id: uid(),
    userId: input.userId,
    score,
    totalQuestions: total,
    correctCount,
    wrongCount: total - correctCount,
    status: score >= PASSING_GRADE ? 'lulus' : 'tidak_lulus',
    attemptNo,
    startedAt: input.startedAt,
    finishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  writeCollection(STORAGE_KEYS.quizResults, [...listResults(), result]);
  const answersMap = readJson<AnswersMap>(STORAGE_KEYS.quizAnswers, {});
  answersMap[result.id] = details;
  writeJson(STORAGE_KEYS.quizAnswers, answersMap);

  return result;
}

export function listResults(): QuizResult[] {
  return readCollection<QuizResult>(STORAGE_KEYS.quizResults);
}

export function resultsForUser(userId: string): QuizResult[] {
  return listResults()
    .filter((r) => r.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getResult(resultId: string): QuizResult | undefined {
  return listResults().find((r) => r.id === resultId);
}

export function getReview(resultId: string): QuizReview | undefined {
  const result = getResult(resultId);
  if (!result) return undefined;
  const answersMap = readJson<AnswersMap>(STORAGE_KEYS.quizAnswers, {});
  return { ...result, answers: answersMap[resultId] ?? [] };
}

/** Peserta pernah lulus? */
export function hasPassed(userId: string): boolean {
  return resultsForUser(userId).some((r) => r.status === 'lulus');
}

export function bestResult(userId: string): QuizResult | undefined {
  return resultsForUser(userId).sort((a, b) => b.score - a.score)[0];
}

/** Reset seluruh hasil ujian milik peserta (admin). */
export function resetResultsForUser(userId: string): void {
  writeCollection(
    STORAGE_KEYS.quizResults,
    listResults().filter((r) => r.userId !== userId),
  );
  const lastMap = readJson<LastSetMap>(LAST_SET_KEY, {});
  delete lastMap[userId];
  writeJson(LAST_SET_KEY, lastMap);
}

export function questionBankSize(): number {
  return questionBank.length;
}
