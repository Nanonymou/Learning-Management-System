import { NavLink, useNavigate } from 'react-router-dom';
import { X, LogIn, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { NAVIGATION } from '@/config/navigation';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/features/auth/AuthProvider';
import { BrandLogo } from './BrandLogo';

interface SidebarProps {
  /** State untuk mode mobile (drawer). */
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { authenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Grup "Admin" hanya tampil setelah login.
  const groups = NAVIGATION.filter(
    (g) => g.title !== 'Admin' || authenticated,
  );

  const handleLogout = () => {
    logout();
    onClose();
    navigate(ROUTES.dashboard);
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'text-sidebar-foreground/80 hover:bg-white/10 hover:text-sidebar-foreground',
    );

  return (
    <>
      {/* Overlay untuk mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-sidebar-foreground',
          'transition-transform duration-300 lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <BrandLogo inverted />
          <button
            className="rounded-md p-1.5 hover:bg-white/10 lg:hidden"
            onClick={onClose}
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigasi */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {groups.map((group) => (
            <div key={group.title}>
              <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                {group.title}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.to}>
                    <NavLink to={item.to} end={item.end} onClick={onClose} className={linkClass}>
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Login / Logout admin */}
        <div className="border-t border-white/10 p-3">
          {authenticated ? (
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-white/10 hover:text-sidebar-foreground"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Keluar</span>
            </button>
          ) : (
            <NavLink to={ROUTES.login} onClick={onClose} className={linkClass}>
              <LogIn className="h-4 w-4 shrink-0" />
              <span>Login Admin</span>
            </NavLink>
          )}
        </div>
      </aside>
    </>
  );
}
