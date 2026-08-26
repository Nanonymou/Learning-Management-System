/**
 * Tipe domain aplikasi (selaras dengan skema Supabase di supabase/migrations).
 * Dipakai lintas fitur. Pada tahap ini data disimpan lokal (localStorage)
 * melalui service; struktur tetap sama saat pindah ke Supabase.
 */

export type QuizStatus = 'lulus' | 'tidak_lulus';

export interface Position {
  id: string;
  name: string;
  isActive: boolean;
}

export interface Location {
  id: string;
  name: string;
  isActive: boolean;
}

export interface User {
  id: string;
  /** Penanda peserta per-browser (pengganti auth pada tahap lokal). */
  browserId: string;
  fullName: string;
  positionId: string | null;
  locationId: string | null;
  createdAt: string;
}

export interface Attendance {
  id: string;
  userId: string;
  fullName: string;
  positionId: string | null;
  locationId: string | null;
  positionName: string;
  locationName: string;
  attendDate: string; // YYYY-MM-DD
  attendTime: string; // HH:mm
  createdAt: string;
}

export interface Question {
  id: string;
  chapterRef: string;
  questionText: string;
  explanation: string;
  options: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

/** Soal yang disajikan ke peserta — TANPA kunci jawaban. */
export interface ExamQuestion {
  id: string;
  questionText: string;
  options: { id: string; text: string }[];
}

export interface QuizResult {
  id: string;
  userId: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  status: QuizStatus;
  attemptNo: number;
  startedAt: string;
  finishedAt: string;
  createdAt: string;
}

export interface QuizAnswerDetail {
  questionId: string;
  questionText: string;
  explanation: string;
  selectedOptionId: string | null;
  selectedText: string;
  correctText: string;
  isCorrect: boolean;
}

export interface QuizReview extends QuizResult {
  answers: QuizAnswerDetail[];
}

export interface Certificate {
  id: string;
  userId: string;
  quizResultId: string;
  certificateNumber: string;
  trainingName: string;
  participantName: string;
  positionName: string;
  locationName: string;
  score: number;
  qrPayload: string;
  issuedDate: string;
  createdAt: string;
}

export const PASSING_GRADE = 80;
export const EXAM_QUESTION_COUNT = 10;
export const EXAM_DURATION_SEC = 15 * 60;
