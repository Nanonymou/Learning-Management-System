import { useRef, type ChangeEvent } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';

interface ImageFieldProps {
  label: string;
  value: string;
  onChange: (dataUrl: string) => void;
  hint?: string;
}

/**
 * Input gambar untuk aset (logo, background sertifikat, tanda tangan).
 *
 * Tahap 2 (belum ada Storage): file dikonversi ke data URL (base64) dan
 * disimpan lokal. Saat tahap database, unggah ke Supabase Storage lalu
 * simpan URL-nya — antarmuka komponen tetap sama.
 */
export function ImageField({ label, value, onChange, hint }: ImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(typeof reader.result === 'string' ? reader.result : '');
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-dashed border-border bg-muted">
          {value ? (
            <img src={value} alt={label} className="h-full w-full object-contain" />
          ) : (
            <span className="text-[10px] text-muted-foreground">Kosong</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="h-4 w-4" /> Unggah
            </Button>
            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange('')}
              >
                <X className="h-4 w-4" /> Hapus
              </Button>
            )}
          </div>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
