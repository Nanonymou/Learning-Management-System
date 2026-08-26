import type { Location, Position } from '@/types/domain';
import { readCollection, writeCollection, STORAGE_KEYS } from '@/lib/storage/localStore';
import { uid } from '@/lib/utils/id';

/**
 * Master data: jabatan (positions) & lokasi (locations).
 * Positions di-seed dengan 8 jabatan sesuai PRD (admin dapat menambah).
 * Locations awalnya kosong; ditambah admin atau tumbuh dari input peserta.
 */

const DEFAULT_POSITIONS = [
  'Cook',
  'Helper Cook',
  'Butcher',
  'Packer',
  'PJO',
  'PJS',
  'Supervisor',
  'HSE',
];

function seedPositions(): Position[] {
  const existing = readCollection<Position>(STORAGE_KEYS.positions);
  if (existing.length > 0) return existing;
  const seeded = DEFAULT_POSITIONS.map((name) => ({ id: uid(), name, isActive: true }));
  writeCollection(STORAGE_KEYS.positions, seeded);
  return seeded;
}

// -------------------- Positions --------------------
export function listPositions(): Position[] {
  return seedPositions();
}

export function addPosition(name: string): Position {
  const positions = seedPositions();
  const trimmed = name.trim();
  const existing = positions.find(
    (p) => p.name.toLowerCase() === trimmed.toLowerCase(),
  );
  if (existing) return existing;
  const created: Position = { id: uid(), name: trimmed, isActive: true };
  writeCollection(STORAGE_KEYS.positions, [...positions, created]);
  return created;
}

export function removePosition(id: string): void {
  writeCollection(
    STORAGE_KEYS.positions,
    seedPositions().filter((p) => p.id !== id),
  );
}

export function positionName(id: string | null): string {
  if (!id) return '-';
  return listPositions().find((p) => p.id === id)?.name ?? '-';
}

// -------------------- Locations --------------------
export function listLocations(): Location[] {
  return readCollection<Location>(STORAGE_KEYS.locations);
}

export function addLocation(name: string): Location {
  const locations = listLocations();
  const trimmed = name.trim();
  const existing = locations.find(
    (l) => l.name.toLowerCase() === trimmed.toLowerCase(),
  );
  if (existing) return existing;
  const created: Location = { id: uid(), name: trimmed, isActive: true };
  writeCollection(STORAGE_KEYS.locations, [...locations, created]);
  return created;
}

export function removeLocation(id: string): void {
  writeCollection(
    STORAGE_KEYS.locations,
    listLocations().filter((l) => l.id !== id),
  );
}

export function locationName(id: string | null): string {
  if (!id) return '-';
  return listLocations().find((l) => l.id === id)?.name ?? '-';
}
