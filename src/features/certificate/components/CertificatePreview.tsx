import { useEffect, useState } from 'react';
import { GraduationCap } from 'lucide-react';
import type { Certificate } from '@/types/domain';
import type { CompanySettings } from '@/features/company-settings/types';
import { formatDate } from '@/lib/utils/format';
import { qrDataUrl } from '@/lib/qrcode/qr';

/** Pratinjau sertifikat di layar (identitas & aset dari Company Settings). */
export function CertificatePreview({
  cert,
  settings,
}: {
  cert: Certificate;
  settings: CompanySettings;
}) {
  const [qr, setQr] = useState('');

  useEffect(() => {
    void qrDataUrl(cert.qrPayload).then(setQr);
  }, [cert.qrPayload]);

  const logo = settings.certificateLogoUrl || settings.logoUrl;

  return (
    <div
      className="relative mx-auto aspect-[1.414/1] w-full max-w-3xl overflow-hidden rounded-lg border-4 border-primary/70 bg-white p-8 text-center text-slate-800 shadow-card"
      style={
        settings.certificateBackgroundUrl
          ? {
              backgroundImage: `url(${settings.certificateBackgroundUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      <div className="absolute inset-2 rounded border border-primary/30" />

      <div className="relative flex h-full flex-col items-center justify-between">
        <div className="flex flex-col items-center gap-1">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-primary/10">
            {logo ? (
              <img src={logo} alt="logo" className="h-full w-full object-contain" />
            ) : (
              <GraduationCap className="h-7 w-7 text-primary" />
            )}
          </div>
          <p className="text-sm font-semibold">{settings.companyName || 'Nama Perusahaan'}</p>
          <h2 className="mt-1 text-2xl font-bold tracking-wide text-primary">
            SERTIFIKAT KELULUSAN
          </h2>
          <p className="text-sm">{settings.trainingName || 'Nama Training'}</p>
        </div>

        <div className="space-y-1">
          <p className="text-xs">Diberikan kepada</p>
          <p className="text-2xl font-bold text-primary">{cert.participantName}</p>
          <p className="text-sm">
            {cert.positionName} • {cert.locationName}
          </p>
          <p className="text-sm">
            Lulus dengan nilai <strong>{cert.score}</strong>
          </p>
        </div>

        <div className="flex w-full items-end justify-between text-xs">
          <Signer
            name={settings.signer1Name}
            title={settings.signer1Title}
            sig={settings.signer1SignatureUrl}
          />
          <div className="flex flex-col items-center gap-1">
            {qr && <img src={qr} alt="QR validasi" className="h-16 w-16" />}
            <p className="max-w-[10rem] break-all">{cert.certificateNumber}</p>
            <p>{formatDate(cert.issuedDate)}</p>
          </div>
          <Signer
            name={settings.signer2Name}
            title={settings.signer2Title}
            sig={settings.signer2SignatureUrl}
          />
        </div>
      </div>
    </div>
  );
}

function Signer({ name, title, sig }: { name: string; title: string; sig: string }) {
  return (
    <div className="flex w-28 flex-col items-center gap-0.5">
      {sig ? (
        <img src={sig} alt={name} className="h-10 object-contain" />
      ) : (
        <div className="h-10" />
      )}
      <div className="w-full border-t border-slate-400 pt-1">
        <p className="font-semibold">{name || '-'}</p>
        <p>{title || '-'}</p>
      </div>
    </div>
  );
}
