import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './client';
import type {
  Attendance,
  Certificate,
  QuizResult,
  User,
} from '@/types/domain';
import type { CompanySettings } from '@/features/company-settings/types';
import { EMPTY_COMPANY_SETTINGS } from '@/features/company-settings/types';

/**
 * Lapisan sinkronisasi Supabase.
 *
 * Pola: penyimpanan lokal tetap menjadi sumber untuk tampilan peserta itu
 * sendiri (cepat & offline-friendly), sementara data ditulis-tembus
 * (write-through) ke Supabase agar ADMIN dapat melihat SELURUH peserta lintas
 * perangkat. Semua fungsi aman-nol bila Supabase belum dikonfigurasi.
 *
 * Catatan: kolom position_id/location_id sengaja diisi null (memakai kolom
 * *_name hasil denormalisasi 0007) untuk menghindari ketergantungan id master
 * lintas perangkat. Jawaban per-soal (pembahasan) tidak disinkron (hanya
 * relevan bagi peserta ybs & terikat FK bank soal yang berbasis kode).
 */

const AVAILABLE = () => supabase !== null;

/**
 * Akses client tanpa tipe generik untuk operasi dinamis (row berbentuk bebas
 * dengan kolom denormalisasi & FK di-null-kan). Menghindari benturan dengan
 * tipe ketat Database saat insert/upsert bentuk row kustom.
 */
function db(): SupabaseClient {
  return supabase as unknown as SupabaseClient;
}

/* ----------------------------- Mappers -------------------------------- */

type Row = Record<string, unknown>;

function userRow(u: User): Row {
  return {
    id: u.id,
    full_name: u.fullName,
    position_id: null,
    location_id: null,
    position_name: (u as User & { positionName?: string }).positionName ?? '',
    location_name: (u as User & { locationName?: string }).locationName ?? '',
    created_at: u.createdAt,
  };
}

function attendanceRow(a: Attendance): Row {
  return {
    id: a.id,
    user_id: a.userId,
    full_name: a.fullName,
    position_id: null,
    location_id: null,
    position_name: a.positionName,
    location_name: a.locationName,
    attend_date: a.attendDate,
    attend_time: a.attendTime,
    created_at: a.createdAt,
  };
}

function quizResultRow(r: QuizResult, extra: { name: string; pos: string; loc: string }): Row {
  return {
    id: r.id,
    user_id: r.userId,
    score: r.score,
    total_questions: r.totalQuestions,
    correct_count: r.correctCount,
    wrong_count: r.wrongCount,
    status: r.status,
    attempt_no: r.attemptNo,
    started_at: r.startedAt,
    finished_at: r.finishedAt,
    created_at: r.createdAt,
    participant_name: extra.name,
    position_name: extra.pos,
    location_name: extra.loc,
  };
}

function certificateRow(c: Certificate): Row {
  return {
    id: c.id,
    user_id: c.userId,
    // Di-null-kan: sertifikat bersifat mandiri (nama/nilai sudah snapshot),
    // sehingga tidak bergantung pada baris quiz_result yang mungkin belum
    // tersinkron lebih dahulu (menghindari kegagalan FK lintas perangkat).
    quiz_result_id: null,
    certificate_number: c.certificateNumber,
    training_name: c.trainingName,
    participant_name: c.participantName,
    position_name: c.positionName,
    location_name: c.locationName,
    score: c.score,
    qr_payload: c.qrPayload,
    issued_date: c.issuedDate,
    created_at: c.createdAt,
  };
}

function rowToAttendance(r: Row): Attendance {
  return {
    id: String(r.id),
    userId: String(r.user_id ?? ''),
    fullName: String(r.full_name ?? ''),
    positionId: (r.position_id as string) ?? null,
    locationId: (r.location_id as string) ?? null,
    positionName: String(r.position_name ?? ''),
    locationName: String(r.location_name ?? ''),
    attendDate: String(r.attend_date ?? ''),
    attendTime: String(r.attend_time ?? ''),
    createdAt: String(r.created_at ?? ''),
  };
}

function rowToResult(r: Row): QuizResult {
  return {
    id: String(r.id),
    userId: String(r.user_id ?? ''),
    score: Number(r.score ?? 0),
    totalQuestions: Number(r.total_questions ?? 0),
    correctCount: Number(r.correct_count ?? 0),
    wrongCount: Number(r.wrong_count ?? 0),
    status: (r.status as QuizResult['status']) ?? 'tidak_lulus',
    attemptNo: Number(r.attempt_no ?? 1),
    startedAt: String(r.started_at ?? ''),
    finishedAt: String(r.finished_at ?? ''),
    createdAt: String(r.created_at ?? ''),
  };
}

function rowToCertificate(r: Row): Certificate {
  return {
    id: String(r.id),
    userId: String(r.user_id ?? ''),
    quizResultId: String(r.quiz_result_id ?? ''),
    certificateNumber: String(r.certificate_number ?? ''),
    trainingName: String(r.training_name ?? ''),
    participantName: String(r.participant_name ?? ''),
    positionName: String(r.position_name ?? ''),
    locationName: String(r.location_name ?? ''),
    score: Number(r.score ?? 0),
    qrPayload: String(r.qr_payload ?? ''),
    issuedDate: String(r.issued_date ?? ''),
    createdAt: String(r.created_at ?? ''),
  };
}

