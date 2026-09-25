import { useId, useState, type FormEvent, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  buildCoursePayload, buildLessonPayload, buildModulePayload, describeSaveError, DIFFICULTY_LABELS,
  generateSlug, LESSON_TYPE_LABELS, toCourseItemForm, validateCourseItemForm, type CourseItemForm,
} from '@/lib/adminCourseForm';
import { moduleCode, TRACKS, isTrackKey } from '@/lib/curriculum';
import type { AdminModule, CourseItemTarget } from './courseAdminTypes';

interface CourseItemDialogProps {
  target: CourseItemTarget;
  onClose: () => void;
  onSaved: (target: CourseItemTarget) => void;
}

const COPY: Record<CourseItemTarget['mode'], { create: string; edit: string; created: string; saved: string }> = {
  course: { create: 'Criar curso', edit: 'Editar curso', created: 'Curso criado', saved: 'Curso atualizado' },
  module: { create: 'Criar módulo', edit: 'Editar módulo', created: 'Módulo criado', saved: 'Módulo atualizado' },
  lesson: { create: 'Criar aula', edit: 'Editar aula', created: 'Aula criada', saved: 'Aula atualizada' },
};

async function persist(target: CourseItemTarget, form: CourseItemForm): Promise<void> {
  if (target.mode === 'course') {
    const payload = buildCoursePayload(form);
    const { error } = target.item
      ? await supabase.from('courses').update(payload).eq('id', target.item.id)
      : await supabase.from('courses').insert(payload);
    if (error) throw error;
    return;
  }
  if (target.mode === 'module') {
    const payload = buildModulePayload(form, { courseId: target.courseId, orderIndex: target.orderIndex, existingSlug: target.item?.slug });
    const { error } = target.item
      ? await supabase.from('modules').update(payload).eq('id', target.item.id)
      : await supabase.from('modules').insert(payload);
    if (error) throw error;
    return;
  }
  const payload = buildLessonPayload(form, { moduleId: target.moduleId, orderIndex: target.orderIndex });
  const { error } = target.item
    ? await supabase.from('lessons').update(payload).eq('id', target.item.id)
    : await supabase.from('lessons').insert(payload);
  if (error) throw error;
}

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && <p id={`${id}-hint`} className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ImportedModuleInfo({ module }: { module: AdminModule }) {
  const code = moduleCode(module);
  const trails = (module.trails ?? []).filter(isTrackKey).map((trail) => TRACKS[trail].shortLabel);
  if (!code && trails.length === 0) return null;
  return (
    <p className="rounded-lg bg-secondary/60 p-3 text-xs text-muted-foreground">
      Definido pelo pacote do currículo: {[code, module.hours_label, trails.length ? `trilhas ${trails.join(', ')}` : null].filter(Boolean).join(' · ')}.
      {' '}Uma nova importação sobrescreve título e descrição.
    </p>
  );
}

