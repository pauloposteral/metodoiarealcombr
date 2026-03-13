import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { StickyNote, Save, Loader2 } from 'lucide-react';

interface LessonNotesProps {
  lessonId: string;
}

export const LessonNotes = ({ lessonId }: LessonNotesProps) => {
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('lesson_notes')
        .select('content, updated_at')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (data) {
        setContent(data.content);
        setLastSaved(new Date(data.updated_at));
        setExpanded(true);
      }
    };
    fetchNotes();
  }, [lessonId]);

  // Auto-save with debounce
  useEffect(() => {
    if (!content && !lastSaved) return;
    const timer = setTimeout(() => saveNotes(), 2000);
    return () => clearTimeout(timer);
  }, [content]);

  const saveNotes = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('lesson_notes')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          content,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,lesson_id' });

      if (error) throw error;
      setLastSaved(new Date());
    } catch {
      toast({ title: 'Erro ao salvar notas', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }, [content, lessonId]);

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full flex items-center gap-3 bg-secondary/30 hover:bg-secondary/50 border border-border/30 rounded-xl px-5 py-4 mb-8 transition-colors text-left"
      >
        <StickyNote className="w-5 h-5 text-accent flex-shrink-0" />
        <div>
          <span className="text-sm font-medium text-foreground">Minhas Anotações</span>
          <span className="text-xs text-muted-foreground block">Clique para abrir</span>
        </div>
      </button>
    );
  }

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-5 mb-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-accent" />
          <h3 className="font-display font-bold text-sm text-foreground">Minhas Anotações</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {saving && <><Loader2 className="w-3 h-3 animate-spin" /> Salvando...</>}
          {!saving && lastSaved && (
            <span className="flex items-center gap-1">
              <Save className="w-3 h-3" /> Salvo
            </span>
          )}
        </div>
      </div>
      <Textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Escreva suas anotações sobre esta aula..."
        rows={5}
        className="resize-y text-sm bg-secondary/20 border-border/30"
      />
      <p className="text-[10px] text-muted-foreground mt-1.5">
        Salva automaticamente • Visível apenas para você
      </p>
    </div>
  );
};
