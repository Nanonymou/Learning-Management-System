import { readJson, writeJson } from '@/lib/storage/localStore';

/**
 * Autentikasi admin (sisi klien, sementara).
 *
 * Catatan: kredensial di sini berada di bundle klien sehingga BUKAN keamanan
 * tingkat server — hanya mengunci akses UI. Saat integrasi Supabase, ganti
 * implementasi ini dengan Supabase Auth (interface tetap sama).
 */
const CREDENTIALS = {
  username: 'hseadenbuma',
  password: 'nutrisi123',
};

const AUTH_KEY = 'adminAuth';

export function isAuthenticated(): boolean {
  return readJson<boolean>(AUTH_KEY, false);
}

export function login(username: string, password: string): boolean {
  const ok =
    username.trim() === CREDENTIALS.username && password === CREDENTIALS.password;
  if (ok) writeJson(AUTH_KEY, true);
  return ok;
}

export function logout(): void {
  writeJson(AUTH_KEY, false);
}
