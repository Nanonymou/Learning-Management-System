import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Check, Bookmark, ChevronRight, BookOpen } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { getChapters, searchMaterial } from '../services/material.service';
import { getReadingSummary, isChapterRead } from '../services/readingProgress.service';
import { listBookmarks } from '../services/bookmark.service';
import { ROUTES } from '@/config/routes';

export default function MateriPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const chapters = useMemo(() => getChapters(), []);
  const summary = useMemo(() => getReadingSummary(), []);
  const bookmarks = useMemo(() => listBookmarks(), []);
  const results = query ? searchMaterial(query) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Materi"
        description="Pelajari seluruh bab. Ujian terbuka setelah materi selesai dibaca (100%)."
      />

      {/* Progress membaca */}
      <Card>
        <CardContent className="space-y-3 p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Progress Membaca</span>
            <span className="text-muted-foreground">
              {summary.readChapters}/{summary.totalChapters} bab • {summary.percent}%
            </span>
          </div>
          <Progress value={summary.percent} tone={summary.completed ? 'success' : 'primary'} />
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Cari materi…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {query ? (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {results.length} hasil untuk “{query}”
          </p>
          {results.map((hit) => (
            <button
              key={hit.chapter.id}
              onClick={() => navigate(`/materi/${hit.chapter.id}`)}
              className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-4 text-left transition-all duration-200 ease-out hover:border-primary/40 hover:bg-muted hover:shadow-sm hover:-translate-y-0.5"
            >
              <BookOpen className="h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  BAB {hit.chapter.code} — {hit.chapter.title}
                </p>
                <p className="truncate text-sm text-muted-foreground">{hit.snippet}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      ) : (
        <ul className="space-y-2">
          {chapters.map((ch) => {
            const read = isChapterRead(ch.id);
            const marked = bookmarks.includes(ch.id);
            return (
              <li key={ch.id}>
                <button
                  onClick={() => navigate(`/materi/${ch.id}`)}
                  className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-4 text-left transition-all duration-200 ease-out hover:border-primary/40 hover:bg-muted hover:shadow-sm hover:-translate-y-0.5"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                    {ch.code}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{ch.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {ch.blocks.length} bagian
                    </p>
                  </div>
                  {marked && <Bookmark className="h-4 w-4 fill-primary text-primary" />}
                  {read ? (
                    <Badge tone="success">
                      <Check className="h-3 w-3" /> Selesai
                    </Badge>
                  ) : (
                    <Badge tone="neutral">Belum</Badge>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Materi ditampilkan apa adanya sesuai dokumen training.{' '}
        <button
          className="underline"
          onClick={() => navigate(ROUTES.daftarHadir)}
        >
          Lanjut ke Daftar Hadir
        </button>
      </p>
    </div>
  );
}
