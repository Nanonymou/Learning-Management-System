import { useState, type FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/providers/ToastProvider';

export interface MasterItem {
  id: string;
  name: string;
}

interface MasterCrudProps {
  list: () => MasterItem[];
  add: (name: string) => MasterItem;
  remove: (id: string) => void;
  itemLabel: string;
  placeholder: string;
}

/**
 * Komponen CRUD master data yang dapat dipakai ulang (jabatan, lokasi, dll).
 * Menghindari duplikasi antar halaman admin.
 */
export function MasterCrud({ list, add, remove, itemLabel, placeholder }: MasterCrudProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<MasterItem[]>(() => list());
  const [name, setName] = useState('');
  const [pending, setPending] = useState<MasterItem | null>(null);

  const refresh = () => setItems(list());

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    add(name);
    setName('');
    refresh();
    toast(`${itemLabel} ditambahkan.`, 'success');
  };

  const handleRemove = () => {
    if (!pending) return;
    remove(pending.id);
    setPending(null);
    refresh();
    toast(`${itemLabel} dihapus.`, 'success');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-5">
          <form onSubmit={handleAdd} className="flex gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={placeholder}
            />
            <Button type="submit">
              <Plus className="h-4 w-4" /> Tambah
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {items.length === 0 ? (
            <EmptyState title={`Belum ada ${itemLabel.toLowerCase()}`} />
          ) : (
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li key={item.id} className="flex items-center justify-between p-4">
                  <span className="font-medium">{item.name}</span>
                  <Button size="sm" variant="ghost" onClick={() => setPending(item)}>
                    <Trash2 className="h-4 w-4 text-danger" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={pending !== null}
        title={`Hapus ${itemLabel}?`}
        description={`"${pending?.name}" akan dihapus.`}
        confirmLabel="Hapus"
        onConfirm={handleRemove}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}
