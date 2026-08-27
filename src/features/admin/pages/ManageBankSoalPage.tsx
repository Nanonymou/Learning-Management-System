import { useState } from 'react';
import { Check, Plus, Pencil, Trash2, RotateCcw, Database, FileSpreadsheet } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useToast } from '@/providers/ToastProvider';
import { useCompanySettings } from '@/features/company-settings/CompanySettingsProvider';
import type { Question } from '@/types/domain';
import {
  getQuestions,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  resetBank,
  type QuestionInput,
} from '@/features/quiz/bank.service';
import { exportBankSoalExcel } from '../bankExport.service';
import { QuestionForm } from '../components/QuestionForm';

export default function ManageBankSoalPage() {
  const { toast } = useToast();
  const { settings } = useCompanySettings();
  const [questions, setQuestions] = useState<Question[]>(() => getQuestions());
  const [editing, setEditing] = useState<Question | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportBankSoalExcel(settings.trainingName);
      toast('File Excel bank soal diunduh.', 'success');
    } catch {
      toast('Gagal membuat file Excel.', 'error');
    } finally {
      setExporting(false);
    }
  };

  const refresh = () => setQuestions(getQuestions());

  const handleSubmit = (input: QuestionInput) => {
    const res =
      editing === 'new'
        ? addQuestion(input)
        : editing
          ? updateQuestion(editing.id, input)
          : null;
    if (res && !res.ok) {
      toast(res.error, 'error');
      return;
    }
    toast(editing === 'new' ? 'Soal ditambahkan.' : 'Soal diperbarui.', 'success');
    setEditing(null);
    refresh();
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteQuestion(deleteTarget.id);
    toast('Soal dihapus.', 'success');
    setDeleteTarget(null);
    refresh();
  };

  const handleReset = () => {
    resetBank();
    setResetConfirm(false);
    refresh();
    toast('Bank soal dikembalikan ke bawaan.', 'success');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bank Soal"
        description={`${questions.length} soal • setiap ujian mengambil 10 soal acak.`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              loading={exporting}
              disabled={questions.length === 0}
            >
              <FileSpreadsheet className="h-4 w-4" /> Unduh Excel
            </Button>
            <Button variant="outline" size="sm" onClick={() => setResetConfirm(true)}>
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
            <Button size="sm" onClick={() => setEditing('new')}>
              <Plus className="h-4 w-4" /> Tambah Soal
            </Button>
          </div>
        }
      />

      {questions.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={Database}
              title="Belum ada soal"
              description="Tambahkan soal pertama untuk bank ujian."
              action={<Button onClick={() => setEditing('new')}>Tambah Soal</Button>}
            />
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {questions.map((q, i) => (
            <li key={q.id}>
              <Card>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium">
                      {i + 1}. {q.questionText}
                    </p>
                    <div className="flex shrink-0 items-center gap-1">
                      {q.chapterRef && <Badge tone="neutral">BAB {q.chapterRef}</Badge>}
                      <Button size="icon" variant="ghost" onClick={() => setEditing(q)} aria-label="Edit soal">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setDeleteTarget(q)} aria-label="Hapus soal">
                        <Trash2 className="h-4 w-4 text-danger" />
                      </Button>
                    </div>
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
                        {o.isCorrect && <Check className="h-3.5 w-3.5 shrink-0" />}
                        {o.text}
                      </li>
                    ))}
                  </ul>
                  {q.explanation && (
                    <p className="text-xs text-muted-foreground">Pembahasan: {q.explanation}</p>
                  )}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={editing !== null}
        title={editing === 'new' ? 'Tambah Soal' : 'Edit Soal'}
        onClose={() => setEditing(null)}
      >
        <QuestionForm
          initial={editing && editing !== 'new' ? editing : undefined}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(null)}
        />
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Hapus Soal?"
        description={deleteTarget?.questionText}
        confirmLabel="Hapus"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={resetConfirm}
        title="Reset Bank Soal?"
        description="Seluruh perubahan akan diganti dengan bank soal bawaan."
        confirmLabel="Reset"
        tone="primary"
        onConfirm={handleReset}
        onCancel={() => setResetConfirm(false)}
      />
    </div>
  );
}
