import { getQuestions } from '@/features/quiz/bank.service';

/**
 * Ekspor Bank Soal ke file Excel (.xlsx) yang rapi: header tebal berwarna,
 * border, lebar kolom pas, teks membungkus, dan sel jawaban benar disorot.
 *
 * exceljs di-*dynamic import* agar tidak membebani bundle awal (hanya dimuat
 * saat tombol unduh ditekan).
 */
export async function exportBankSoalExcel(trainingName: string): Promise<void> {
  const ExcelJS = (await import('exceljs')).default;
  const questions = getQuestions();

  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const maxOpts = Math.min(
    6,
    Math.max(2, ...questions.map((q) => q.options.length), 4),
  );

  const wb = new ExcelJS.Workbook();
  wb.creator = 'LMS Training';
  wb.created = new Date();
  const ws = wb.addWorksheet('Bank Soal', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  // Kolom + lebar
  ws.columns = [
    { header: 'No', key: 'no', width: 5 },
    { header: 'Bab', key: 'bab', width: 8 },
    { header: 'Pertanyaan', key: 'q', width: 52 },
    ...Array.from({ length: maxOpts }, (_, i) => ({
      header: `Opsi ${letters[i]}`,
      key: `o${i}`,
      width: 26,
    })),
    { header: 'Kunci Jawaban', key: 'key', width: 34 },
    { header: 'Pembahasan', key: 'expl', width: 46 },
  ];

  const keyColIdx = 4 + maxOpts; // No,Bab,Pertanyaan (1-3) + opsi + kunci
  const lastColIdx = keyColIdx + 1;

  const thin = { style: 'thin' as const, color: { argb: 'FFCBD5E1' } };
  const border = { top: thin, left: thin, bottom: thin, right: thin };

  // --- Header ---
  const header = ws.getRow(1);
  header.height = 24;
  header.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = border;
  });

  // --- Data ---
  questions.forEach((q, idx) => {
    const correctIdx = q.options.findIndex((o) => o.isCorrect);
    const row: Record<string, string | number> = {
      no: idx + 1,
      bab: q.chapterRef || '-',
      q: q.questionText,
      key:
        correctIdx >= 0
          ? `${letters[correctIdx]}. ${q.options[correctIdx]?.text ?? ''}`
          : '-',
      expl: q.explanation || '-',
    };
    q.options.forEach((o, i) => {
      if (i < maxOpts) row[`o${i}`] = o.text;
    });

    const added = ws.addRow(row);
    added.alignment = { vertical: 'top', wrapText: true };
    added.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = border;
    });

    // Sorot sel opsi yang benar + sel kunci (hijau)
    const green = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFDCFCE7' } };
    if (correctIdx >= 0 && correctIdx < maxOpts) {
      const c = added.getCell(4 + correctIdx);
      c.fill = green;
      c.font = { bold: true, color: { argb: 'FF166534' } };
    }
    const keyCell = added.getCell(keyColIdx);
    keyCell.fill = green;
    keyCell.font = { bold: true, color: { argb: 'FF166534' } };

    // Zebra ringan pada baris genap
    if (idx % 2 === 1) {
      added.eachCell({ includeEmpty: true }, (cell) => {
        if (!cell.fill || cell.fill.type !== 'pattern') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
        }
      });
    }
  });

  // Filter pada header
  ws.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: lastColIdx },
  };

  // --- Unduh ---
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const safe = (trainingName || 'training').replace(/[^\w-]+/g, '-').toLowerCase();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bank-soal-${safe}-${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
