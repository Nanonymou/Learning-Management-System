import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, RotateCcw, Users, Eye } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/providers/ToastProvider';
import {
  getReportRows,
  deleteParticipant,
  resetParticipantResults,
  type ReportRow,
} from '../admin.service';

type Pending =
  | { type: 'delete'; row: ReportRow }
  | { type: 'reset'; row: ReportRow }
  | null;

export default function ManagePesertaPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [rows, setRows] = useState<ReportRow[]>(() => getReportRows());
  const [pending, setPending] = useState<Pending>(null);

  const refresh = () => setRows(getReportRows());

  const handleConfirm = () => {
    if (!pending) return;
    if (pending.type === 'delete') {
      deleteParticipant(pending.row.userId);
      toast('Data peserta dihapus.', 'success');
    } else {
      resetParticipantResults(pending.row.userId);
      toast('Hasil ujian direset.', 'success');
    }
    setPending(null);
    refresh();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola Peserta"
        description="Lihat, reset hasil ujian, atau hapus data peserta."
      />

      {rows.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState icon={Users} title="Belum ada peserta" description="Peserta muncul setelah mengisi daftar hadir." />
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
                    <th className="p-3 font-medium">Nilai</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.userId} className="border-b border-border last:border-0">
                      <td className="p-3 font-medium">{r.name}</td>
                      <td className="p-3">{r.position}</td>
                      <td className="p-3">{r.location}</td>
                      <td className="p-3">{r.score}</td>
                      <td className="p-3">
                        <Badge
                          tone={
                            r.status === 'Lulus'
                              ? 'success'
                              : r.status === 'Tidak Lulus'
                                ? 'danger'
                                : 'neutral'
                          }
                        >
                          {r.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/admin/peserta/${r.userId}`)}
                            title="Lihat detail & riwayat"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setPending({ type: 'reset', row: r })}
                            title="Reset hasil ujian"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setPending({ type: 'delete', row: r })}
                            title="Hapus peserta"
                          >
                            <Trash2 className="h-4 w-4 text-danger" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={pending !== null}
        title={pending?.type === 'delete' ? 'Hapus Data Peserta?' : 'Reset Hasil Ujian?'}
        description={
          pending?.type === 'delete'
            ? `Seluruh data ${pending.row.name} (kehadiran, ujian, sertifikat) akan dihapus permanen.`
            : `Hasil ujian & sertifikat ${pending?.row.name} akan dihapus. Peserta dapat mengulang ujian.`
        }
        confirmLabel={pending?.type === 'delete' ? 'Hapus' : 'Reset'}
        onConfirm={handleConfirm}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}
