import { useMemo } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/feedback/EmptyState';
import { formatDate } from '@/lib/utils/format';
import { getAllAttendance } from '../admin.service';

export default function ManageAttendancePage() {
  const rows = useMemo(() => getAllAttendance(), []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daftar Hadir"
        description="Rekap kehadiran seluruh peserta training."
      />

      {rows.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState icon={ClipboardCheck} title="Belum ada daftar hadir" />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="p-3 font-medium">Nama</th>
                    <th className="p-3 font-medium">Jabatan</th>
                    <th className="p-3 font-medium">Lokasi</th>
                    <th className="p-3 font-medium">Tanggal</th>
                    <th className="p-3 font-medium">Jam</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((a) => (
                    <tr key={a.id} className="border-b border-border last:border-0">
                      <td className="p-3 font-medium">{a.fullName}</td>
                      <td className="p-3">{a.positionLabel}</td>
                      <td className="p-3">{a.locationLabel}</td>
                      <td className="p-3">{formatDate(a.attendDate)}</td>
                      <td className="p-3">{a.attendTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
