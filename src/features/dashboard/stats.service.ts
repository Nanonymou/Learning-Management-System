import { listUsers } from '@/features/participant/participant.service';
import { listAttendance } from '@/features/attendance/attendance.service';
import { listResults, bestResult } from '@/features/quiz/quiz.service';
import { listCertificates } from '@/features/certificate/certificate.service';

export interface DashboardStats {
  totalParticipants: number;
  totalPassed: number;
  totalFailed: number;
  totalCertificates: number;
  completionRate: number; // % peserta yang sudah lulus
  passRate: number; // % kelulusan dari peserta yang sudah ujian
  byLocation: { label: string; value: number }[];
  byPosition: { label: string; value: number }[];
}

/** Agregasi statistik dashboard dari data nyata (bukan dummy). */
export function getDashboardStats(): DashboardStats {
  const users = listUsers();
  const attendance = listAttendance();
  const results = listResults();
  const certificates = listCertificates();

  const total = users.length;

  // Ambil nilai terbaik per peserta untuk menentukan lulus/tidak.
  const testedUserIds = new Set(results.map((r) => r.userId));
  let passed = 0;
  let failed = 0;
  testedUserIds.forEach((uid) => {
    const best = bestResult(uid);
    if (best?.status === 'lulus') passed += 1;
    else failed += 1;
  });

  const tested = testedUserIds.size;
  const completionRate = total === 0 ? 0 : Math.round((passed / total) * 100);
  const passRate = tested === 0 ? 0 : Math.round((passed / tested) * 100);

  const byLocation = aggregate(attendance.map((a) => a.locationName || '-'));
  const byPosition = aggregate(attendance.map((a) => a.positionName || '-'));

  return {
    totalParticipants: total,
    totalPassed: passed,
    totalFailed: failed,
    totalCertificates: certificates.length,
    completionRate,
    passRate,
    byLocation,
    byPosition,
  };
}

function aggregate(values: string[]): { label: string; value: number }[] {
  const map = new Map<string, number>();
  for (const v of values) map.set(v, (map.get(v) ?? 0) + 1);
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}
