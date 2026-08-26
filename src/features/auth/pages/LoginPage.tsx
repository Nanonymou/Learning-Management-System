import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Lock, LogIn, GraduationCap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useAuth } from '../AuthProvider';
import { useCompanySettings } from '@/features/company-settings/CompanySettingsProvider';
import { ROUTES } from '@/config/routes';

interface LocationState {
  from?: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authenticated, login } = useAuth();
  const { settings } = useCompanySettings();

  const from = (location.state as LocationState | null)?.from ?? ROUTES.admin;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Sudah login → langsung ke dashboard admin.
  if (authenticated) {
    navigate(ROUTES.admin, { replace: true });
    return null;
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const ok = login(username, password);
    if (ok) {
      navigate(from, { replace: true });
    } else {
      setError('Username atau password salah.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardContent className="space-y-6 p-8">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-primary/10">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="logo" className="h-full w-full object-contain" />
              ) : (
                <GraduationCap className="h-6 w-6 text-primary" />
              )}
            </div>
            <h1 className="text-xl font-bold">Login Admin</h1>
            <p className="text-sm text-muted-foreground">
              {settings.companyName || 'Learning Management System'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                autoComplete="username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <p className="flex items-center gap-2 text-sm text-danger">
                <Lock className="h-4 w-4" /> {error}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full">
              <LogIn className="h-4 w-4" /> Masuk
            </Button>
          </form>

          <Link
            to={ROUTES.dashboard}
            className="block text-center text-sm text-muted-foreground hover:text-foreground"
          >
            ← Kembali ke Beranda
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
