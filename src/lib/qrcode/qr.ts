import QRCode from 'qrcode';

/** Buat QR code sebagai data URL (PNG). */
export async function qrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    width: 240,
    margin: 1,
    errorCorrectionLevel: 'M',
  });
}
