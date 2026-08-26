import { useEffect, useState, type FormEvent } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useCompanySettings } from '../CompanySettingsProvider';
import type { CompanySettings } from '../types';
import { ImageField } from './ImageField';

/** Field teks generik + label. */
function Field({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function CompanySettingsForm() {
  const { settings, save, loading } = useCompanySettings();
  const [form, setForm] = useState<CompanySettings>(settings);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  // Sinkronkan form saat data awal termuat / berubah dari luar.
  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const set = <K extends keyof CompanySettings>(key: K, value: CompanySettings[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await save(form);
    setSaving(false);
    setSavedAt(new Date().toLocaleTimeString('id-ID'));
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Memuat pengaturan…</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Identitas Perusahaan */}
      <Card>
        <CardHeader>
          <CardTitle>Identitas Perusahaan</CardTitle>
          <CardDescription>
            Digunakan di seluruh aplikasi (header, footer, sertifikat).
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Field id="companyName" label="Nama Perusahaan" value={form.companyName} onChange={(v) => set('companyName', v)} />
          <Field id="website" label="Website" value={form.website} onChange={(v) => set('website', v)} placeholder="https://" />
          <Field id="email" label="Email" type="email" value={form.email} onChange={(v) => set('email', v)} />
          <Field id="phone" label="Nomor Telepon" value={form.phone} onChange={(v) => set('phone', v)} />
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Alamat</Label>
            <Textarea id="address" value={form.address} onChange={(e) => set('address', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <ImageField label="Logo Perusahaan" value={form.logoUrl} onChange={(v) => set('logoUrl', v)} hint="PNG/SVG transparan disarankan." />
          </div>
        </CardContent>
      </Card>

      {/* Training */}
      <Card>
        <CardHeader>
          <CardTitle>Training</CardTitle>
          <CardDescription>Identitas training yang sedang aktif.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <Field id="trainingName" label="Nama Training" value={form.trainingName} onChange={(v) => set('trainingName', v)} />
          <div className="space-y-2">
            <Label htmlFor="trainingDescription">Deskripsi Training</Label>
            <Textarea id="trainingDescription" value={form.trainingDescription} onChange={(e) => set('trainingDescription', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Penandatangan */}
      <Card>
        <CardHeader>
          <CardTitle>Penandatangan Sertifikat</CardTitle>
          <CardDescription>Dua penandatangan pada sertifikat.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-5">
            <Field id="signer1Name" label="Nama Penandatangan 1" value={form.signer1Name} onChange={(v) => set('signer1Name', v)} />
            <Field id="signer1Title" label="Jabatan Penandatangan 1" value={form.signer1Title} onChange={(v) => set('signer1Title', v)} />
            <ImageField label="Tanda Tangan 1" value={form.signer1SignatureUrl} onChange={(v) => set('signer1SignatureUrl', v)} />
          </div>
          <div className="space-y-5">
            <Field id="signer2Name" label="Nama Penandatangan 2" value={form.signer2Name} onChange={(v) => set('signer2Name', v)} />
            <Field id="signer2Title" label="Jabatan Penandatangan 2" value={form.signer2Title} onChange={(v) => set('signer2Title', v)} />
            <ImageField label="Tanda Tangan 2" value={form.signer2SignatureUrl} onChange={(v) => set('signer2SignatureUrl', v)} />
          </div>
        </CardContent>
      </Card>

      {/* Desain Sertifikat */}
      <Card>
        <CardHeader>
          <CardTitle>Desain Sertifikat</CardTitle>
          <CardDescription>Aset visual untuk sertifikat.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <ImageField label="Background Sertifikat" value={form.certificateBackgroundUrl} onChange={(v) => set('certificateBackgroundUrl', v)} />
          <ImageField label="Logo Sertifikat" value={form.certificateLogoUrl} onChange={(v) => set('certificateLogoUrl', v)} />
        </CardContent>
      </Card>

      {/* Aksi */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          <Save className="h-4 w-4" /> {saving ? 'Menyimpan…' : 'Simpan Pengaturan'}
        </Button>
        <Button type="button" variant="outline" onClick={() => setForm(settings)} disabled={saving}>
          <RotateCcw className="h-4 w-4" /> Reset
        </Button>
        {savedAt && (
          <span className="text-sm text-success">Tersimpan pada {savedAt}</span>
        )}
      </div>
    </form>
  );
}
