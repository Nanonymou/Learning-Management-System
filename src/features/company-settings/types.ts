/**
 * Model Company Settings — sumber tunggal identitas perusahaan.
 * Seluruh aplikasi membaca dari sini (tidak ada identitas yang di-hardcode).
 * Field mengikuti PRD & desain database ([05-database-design.md]).
 */
export interface CompanySettings {
  // Identitas perusahaan
  companyName: string;
  logoUrl: string;
  address: string;
  website: string;
  email: string;
  phone: string;

  // Training aktif
  trainingName: string;
  trainingDescription: string;

  // Penandatangan sertifikat
  signer1Name: string;
  signer1Title: string;
  signer1SignatureUrl: string;
  signer2Name: string;
  signer2Title: string;
  signer2SignatureUrl: string;

  // Desain sertifikat
  certificateBackgroundUrl: string;
  certificateLogoUrl: string;
}

/** Nilai default NETRAL (placeholder kosong) — bukan identitas perusahaan. */
export const EMPTY_COMPANY_SETTINGS: CompanySettings = {
  companyName: '',
  logoUrl: '',
  address: '',
  website: '',
  email: '',
  phone: '',
  trainingName: '',
  trainingDescription: '',
  signer1Name: '',
  signer1Title: '',
  signer1SignatureUrl: '',
  signer2Name: '',
  signer2Title: '',
  signer2SignatureUrl: '',
  certificateBackgroundUrl: '',
  certificateLogoUrl: '',
};
