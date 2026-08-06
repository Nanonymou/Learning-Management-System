import type { Certificate } from '@/types/domain';
import { readCollection, writeCollection, STORAGE_KEYS } from '@/lib/storage/localStore';
import { uid } from '@/lib/utils/id';
import { todayISO } from '@/lib/utils/format';
import { positionName, locationName } from '@/features/master/master.service';
import { listUsers } from '@/features/participant/participant.service';
import { getResult } from '@/features/quiz/quiz.service';
import { syncCertificate } from '@/lib/supabase/sync';
import type { CompanySettings } from '@/features/company-settings/types';

/** Sertifikat: penerbitan (hanya untuk lulus), nomor unik, dan validasi. */

export function listCertificates(): Certificate[] {
  return readCollection<Certificate>(STORAGE_KEYS.certificates);
}

export function certificatesForUser(userId: string): Certificate[] {
  return listCertificates().filter((c) => c.userId === userId);
}

export function getCertificate(id: string): Certificate | undefined {
  return listCertificates().find((c) => c.id === id);
}

export function getCertificateByNumber(num: string): Certificate | undefined {
  return listCertificates().find(
    (c) => c.certificateNumber.toLowerCase() === num.toLowerCase(),
  );
}

function generateNumber(): string {
  const y = new Date().getFullYear();
  const m = String(new Date().getMonth() + 1).padStart(2, '0');
  const seq = String(listCertificates().length + 1).padStart(6, '0');
  return `CERT/${y}/${m}/${seq}`;
}

/**
 * Terbitkan sertifikat untuk hasil ujian yang LULUS.
 * Idempoten: jika sudah ada untuk resultId tsb, kembalikan yang ada.
 */
export function issueCertificate(
  resultId: string,
  settings: CompanySettings,
): Certificate | null {
  const existing = listCertificates().find((c) => c.quizResultId === resultId);
  if (existing) return existing;

  const result = getResult(resultId);
  if (!result || result.status !== 'lulus') return null;

  const user = listUsers().find((u) => u.id === result.userId);
  if (!user) return null;

  const number = generateNumber();
  const certificate: Certificate = {
    id: uid(),
    userId: user.id,
    quizResultId: result.id,
    certificateNumber: number,
    trainingName: settings.trainingName || 'Training',
    participantName: user.fullName,
    positionName: positionName(user.positionId),
    locationName: locationName(user.locationId),
    score: result.score,
    qrPayload: `${window.location.origin}/validasi/${encodeURIComponent(number)}`,
    issuedDate: todayISO(),
    createdAt: new Date().toISOString(),
  };
  writeCollection(STORAGE_KEYS.certificates, [...listCertificates(), certificate]);
  // Tulis-tembus sertifikat ke Supabase (validasi & pantauan admin).
  syncCertificate(user, certificate);
  return certificate;
}

/** Hapus sertifikat milik peserta (dipakai saat reset/hapus peserta oleh admin). */
export function removeCertificatesForUser(userId: string): void {
  writeCollection(
    STORAGE_KEYS.certificates,
    listCertificates().filter((c) => c.userId !== userId),
  );
}
