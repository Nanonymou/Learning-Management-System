import type { Attendance } from '@/types/domain';
import { readCollection, writeCollection, STORAGE_KEYS } from '@/lib/storage/localStore';
import { uid } from '@/lib/utils/id';
import { todayISO, nowTime } from '@/lib/utils/format';
import { upsertCurrentUser, getCurrentUser } from '@/features/participant/participant.service';
import { positionName, locationName } from '@/features/master/master.service';

export function listAttendance(): Attendance[] {
  return readCollection<Attendance>(STORAGE_KEYS.attendance);
}

export function attendanceForUser(userId: string): Attendance[] {
  return listAttendance().filter((a) => a.userId === userId);
}

export function removeAttendanceForUser(userId: string): void {
  writeCollection(
    STORAGE_KEYS.attendance,
    listAttendance().filter((a) => a.userId !== userId),
  );
}

/** Apakah peserta saat ini sudah mengisi daftar hadir hari ini? */
export function hasAttendedToday(): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  const today = todayISO();
  return listAttendance().some(
    (a) => a.userId === user.id && a.attendDate === today,
  );
}

export interface AttendanceInput {
  fullName: string;
  positionId: string | null;
  locationId: string | null;
}

export type AttendanceResult =
  | { ok: true; attendance: Attendance }
  | { ok: false; error: string };

/**
 * Simpan daftar hadir dengan validasi:
 *  - Semua field wajib diisi.
 *  - Tidak boleh mengisi dua kali pada hari yang sama.
 */
export function submitAttendance(input: AttendanceInput): AttendanceResult {
  if (!input.fullName.trim() || !input.positionId || !input.locationId) {
    return { ok: false, error: 'Semua field wajib diisi.' };
  }

  const user = upsertCurrentUser({
    fullName: input.fullName.trim(),
    positionId: input.positionId,
    locationId: input.locationId,
  });

  const today = todayISO();
  const already = listAttendance().some(
    (a) => a.userId === user.id && a.attendDate === today,
  );
  if (already) {
    return {
      ok: false,
      error: 'Anda sudah mengisi daftar hadir hari ini.',
    };
  }

  const attendance: Attendance = {
    id: uid(),
    userId: user.id,
    fullName: user.fullName,
    positionId: user.positionId,
    locationId: user.locationId,
    positionName: positionName(user.positionId),
    locationName: locationName(user.locationId),
    attendDate: today,
    attendTime: nowTime(),
    createdAt: new Date().toISOString(),
  };
  writeCollection(STORAGE_KEYS.attendance, [...listAttendance(), attendance]);
  return { ok: true, attendance };
}