function rowToUser(r: Row): User {
  return {
    id: String(r.id),
    browserId: '',
    fullName: String(r.full_name ?? ''),
    positionId: (r.position_id as string) ?? null,
    locationId: (r.location_id as string) ?? null,
    createdAt: String(r.created_at ?? ''),
  };
}

/* --------------------------- Write-through ---------------------------- */

/** Semua fungsi write bersifat fire-and-forget & menelan error (best-effort). */
async function safe(fn: () => PromiseLike<unknown>): Promise<void> {
  if (!AVAILABLE()) return;
  try {
    await fn();
  } catch (e) {
    console.warn('[supabase sync] gagal:', e);
  }
}

export function syncUser(u: User & { positionName?: string; locationName?: string }): void {
  void safe(() => db().from('users').upsert(userRow(u)));
}

export function syncAttendance(u: User, a: Attendance): void {
  void safe(async () => {
    await db().from('users').upsert(userRow({ ...u, ...({ positionName: a.positionName, locationName: a.locationName } as object) }));
    await db().from('attendance').upsert(attendanceRow(a));
  });
}

export function syncQuizResult(
  u: User,
  r: QuizResult,
  extra: { name: string; pos: string; loc: string },
): void {
  void safe(async () => {
    await db().from('users').upsert(userRow(u));
    await db().from('quiz_result').upsert(quizResultRow(r, extra));
  });
}

export function syncCertificate(u: User, c: Certificate): void {
  void safe(async () => {
    await db().from('users').upsert(userRow(u));
    await db().from('certificates').upsert(certificateRow(c));
  });
}

export function deleteUserRemote(userId: string): void {
  void safe(() => db().from('users').delete().eq('id', userId));
}

export function resetResultsRemote(userId: string): void {
  void safe(async () => {
    await db().from('certificates').delete().eq('user_id', userId);
    await db().from('quiz_result').delete().eq('user_id', userId);
  });
}

/* ------------------------------ Reads --------------------------------- */

export interface RemoteAdminData {
  users: User[];
  attendance: Attendance[];
  results: QuizResult[];
  certificates: Certificate[];
}

export async function fetchAdminData(): Promise<RemoteAdminData> {
  if (!AVAILABLE()) return { users: [], attendance: [], results: [], certificates: [] };
  const [u, a, r, c] = await Promise.all([
    db().from('users').select('*'),
    db().from('attendance').select('*'),
    db().from('quiz_result').select('*'),
    db().from('certificates').select('*'),
  ]);
  return {
    users: (u.data ?? []).map(rowToUser),
    attendance: (a.data ?? []).map(rowToAttendance),
    results: (r.data ?? []).map(rowToResult),
    certificates: (c.data ?? []).map(rowToCertificate),
  };
}

export async function fetchCertificateByNumber(num: string): Promise<Certificate | null> {
  if (!AVAILABLE()) return null;
  const { data, error } = await db()
    .from('certificates')
    .select('*')
    .eq('certificate_number', num)
    .maybeSingle();
  if (error || !data) return null;
  return rowToCertificate(data as Row);
}

export async function fetchCertificateById(id: string): Promise<Certificate | null> {
  if (!AVAILABLE()) return null;
  const { data, error } = await db()
    .from('certificates')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  return rowToCertificate(data as Row);
}

/* ------------------------- Company Settings --------------------------- */

const CS_MAP: Record<keyof CompanySettings, string> = {
  companyName: 'company_name',
  logoUrl: 'logo_url',
  address: 'address',
  website: 'website',
  email: 'email',
  phone: 'phone',
  trainingName: 'training_name',
  trainingDescription: 'training_description',
  signer1Name: 'signer1_name',
  signer1Title: 'signer1_title',
  signer1SignatureUrl: 'signer1_signature_url',
  signer2Name: 'signer2_name',
  signer2Title: 'signer2_title',
  signer2SignatureUrl: 'signer2_signature_url',
  certificateBackgroundUrl: 'certificate_background_url',
  certificateLogoUrl: 'certificate_logo_url',
};

export async function loadCompanySettingsRemote(): Promise<CompanySettings | null> {
  if (!AVAILABLE()) return null;
  const { data, error } = await db()
    .from('company_settings')
    .select('*')
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  const row = data as Row;
  const result = { ...EMPTY_COMPANY_SETTINGS };
  (Object.keys(CS_MAP) as (keyof CompanySettings)[]).forEach((k) => {
    result[k] = String(row[CS_MAP[k]] ?? '');
  });
  return result;
}

export async function saveCompanySettingsRemote(settings: CompanySettings): Promise<void> {
  if (!AVAILABLE()) return;
  const payload: Row = { is_singleton: true };
  (Object.keys(CS_MAP) as (keyof CompanySettings)[]).forEach((k) => {
    payload[CS_MAP[k]] = settings[k];
  });
  // Singleton: perbarui baris yang ada, atau buat bila belum ada.
  const { data } = await db().from('company_settings').select('id').limit(1).maybeSingle();
  if (data?.id) {
    await db().from('company_settings').update(payload).eq('id', data.id);
  } else {
    await db().from('company_settings').insert(payload);
  }
}