export function CourseItemDialog({ target, onClose, onSaved }: CourseItemDialogProps) {
  const [form, setForm] = useState<CourseItemForm>(() => toCourseItemForm(target.item));
  const [saving, setSaving] = useState(false);
  const idPrefix = useId();
  const id = (name: string) => `${idPrefix}-${name}`;
  const set = <K extends keyof CourseItemForm>(key: K, value: CourseItemForm[K]) => setForm((previous) => ({ ...previous, [key]: value }));
  const copy = COPY[target.mode];
  const editing = target.item !== null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const problem = validateCourseItemForm(target.mode, form);
    if (problem) {
      toast.error(problem);
      return;
    }
    setSaving(true);
    try {
      await persist(target, form);
      toast.success(editing ? copy.saved : copy.created);
      onSaved(target);
    } catch (error) {
      console.error('[AdminCursos] save failed', { mode: target.mode, id: target.item?.id, error });
      toast.error(describeSaveError(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !saving) onClose(); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? copy.edit : copy.create}</DialogTitle>
          <DialogDescription>
            {target.mode === 'lesson' ? 'Vídeo e conteúdo podem ser ajustados aqui; a importação do currículo não altera o vídeo.' : 'Preencha os dados abaixo.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {target.mode === 'module' && target.item && <ImportedModuleInfo module={target.item} />}

          <Field id={id('title')} label="Título *">
            <Input
              id={id('title')}
              value={form.title}
              required
              onChange={(event) => {
                const title = event.target.value;
                setForm((previous) => ({
                  ...previous,
                  title,
                  slug: target.mode === 'course' && !editing ? generateSlug(title) : previous.slug,
                }));
              }}
              placeholder="Ex.: Fundamentos de IA"
            />
          </Field>

          {target.mode === 'course' && (
            <Field id={id('slug')} label="Slug" hint="Endereço do curso: /membros/cursos/slug.">
              <Input id={id('slug')} value={form.slug} onChange={(event) => set('slug', event.target.value)} placeholder="fundamentos-de-ia" aria-describedby={`${id('slug')}-hint`} />
            </Field>
          )}

          <Field id={id('description')} label="Descrição">
            <Textarea id={id('description')} value={form.description} onChange={(event) => set('description', event.target.value)} placeholder="Breve descrição..." rows={3} />
          </Field>

          {target.mode === 'course' && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field id={id('difficulty')} label="Dificuldade">
                  <Select value={form.difficulty} onValueChange={(value) => set('difficulty', value)}>
                    <SelectTrigger id={id('difficulty')}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field id={id('hours')} label="Horas estimadas">
                  <Input id={id('hours')} type="number" min={0} step="0.5" inputMode="decimal" value={form.hours} onChange={(event) => set('hours', event.target.value)} placeholder="10" />
                </Field>
              </div>
              <Field id={id('thumbnail')} label="URL da thumbnail">
                <Input id={id('thumbnail')} type="url" value={form.thumbnailUrl} onChange={(event) => set('thumbnailUrl', event.target.value)} placeholder="https://..." />
              </Field>
            </>
          )}

          {target.mode === 'lesson' && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field id={id('type')} label="Tipo">
                  <Select value={form.type} onValueChange={(value) => set('type', value)}>
                    <SelectTrigger id={id('type')}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(LESSON_TYPE_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field id={id('minutes')} label="Duração (min)">
                  <Input id={id('minutes')} type="number" min={1} max={600} inputMode="numeric" value={form.minutes} onChange={(event) => set('minutes', event.target.value)} placeholder="10" />
                </Field>
              </div>
              <Field id={id('reviewed')} label="Revisada em" hint='Aparece no selo "Atualizado em" da aula; a revisão vence em 90 dias.'>
                <Input id={id('reviewed')} type="date" value={form.reviewedAt} onChange={(event) => set('reviewedAt', event.target.value)} aria-describedby={`${id('reviewed')}-hint`} />
              </Field>
              <Field id={id('video')} label="URL do vídeo" hint="Opcional. Link de incorporação (embed) com https://.">
                <Input id={id('video')} type="url" value={form.videoUrl} onChange={(event) => set('videoUrl', event.target.value)} placeholder="https://www.youtube.com/embed/..." aria-describedby={`${id('video')}-hint`} />
              </Field>
              <Field id={id('content')} label="Conteúdo (Markdown)">
                <Textarea id={id('content')} value={form.content} onChange={(event) => set('content', event.target.value)} placeholder="## Título da seção..." rows={10} className="font-mono text-sm" />
              </Field>
              {target.item?.prompts && target.item.prompts.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {target.item.prompts.length} {target.item.prompts.length === 1 ? 'prompt vem' : 'prompts vêm'} do pacote do currículo e {target.item.prompts.length === 1 ? 'aparece' : 'aparecem'} na biblioteca de prompts.
                </p>
              )}
            </>
          )}

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
            {target.mode !== 'lesson' && (
              <div className="flex items-center gap-2">
                <Switch id={id('published')} checked={form.published} onCheckedChange={(checked) => set('published', checked)} />
                <Label htmlFor={id('published')}>Publicado</Label>
              </div>
            )}
            {target.mode !== 'module' && (
              <div className="flex items-center gap-2">
                <Switch id={id('free')} checked={form.free} onCheckedChange={(checked) => set('free', checked)} />
                <Label htmlFor={id('free')}>Gratuito</Label>
              </div>
            )}
          </div>

          <Button type="submit" disabled={saving} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            {editing ? 'Salvar alterações' : copy.create}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
