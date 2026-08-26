import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, CalendarClock } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import { GateNotice } from '@/components/feedback/GateNotice';
import { useToast } from '@/providers/ToastProvider';
import { useTrainingFlow } from '@/features/training/useTrainingFlow';
import { listPositions, listLocations, addLocation } from '@/features/master/master.service';
import { getCurrentUser } from '@/features/participant/participant.service';
import { submitAttendance, hasAttendedToday } from '../attendance.service';
import { formatDate, todayISO, nowTime } from '@/lib/utils/format';
import { ROUTES } from '@/config/routes';

export default function AttendancePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const flow = useTrainingFlow();

  const positions = useMemo(() => listPositions(), []);
  const locations = useMemo(() => listLocations(), []);

  const current = getCurrentUser();
  const [fullName, setFullName] = useState(current?.fullName ?? '');
  const [positionId, setPositionId] = useState(current?.positionId ?? '');
  const [locationId, setLocationId] = useState(current?.locationId ?? '');
  const [newLocation, setNewLocation] = useState('');
  const [submitted, setSubmitted] = useState(() => hasAttendedToday());

  // Gate: materi harus 100%.
  if (!flow.readingComplete) {
    return (
      <div className="space-y-6">
        <PageHeader title="Daftar Hadir" />
        <GateNotice
          title="Selesaikan materi terlebih dahulu"
          description={`Daftar Hadir terbuka setelah seluruh materi selesai dibaca. Progres Anda saat ini ${flow.reading.percent}%.`}
          actionLabel="Lanjut Membaca Materi"
          onAction={() => navigate(ROUTES.materi)}
        />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="space-y-6">
        <PageHeader title="Daftar Hadir" />
        <GateNotice
          icon={CheckCircle2}
          tone="success"
          title="Anda sudah mengisi daftar hadir hari ini"
          description="Menu Ujian sudah terbuka. Semangat!"
          actionLabel="Mulai Ujian"
          onAction={() => navigate(ROUTES.ujian)}
        />
      </div>
    );
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    let locId = locationId;
    if (locId === '__new__') {
      if (!newLocation.trim()) {
        toast('Isi nama lokasi baru.', 'error');
        return;
      }
      locId = addLocation(newLocation).id;
    }

    const res = submitAttendance({
      fullName,
      positionId: positionId || null,
      locationId: locId || null,
    });

    if (!res.ok) {
      toast(res.error, 'error');
      return;
    }
    toast('Daftar hadir tersimpan. Menu Ujian terbuka.', 'success');
    setSubmitted(true);
    flow.refresh();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daftar Hadir"
        description="Isi kehadiran sebelum mengerjakan ujian. Wajib diisi satu kali per hari."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" /> Formulir Kehadiran
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nama Lengkap</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nama lengkap Anda"
                required
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="position">Jabatan</Label>
                <Select
                  id="position"
                  value={positionId}
                  onChange={(e) => setPositionId(e.target.value)}
                  required
                >
                  <option value="">Pilih jabatan…</option>
                  {positions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Lokasi</Label>
                <Select
                  id="location"
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  required
                >
                  <option value="">Pilih lokasi…</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                  <option value="__new__">+ Tambah lokasi baru…</option>
                </Select>
              </div>
            </div>

            {locationId === '__new__' && (
              <div className="space-y-2">
                <Label htmlFor="newLocation">Nama Lokasi Baru</Label>
                <Input
                  id="newLocation"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="mis. Site Jakarta"
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 rounded-lg bg-muted p-3 text-sm">
              <Badge tone="primary">Tanggal: {formatDate(todayISO())}</Badge>
              <Badge tone="primary">Jam: {nowTime()}</Badge>
              <span className="text-muted-foreground">(otomatis)</span>
            </div>

            <Button type="submit" size="lg">
              Simpan Daftar Hadir
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
