import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Trash2, Save, Loader2, Brain, GripVertical } from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  passing_score: number | null;
  time_limit_minutes: number | null;
  max_attempts: number | null;
}

interface QuizManagerProps {
  lessonId: string;
  lessonTitle: string;
  open: boolean;
  onClose: () => void;
}

export const QuizManager = ({ lessonId, lessonTitle, open, onClose }: QuizManagerProps) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [passingScore, setPassingScore] = useState('70');
  const [timeLimit, setTimeLimit] = useState('');
  const [maxAttempts, setMaxAttempts] = useState('3');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  useEffect(() => {
    if (open) fetchQuiz();
  }, [open, lessonId]);

  const fetchQuiz = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('quizzes')
      .select('*')
      .eq('lesson_id', lessonId)
      .maybeSingle();

    if (data) {
      setQuiz(data as any);
      setTitle(data.title);
      setPassingScore(String(data.passing_score ?? 70));
      setTimeLimit(data.time_limit_minutes ? String(data.time_limit_minutes) : '');
      setMaxAttempts(String(data.max_attempts ?? 3));
      setQuestions((data.questions as unknown as QuizQuestion[]) || []);
    } else {
      setQuiz(null);
      setTitle(`Quiz: ${lessonTitle}`);
      setPassingScore('70');
      setTimeLimit('');
      setMaxAttempts('3');
      setQuestions([]);
    }
    setLoading(false);
  };

  const addQuestion = () => {
    setQuestions(prev => [...prev, { question: '', options: ['', '', '', ''], correct: 0, explanation: '' }]);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    setQuestions(prev => prev.map((q, i) => i === index ? { ...q, [field]: value } : q));
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex) return q;
      const options = [...q.options];
      options[oIndex] = value;
      return { ...q, options };
    }));
  };

  const removeQuestion = (index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title.trim() || questions.length === 0) {
      toast.error('Adicione pelo menos uma questão');
      return;
    }
    for (const q of questions) {
      if (!q.question.trim() || q.options.some(o => !o.trim())) {
        toast.error('Preencha todas as questões e opções');
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        lesson_id: lessonId,
        title,
        questions: questions as any,
        passing_score: Number(passingScore) || 70,
        time_limit_minutes: timeLimit ? Number(timeLimit) : null,
        max_attempts: Number(maxAttempts) || 3,
      };

      if (quiz) {
        await supabase.from('quizzes').update(payload).eq('id', quiz.id);
      } else {
        await supabase.from('quizzes').insert(payload);
      }

      toast.success('Quiz salvo com sucesso!');
      onClose();
    } catch (error) {
      toast.error('Erro ao salvar quiz');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!quiz) return;
    if (!confirm('Excluir este quiz?')) return;
    await supabase.from('quizzes').delete().eq('id', quiz.id);
    toast.success('Quiz excluído');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-accent" />
            Quiz — {lessonTitle}
          </DialogTitle>
          <DialogDescription>Crie perguntas de múltipla escolha para a aula</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Título do Quiz</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div>
                <Label>Nota mínima (%)</Label>
                <Input type="number" value={passingScore} onChange={e => setPassingScore(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tempo limite (min)</Label>
                <Input type="number" value={timeLimit} onChange={e => setTimeLimit(e.target.value)} placeholder="Sem limite" />
              </div>
              <div>
                <Label>Máx. tentativas</Label>
                <Input type="number" value={maxAttempts} onChange={e => setMaxAttempts(e.target.value)} />
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-4">
              {questions.map((q, qi) => (
                <div key={qi} className="bg-secondary/30 rounded-xl p-4 border border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-foreground">Questão {qi + 1}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeQuestion(qi)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <Textarea
                    value={q.question}
                    onChange={e => updateQuestion(qi, 'question', e.target.value)}
                    placeholder="Pergunta..."
                    rows={2}
                    className="mb-3"
                  />
                  <div className="space-y-2 mb-3">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuestion(qi, 'correct', oi)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs flex-shrink-0 transition-colors ${
                            q.correct === oi ? 'border-accent bg-accent text-accent-foreground' : 'border-muted-foreground/30'
                          }`}
                        >
                          {String.fromCharCode(65 + oi)}
                        </button>
                        <Input
                          value={opt}
                          onChange={e => updateOption(qi, oi, e.target.value)}
                          placeholder={`Opção ${String.fromCharCode(65 + oi)}`}
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>
                  <Input
                    value={q.explanation || ''}
                    onChange={e => updateQuestion(qi, 'explanation', e.target.value)}
                    placeholder="Explicação (opcional)"
                    className="text-sm"
                  />
                </div>
              ))}
            </div>

            <Button variant="outline" onClick={addQuestion} className="w-full border-dashed">
              <Plus className="w-4 h-4 mr-2" />Adicionar Questão
            </Button>

            <div className="flex gap-2 pt-2">
              {quiz && (
                <Button variant="destructive" onClick={handleDelete} className="mr-auto">
                  <Trash2 className="w-4 h-4 mr-2" />Excluir Quiz
                </Button>
              )}
              <Button onClick={handleSave} disabled={saving} className="bg-accent hover:bg-accent/90 ml-auto">
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Save className="w-4 h-4 mr-2" />Salvar Quiz
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
