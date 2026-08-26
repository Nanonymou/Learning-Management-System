import { PageHeader } from '@/components/ui/PageHeader';
import { MasterCrud } from '../components/MasterCrud';
import { listPositions, addPosition, removePosition } from '@/features/master/master.service';

export default function ManageJabatanPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Kelola Jabatan" description="Tambah atau hapus jabatan peserta." />
      <MasterCrud
        list={() => listPositions().map((p) => ({ id: p.id, name: p.name }))}
        add={(name) => {
          const p = addPosition(name);
          return { id: p.id, name: p.name };
        }}
        remove={removePosition}
        itemLabel="Jabatan"
        placeholder="Nama jabatan baru…"
      />
    </div>
  );
}
