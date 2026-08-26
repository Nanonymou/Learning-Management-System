import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Bookmark, Check, ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/providers/ToastProvider';
import { getChapters } from '../services/material.service';
import { isChapterRead, markChapterRead } from '../services/readingProgress.service';
import { isBookmarked, toggleBookmark } from '../services/bookmark.service';
import { BlockRenderer } from '../components/BlockRenderer';
import { ROUTES } from '@/config/routes';

export default function ChapterPage() {
  const { chapterId = '' } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const chapters = useMemo(() => getChapters(), []);
  const index = chapters.findIndex((c) => c.id === chapterId);
  const chapter = chapters[index];

  const [read, setRead] = useState(() => isChapterRead(chapterId));
  const [marked, setMarked] = useState(() => isBookmarked(chapterId));

  if (!chapter) {
    return (
      <div className="space-y-4">
        <PageHeader title="Bab tidak ditemukan" />
        <Button variant="outline" onClick={() => navigate(ROUTES.materi)}>
          <ArrowLeft className="h-4 w-4" /> Kembali ke Materi
        </Button>
      </div>
    );
  }

  const prev = chapters[index - 1];
  const next = chapters[index + 1];

  const handleBookmark = () => {
    const now = toggleBookmark(chapterId);
    setMarked(now);
    toast(now ? 'Bab ditandai (bookmark).' : 'Bookmark dihapus.', 'info');
  };

  const handleComplete = () => {
    if (!read) {
      markChapterRead(chapterId, true);
      setRead(true);
      toast(`BAB ${chapter.code} ditandai selesai.`, 'success');
    }
    if (next) navigate(`/materi/${next.id}`);
    else navigate(ROUTES.materi);
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(ROUTES.materi)}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Daftar Bab
      </button>

      <PageHeader
        title={`BAB ${chapter.code} — ${chapter.title}`}
        description={`Bab ${index + 1} dari ${chapters.length}`}
        actions={
          <Button variant={marked ? 'primary' : 'outline'} size="sm" onClick={handleBookmark}>
            <Bookmark className={marked ? 'h-4 w-4 fill-current' : 'h-4 w-4'} />
            {marked ? 'Tersimpan' : 'Bookmark'}
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4 p-6 leading-relaxed">
          {chapter.blocks.map((block) => (
            <BlockRenderer key={block.id} block={block} />
          ))}
        </CardContent>
      </Card>

      {/* Navigasi Previous / Next */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="outline"
          disabled={!prev}
          onClick={() => prev && navigate(`/materi/${prev.id}`)}
        >
          <ChevronLeft className="h-4 w-4" /> Sebelumnya
        </Button>

        <Button onClick={handleComplete}>
          {read ? (
            <>
              {next ? 'Lanjut' : 'Selesai'} <ChevronRight className="h-4 w-4" />
            </>
          ) : (
            <>
              <Check className="h-4 w-4" /> Tandai Selesai & {next ? 'Lanjut' : 'Selesai'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
