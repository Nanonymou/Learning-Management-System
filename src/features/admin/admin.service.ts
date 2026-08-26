import type { Attendance, Certificate, QuizResult, User } from '@/types/domain';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { fetchAdminData, deleteUserRemote, resetResultsRemote } from '@/lib/supabase/sync';
import { listUsers, deleteUser } from '@/features/participant/participant.service';
import {
  listAttendance,
  removeAttendanceForUser,
} from '@/features/attendance/attendance.service';
import {
  listResults,
  resetResultsForUser,
} from '@/features/quiz/quiz.service';
import {
  listCertificates,
  removeCertificatesForUser,
} from '@/features/certificate/certificate.service';
import { formatDate } from '@/lib/utils/format';

/**
 * Data untuk area admin. Sumber = Supabase bila dikonfigurasi (seluruh peserta
 * lintas perangkat), jika tidak localStorage (peserta pada perangkat ini).
 */
interface AdminData {
  users: User[];
  attendance: Attendance[];
  results: QuizResult[];
  certificates: Certificate[];
}

async function loadData(): Promise<AdminData> {
  if (isSupabaseConfigured) {
    return fetchAdminData();
  }
  return {
    users: listUsers(),
    attendance: listAttendance(),
    results: listResults(),
    certificates: listCertificates(),
  };
}

function bestOf(results: QuizResult[]): QuizResult | undefined {
  return [...results].sort((a, b) => b.score - a.score)[0];
}

/* ------------------------------ Report -------------------------------- */

export interface ReportRow {
  userId: string;
  name: string;
  position: string;
  location: string;
  date: string;
  score: string;
  status: string;
  certificateNumber: string;
  attempts: number;
}

function composeRows(data: AdminData): ReportRow[] {
  return data.users.map((u) => {
    const att = data.attendance
      .filter((a) => a.userId === u.id)
      .sort((a, b) => b.attendDate.localeCompare(a.attendDate));
    const results = data.results.filter((r) => r.userId === u.id);
    const best = bestOf(results);
    const cert = data.certificates.find((c) => c.userId === u.id);
    const latest = att[0];
    return {
      userId: u.id,
      name: u.fullName || '(tanpa nama)',
      position: latest?.positionName || '-',
      location: latest?.locationName || '-',
      date: latest ? formatDate(latest.attendDate) : '-',
      score: best ? String(best.score) : '-',
      status: best ? (best.status === 'lulus' ? 'Lulus' : 'Tidak Lulus') : 'Belum Ujian',
      certificateNumber: cert?.certificateNumber ?? '-',
      attempts: results.length,
    };
  });
}

export async function getReportRows(): Promise<ReportRow[]> {
  return composeRows(await loadData());
}

/* ---------------------------- Daftar Hadir ---------------------------- */

export async function getAllAttendance(): Promise<Attendance[]> {
  const { attendance } = await loadData();
  return [...attendance].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/* --------------------------- Sertifikat ------------------------------- */

export async function getAllCertificates(): Promise<Certificate[]> {
  const { certificates } = await loadData();
  return [...certificates].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/* --------------------------- Statistik -------------------------------- */

export interface DashboardStats {
  totalParticipants: number;
  totalPassed: number;
  totalFailed: number;
  totalCertificates: number;
  completionRate: number;
  passRate: number;
  byLocation: { label: string; value: number }[];
  byPosition: { label: string; value: number }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const data = await loadData();
  const total = data.users.length;

  const testedIds = new Set(data.results.map((r) => r.userId));
  let passed = 0;
  let failed = 0;
  testedIds.forEach((id) => {
    const best = bestOf(data.results.filter((r) => r.userId === id));
    if (best?.status === 'lulus') passed += 1;
    else failed += 1;
  });

  const tested = testedIds.size;
  return {
    totalParticipants: total,
    totalPassed: passed,
    totalFailed: failed,
    totalCertificates: data.certificates.length,
    completionRate: total === 0 ? 0 : Math.round((passed / total) * 100),
    passRate: tested === 0 ? 0 : Math.round((passed / tested) * 100),
    byLocation: aggregate(data.attendance.map((a) => a.locationName || '-')),
    byPosition: aggregate(data.attendance.map((a) => a.positionName || '-')),
  };
}

function aggregate(values: string[]): { label: string; value: number }[] {
  const map = new Map<string, number>();
  for (const v of values) map.set(v, (map.get(v) ?? 0) + 1);
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

/* ------------------------- Detail Peserta ----------------------------- */

export interface ParticipantDetail {
  user: User;
  attendance: Attendance[];
  results: QuizResult[];
  certificate: Certificate | undefined;
}

export async function getParticipantDetail(
  userId: string,
): Promise<ParticipantDetail | undefined> {
  const data = await loadData();
  const user = data.users.find((u) => u.id === userId);
  if (!user) return undefined;
  return {
    user,
    attendance: data.attendance
      .filter((a) => a.userId === userId)
      .sort((a, b) => b.attendDate.localeCompare(a.attendDate)),
    results: data.results
      .filter((r) => r.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    certificate: data.certificates.find((c) => c.userId === userId),
  };
}

/* ---------------------------- Aksi admin ------------------------------ */

/** Reset hasil ujian peserta (lokal + Supabase). */
export function resetParticipantResults(userId: string): void {
  resetResultsForUser(userId);
  removeCertificatesForUser(userId);
  resetResultsRemote(userId);
}

/** Hapus peserta beserta seluruh datanya (lokal + Supabase). */
export function deleteParticipant(userId: string): void {
  removeAttendanceForUser(userId);
  resetResultsForUser(userId);
  removeCertificatesForUser(userId);
  deleteUser(userId);
  deleteUserRemote(userId);
}
