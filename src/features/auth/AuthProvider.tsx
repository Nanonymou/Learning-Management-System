import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as authService from './auth.service';

interface AuthContextValue {
  authenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Menyediakan status autentikasi admin ke seluruh aplikasi. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState<boolean>(() =>
    authService.isAuthenticated(),
  );

  const login = useCallback((username: string, password: string) => {
    const ok = authService.login(username, password);
    if (ok) setAuthenticated(true);
    return ok;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({ authenticated, login, logout }),
    [authenticated, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider');
  return ctx;
}
