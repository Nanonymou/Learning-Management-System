import { useState, type FormEvent } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { cn } from '@/lib/utils/cn';
import type { Question } from '@/types/domain';
import type { QuestionInput } from '@/features/quiz/bank.service';

interface QuestionFormProps {
  initial?: Question;
  onSubmit: (input: QuestionInput) => void;
  onCancel: () => void;
}

interface OptionDraft {
  text: string;
  isCorrect: boolean;
}

function initialOptions(q?: Question): OptionDraft[] {
  if (q) return q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect }));
  return [
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ];
}

/** Form tambah/edit soal — dipakai ulang untuk create & update. */
export function QuestionForm({ initial, onSubmit, onCancel }: QuestionFormProps) {
  const [questionText, setQuestionText] = useState(initial?.questionText ?? '');
  const [chapterRef, setChapterRef] = useState(initial?.chapterRef ?? '');
  const [explanation, setExplanation] = useState(initial?.explanation ?? '');
  const [options, setOptions] = useState<OptionDraft[]>(() => initialOptions(initial));

  const setOption = (i: number, patch: Partial<OptionDraft>) =>
    setOptions((prev) => prev.map((o, idx) => (idx === i ? { ...o, ...patch } : o)));

  const setCorrect = (i: number) =>
    setOptions((prev) => prev.map((o, idx) => ({ ...o, isCorrect: idx === i })));

  const addOption = () =>
    setOptions((prev) => (prev.length >= 6 ? prev : [...prev, { text: '', isCorrect: false }]));

  const removeOption = (i: number) =>
    setOptions((prev) => (prev.length <= 2 ? prev : prev.filter((_, idx) => idx !== i)));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ questionText, chapterRef, explanation, options });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="qtext">Pertanyaan</Label>
        <Textarea
          id="qtext"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Tulis pertanyaan…"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Pilihan jawaban</Label>
        <p className="text-xs text-muted-foreground">Klik lingkaran untuk menandai jawaban benar.</p>
        <div className="space-y-2">
          {options.map((o, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCorrect(i)}
                aria-label="Tandai jawaban benar"
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  o.isCorrect
                    ? 'border-success bg-success text-white'
                    : 'border-muted-foreground/40 hover:border-success',
                )}
              >
                {o.isCorrect && <Check className="h-3.5 w-3.5" />}
              </button>
              <Input
                value={o.text}
                onChange={(e) => setOption(i, { text: e.target.value })}
                placeholder={`Pilihan ${i + 1}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeOption(i)}
                disabled={options.length <= 2}
                aria-label="Hapus pilihan"
              >
                <Trash2 className="h-4 w-4 text-danger" />
              </Button>
            </div>
          ))}
        </div>
        {options.length < 6 && (
          <Button type="button" variant="outline" size="sm" onClick={addOption}>
            <Plus className="h-4 w-4" /> Tambah pilihan
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
        <div className="space-y-2">
          <Label htmlFor="chapter">Bab sumber</Label>
          <Input
            id="chapter"
            value={chapterRef}
            onChange={(e) => setChapterRef(e.target.value)}
            placeholder="mis. VI"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expl">Pembahasan</Label>
          <Input
            id="expl"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Penjelasan jawaban benar…"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit">{initial ? 'Simpan Perubahan' : 'Tambah Soal'}</Button>
      </div>
    </form>
  );
}
