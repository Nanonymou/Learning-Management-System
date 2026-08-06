import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { ROUTES } from '@/config/routes';

/**
 * Guard rute admin. Jika belum login, alihkan ke halaman login sambil
 * menyimpan tujuan awal agar bisa dikembalikan setelah berhasil login.
 */
export function RequireAuth() {
  const { authenticated } = useAuth();
  const location = useLocation();

  if (!authenticated) {
    return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
