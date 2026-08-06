import type { User } from '@/types/domain';
import { readCollection, writeCollection, readJson, writeJson, STORAGE_KEYS } from '@/lib/storage/localStore';
import { uid } from '@/lib/utils/id';

/**
 * Identitas peserta (tanpa auth pada tahap lokal).
 *
 * Setiap browser punya `browserId` stabil. Record `User` dibuat saat peserta
 * mengisi Daftar Hadir. Progres membaca sebelum daftar hadir dilacak per
 * browserId. "Peserta Baru" menghasilkan browserId baru (mulai dari awal).
 */

export function getBrowserId(): string {
  let id = readJson<string>(STORAGE_KEYS.browserId, '');
  if (!id) {
    id = uid();
    writeJson(STORAGE_KEYS.browserId, id);
  }
  return id;
}

export function listUsers(): User[] {
  return readCollection<User>(STORAGE_KEYS.users);
}

export function getCurrentUser(): User | null {
  const bid = getBrowserId();
  return listUsers().find((u) => u.browserId === bid) ?? null;
}

/** Buat/perbarui identitas peserta untuk browser saat ini. */
export function upsertCurrentUser(input: {
  fullName: string;
  positionId: string | null;
  locationId: string | null;
}): User {
  const bid = getBrowserId();
  const users = listUsers();
  const idx = users.findIndex((u) => u.browserId === bid);
  if (idx >= 0) {
    const updated: User = { ...users[idx], ...input };
    users[idx] = updated;
    writeCollection(STORAGE_KEYS.users, users);
    return updated;
  }
  const created: User = {
    id: uid(),
    browserId: bid,
    ...input,
    createdAt: new Date().toISOString(),
  };
  writeCollection(STORAGE_KEYS.users, [...users, created]);
  return created;
}

/** Mulai sebagai peserta baru (browserId baru). Data peserta lama tetap ada. */
export function startNewParticipant(): void {
  writeJson(STORAGE_KEYS.browserId, uid());
}

/** Hapus satu peserta beserta seluruh datanya (dipakai admin). */
export function deleteUser(userId: string): void {
  writeCollection(
    STORAGE_KEYS.users,
    listUsers().filter((u) => u.id !== userId),
  );
}
