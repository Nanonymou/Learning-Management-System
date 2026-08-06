import { useMemo } from 'react';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/providers/ToastProvider';
import { useCompanySettings } from '@/features/company-settings/CompanySettingsProvider';
import { getReportRows } from '../admin.service';
import { exportExcel, exportPdf } from '../export.service';

export default function ExportPage() {
  const { toast } = useToast();
  const { settings } = useCompanySettings();
  const count = useMemo(() => getReportRows().length, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Export Data"
        description="Unduh rekap data peserta (Nama, Jabatan, Lokasi, Tanggal, Nilai, Status, Nomor Sertifikat)."
      />

      <Card>
        <CardHeader>
          <CardTitle>Rekap Peserta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {count} peserta siap diekspor.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => {
                exportExcel();
                toast('File Excel (CSV) diunduh.', 'success');
              }}
            >
              <FileSpreadsheet className="h-4 w-4" /> Export Excel
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                exportPdf(settings.trainingName || 'Data Peserta Training');
                toast('File PDF diunduh.', 'success');
              }}
            >
              <FileText className="h-4 w-4" /> Export PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
