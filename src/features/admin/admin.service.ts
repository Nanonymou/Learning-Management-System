import type { Attendance, Certificate, QuizResult, User } from '@/types/domain';
import { listUsers, deleteUser } from '@/features/participant/participant.service';
import {
  listAttendance,
  attendanceForUser,
  removeAttendanceForUser,
} from '@/features/attendance/attendance.service';
import {
  resultsForUser,
  bestResult,
  resetResultsForUser,
} from '@/features/quiz/quiz.service';
import {
  certificatesForUser,
  removeCertificatesForUser,
} from '@/features/certificate/certificate.service';
import { positionName, locationName } from '@/features/master/master.service';
import { formatDate } from '@/lib/utils/format';

/** Baris laporan peserta (dipakai tabel admin & export). */
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

export function getReportRows(): ReportRow[] {
  return listUsers().map((u) => {
    const attendance = attendanceForUser(u.id);
    const results = resultsForUser(u.id);
    const best = bestResult(u.id);
    const cert = certificatesForUser(u.id)[0];
    const lastAttend = attendance[attendance.length - 1];
    return {
      userId: u.id,
      name: u.fullName || '(tanpa nama)',
      position: positionName(u.positionId),
      location: locationName(u.locationId),
      date: lastAttend ? formatDate(lastAttend.attendDate) : '-',
      score: best ? String(best.score) : '-',
      status: best ? (best.status === 'lulus' ? 'Lulus' : 'Tidak Lulus') : 'Belum Ujian',
      certificateNumber: cert?.certificateNumber ?? '-',
      attempts: results.length,
    };
  });
}

/** Seluruh daftar hadir (semua peserta), terbaru dahulu. */
export function getAllAttendance(): (Attendance & { positionLabel: string; locationLabel: string })[] {
  return [...listAttendance()]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((a) => ({
      ...a,
      positionLabel: a.positionName || positionName(a.positionId),
      locationLabel: a.locationName || locationName(a.locationId),
    }));
}

/** Detail lengkap satu peserta untuk halaman riwayat admin. */
export interface ParticipantDetail {
  user: User;
  attendance: Attendance[];
  results: QuizResult[];
  certificate: Certificate | undefined;
}

export function getParticipantDetail(userId: string): ParticipantDetail | undefined {
  const user = listUsers().find((u) => u.id === userId);
  if (!user) return undefined;
  return {
    user,
    attendance: attendanceForUser(userId).sort((a, b) =>
      b.attendDate.localeCompare(a.attendDate),
    ),
    results: resultsForUser(userId),
    certificate: certificatesForUser(userId)[0],
  };
}

/** Reset hasil ujian peserta (hasil + sertifikat terkait). */
export function resetParticipantResults(userId: string): void {
  resetResultsForUser(userId);
  removeCertificatesForUser(userId);
}

/** Hapus peserta beserta seluruh datanya. */
export function deleteParticipant(userId: string): void {
  removeAttendanceForUser(userId);
  resetResultsForUser(userId);
  removeCertificatesForUser(userId);
  deleteUser(userId);
}
