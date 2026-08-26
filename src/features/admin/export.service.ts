import { jsPDF } from 'jspdf';
import { getReportRows, type ReportRow } from './admin.service';

const HEADERS = ['Nama', 'Jabatan', 'Lokasi', 'Tanggal', 'Nilai', 'Status', 'No. Sertifikat'];

function toCells(r: ReportRow): string[] {
  return [r.name, r.position, r.location, r.date, r.score, r.status, r.certificateNumber];
}

export { getReportRows };

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Export CSV (dapat dibuka di Excel). */
export async function exportExcel(): Promise<void> {
  const rows = await getReportRows();
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = [HEADERS, ...rows.map(toCells)].map((r) => r.map(esc).join(','));
  // BOM agar Excel mengenali UTF-8.
  const blob = new Blob(['﻿' + lines.join('\r\n')], {
    type: 'text/csv;charset=utf-8;',
  });
  triggerDownload(blob, `data-peserta-${new Date().toISOString().slice(0, 10)}.csv`);
}

/** Export PDF (tabel sederhana). */
export async function exportPdf(title: string): Promise<void> {
  const rows = await getReportRows();
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const margin = 12;
  let y = margin;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(title || 'Data Peserta Training', margin, y);
  y += 8;

  const colX = [12, 62, 102, 142, 172, 190, 220];
  const drawRow = (cells: string[], bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(9);
    cells.forEach((c, i) => doc.text(String(c).slice(0, 26), colX[i], y));
    y += 6;
  };

  drawRow(HEADERS, true);
  doc.setDrawColor(200);
  doc.line(margin, y - 4, 285, y - 4);

  rows.forEach((r) => {
    if (y > 195) {
      doc.addPage();
      y = margin;
    }
    drawRow(toCells(r));
  });

  if (rows.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.text('Belum ada data peserta.', margin, y);
  }

  doc.save(`data-peserta-${new Date().toISOString().slice(0, 10)}.pdf`);
}
