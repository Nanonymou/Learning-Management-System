import { jsPDF } from 'jspdf';
import type { Certificate } from '@/types/domain';
import type { CompanySettings } from '@/features/company-settings/types';
import { formatDate } from '@/lib/utils/format';
import { qrDataUrl } from '@/lib/qrcode/qr';

/**
 * Bangun sertifikat sebagai PDF (A4 landscape) dan unduh.
 * Aset (logo, background, tanda tangan) & identitas diambil dari Company
 * Settings — tanpa hardcode.
 */
export async function downloadCertificatePdf(
  cert: Certificate,
  settings: CompanySettings,
): Promise<void> {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // Background (bila ada)
  if (settings.certificateBackgroundUrl) {
    try {
      doc.addImage(settings.certificateBackgroundUrl, 'PNG', 0, 0, W, H);
    } catch {
      /* abaikan aset tak valid */
    }
  }

  // Bingkai
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(1.2);
  doc.rect(8, 8, W - 16, H - 16);
  doc.setLineWidth(0.3);
  doc.rect(11, 11, W - 22, H - 22);

  // Logo sertifikat / perusahaan
  const logo = settings.certificateLogoUrl || settings.logoUrl;
  if (logo) {
    try {
      doc.addImage(logo, 'PNG', W / 2 - 15, 18, 30, 30);
    } catch {
      /* abaikan */
    }
  }

  const centerText = (text: string, y: number, size: number, style = 'normal') => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    doc.text(text, W / 2, y, { align: 'center' });
  };

  doc.setTextColor(30, 41, 59);
  centerText(settings.companyName || 'Nama Perusahaan', 56, 14, 'bold');
  centerText('SERTIFIKAT KELULUSAN', 70, 24, 'bold');
  centerText(settings.trainingName || 'Nama Training', 80, 13);

  centerText('Diberikan kepada:', 96, 11);
  doc.setTextColor(37, 99, 235);
  centerText(cert.participantName, 108, 22, 'bold');
  doc.setTextColor(30, 41, 59);

  centerText(
    `${cert.positionName}  •  ${cert.locationName}`,
    118,
    11,
  );
  centerText(
    `Telah lulus dengan nilai ${cert.score} dan dinyatakan kompeten mengikuti pelatihan.`,
    130,
    11,
  );

  // Tanda tangan
  const sigY = H - 42;
  const drawSigner = (
    x: number,
    name: string,
    title: string,
    sigUrl: string,
  ) => {
    if (sigUrl) {
      try {
        doc.addImage(sigUrl, 'PNG', x - 18, sigY - 16, 36, 14);
      } catch {
        /* abaikan */
      }
    }
    doc.setDrawColor(120);
    doc.setLineWidth(0.2);
    doc.line(x - 25, sigY, x + 25, sigY);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(name || '-', x, sigY + 5, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(title || '-', x, sigY + 10, { align: 'center' });
  };
  drawSigner(W * 0.3, settings.signer1Name, settings.signer1Title, settings.signer1SignatureUrl);
  drawSigner(W * 0.7, settings.signer2Name, settings.signer2Title, settings.signer2SignatureUrl);

  // QR + nomor + tanggal
  try {
    const qr = await qrDataUrl(cert.qrPayload);
    doc.addImage(qr, 'PNG', W / 2 - 12, H - 40, 24, 24);
  } catch {
    /* abaikan */
  }
  doc.setFontSize(9);
  doc.setTextColor(80);
  centerText(`No: ${cert.certificateNumber}`, H - 12, 9);
  doc.text(formatDate(cert.issuedDate), W / 2, H - 8, { align: 'center' });

  doc.save(`Sertifikat-${cert.certificateNumber.replace(/\//g, '-')}.pdf`);
}
