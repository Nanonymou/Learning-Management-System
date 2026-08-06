import { useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Check } from 'lucide-react';
import { questionBank } from '@/features/quiz/data/questionBank';

export default function ManageBankSoalPage() {
  const questions = useMemo(() => questionBank, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bank Soal"
        description={`${questions.length} soal berbasis materi training. Setiap ujian mengambil 10 soal acak.`}
      />

      <ul className="space-y-3">
        {questions.map((q, i) => (
          <li key={q.id}>
            <Card>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium">
                    {i + 1}. {q.questionText}
                  </p>
                  <Badge tone="neutral">BAB {q.chapterRef}</Badge>
                </div>
                <ul className="grid gap-1.5 sm:grid-cols-2">
                  {q.options.map((o) => (
                    <li
                      key={o.id}
                      className={
                        o.isCorrect
                          ? 'flex items-center gap-2 rounded-md bg-success/10 px-3 py-1.5 text-sm text-success'
                          : 'flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-sm text-foreground/80'
                      }
                    >
                      {o.isCorrect && <Check className="h-3.5 w-3.5" />}
                      {o.text}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground">Pembahasan: {q.explanation}</p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
