import { PageHeader } from '@/components/ui/PageHeader';
import { MasterCrud } from '../components/MasterCrud';
import { listLocations, addLocation, removeLocation } from '@/features/master/master.service';

export default function ManageLokasiPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Kelola Lokasi" description="Tambah atau hapus lokasi/site." />
      <MasterCrud
        list={() => listLocations().map((l) => ({ id: l.id, name: l.name }))}
        add={(name) => {
          const l = addLocation(name);
          return { id: l.id, name: l.name };
        }}
        remove={removeLocation}
        itemLabel="Lokasi"
        placeholder="Nama lokasi baru…"
      />
    </div>
  );
}
