-- =============================================================================
-- 0003 — Material Tables (e-book terstruktur, hasil ingest DOCX)
-- material_chapters, material_blocks
-- =============================================================================

-- -----------------------------------------------------------------------------
-- material_chapters — bab materi (BAB I, II, ...).
-- training_key mendukung multi-training (reusability).
-- -----------------------------------------------------------------------------
create table if not exists public.material_chapters (
  id            uuid primary key default gen_random_uuid(),
  training_key  text not null default 'default',
  order_no      integer not null,
  code          text not null default '',
  title         text not null,
  created_at    timestamptz not null default now(),

  constraint material_chapters_order_unique unique (training_key, order_no)
);

comment on table public.material_chapters is 'Bab materi training (hasil ingest DOCX).';

-- -----------------------------------------------------------------------------
-- material_blocks — blok konten per bab.
-- type: heading | paragraph | list_bullet | list_check | temperature
--       | case_finding | commitment | quote
-- payload (jsonb) menyesuaikan tipe blok.
-- -----------------------------------------------------------------------------
create table if not exists public.material_blocks (
  id          uuid primary key default gen_random_uuid(),
  chapter_id  uuid not null references public.material_chapters (id) on delete cascade,
  order_no    integer not null,
  type        text not null,
  payload     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),

  constraint material_blocks_type_check check (type in (
    'heading', 'paragraph', 'list_bullet', 'list_check',
    'temperature', 'case_finding', 'commitment', 'quote'
  )),
  constraint material_blocks_order_unique unique (chapter_id, order_no)
);

comment on table public.material_blocks is 'Blok konten materi (ditampilkan apa adanya).';
