import { useRef, useState, type FormEvent } from 'react';
import { CheckCircle2, ExternalLink, Loader2, Send, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useProjectSubmission, type ProjectSubmissionRow } from '@/hooks/useLessonData';
import { PROJECT_NOTES_MAX, PROJECT_URL_MAX, projectSubmissionSchema } from '@/lib/projectSubmission';
import { safeContentUrl } from '@/lib/safeUrl';

interface ProjectBannerProps {
  moduleCode: string | null;
  projectTitle: string | null;
  isFinalProject: boolean;
}

/** Top of a project lesson: what the learner delivers in this module. */
export function ProjectBanner({ moduleCode, projectTitle, isFinalProject }: ProjectBannerProps) {
  return (
    <section aria-label="Projeto do módulo" className="mb-8 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/10 p-5 sm:p-6">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Trophy className="h-4 w-4 text-gold-dark dark:text-accent" aria-hidden="true" />
        Projeto do módulo{moduleCode ? ` ${moduleCode}` : ''}
      </p>
      <p className="mt-2 font-display text-lg font-bold text-foreground sm:text-xl">{projectTitle ?? 'Coloque em prática o que você aprendeu'}</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Siga o passo a passo desta aula e, no fim, cole o link do resultado em "Entregar projeto".
        {isFinalProject && ' Este é o projeto final: a entrega é um dos requisitos do certificado.'}
      </p>
    </section>
  );
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  return `${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

/** "Entregar projeto": https link + notes, one delivery per lesson that can be updated. */
export function ProjectSubmission({ lessonId }: { lessonId: string }) {
  const { submission, isLoading, isError, save } = useProjectSubmission(lessonId, true);
  return (
    <section aria-labelledby="project-submission-title" className="mb-8 rounded-2xl border border-border/50 bg-card p-5 sm:p-6">
      <h2 id="project-submission-title" className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
        <Send className="h-5 w-5 text-gold-dark dark:text-accent" aria-hidden="true" />
        Entregar projeto
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Cole o link https do resultado (documento, pasta, post ou app publicado). Você pode atualizar a entrega quando quiser.
      </p>
      {isLoading ? (
        <p role="status" className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Carregando sua entrega…
        </p>
      ) : isError ? (
        <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-400">Não foi possível carregar sua entrega. Recarregue a página para tentar de novo.</p>
      ) : (
        <SubmissionForm key={submission?.id ?? 'new'} submission={submission} saving={save.isPending} onSave={save.mutate} />
      )}
    </section>
  );
}

interface SubmissionFormProps {
  submission: ProjectSubmissionRow | null;
  saving: boolean;
  onSave: ReturnType<typeof useProjectSubmission>['save']['mutate'];
}

type FieldErrors = Partial<Record<'url' | 'notes', string>>;

function SubmissionForm({ submission, saving, onSave }: SubmissionFormProps) {
  const [url, setUrl] = useState(submission?.url ?? '');
  const [notes, setNotes] = useState(submission?.notes ?? '');
  const [errors, setErrors] = useState<FieldErrors>({});
  const urlRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const savedHref = submission ? safeContentUrl(submission.url) : undefined;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = projectSubmissionSchema.safeParse({ url, notes });
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if ((field === 'url' || field === 'notes') && !fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      (fieldErrors.url ? urlRef : notesRef).current?.focus();
      return;
    }
    setErrors({});
    onSave(parsed.data, {
      onSuccess: () => toast({ title: submission ? 'Entrega atualizada' : 'Projeto entregue!', description: 'Seu link ficou salvo nesta aula.' }),
      onError: () =>
        toast({
          title: 'Não foi possível salvar a entrega',
          description: 'Confira se o link começa com https:// e tente de novo.',
          variant: 'destructive',
        }),
    });
  };

  return (
    <>
      {submission && (
        <div className="mt-4 flex flex-col gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 font-medium text-foreground">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            Entregue em {formatDateTime(submission.updated_at || submission.created_at)}
          </p>
          {savedHref && (
            <a
              href={savedHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-sm font-medium text-foreground underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Abrir entrega
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="sr-only"> (abre em nova aba)</span>
            </a>
          )}
        </div>
      )}
      <form noValidate onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="project-url">Link do projeto</Label>
          <Input
            ref={urlRef}
            id="project-url"
            type="url"
            inputMode="url"
            autoComplete="url"
            placeholder="https://"
            maxLength={PROJECT_URL_MAX}
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            aria-invalid={Boolean(errors.url)}
            aria-describedby={errors.url ? 'project-url-hint project-url-error' : 'project-url-hint'}
            required
          />
          <p id="project-url-hint" className="text-xs text-muted-foreground">Confira se o link abre para quem não está logado na sua conta.</p>
          {errors.url && <p id="project-url-error" className="text-sm text-red-600 dark:text-red-400">{errors.url}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="project-notes">Observações (opcional)</Label>
          <Textarea
            ref={notesRef}
            id="project-notes"
            rows={4}
            maxLength={PROJECT_NOTES_MAX}
            placeholder="O que você fez, o que aprendeu, o que ainda quer melhorar."
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            aria-invalid={Boolean(errors.notes)}
            aria-describedby={errors.notes ? 'project-notes-count project-notes-error' : 'project-notes-count'}
          />
          <p id="project-notes-count" className="text-right text-xs text-muted-foreground">{notes.length}/{PROJECT_NOTES_MAX}</p>
          {errors.notes && <p id="project-notes-error" className="text-sm text-red-600 dark:text-red-400">{errors.notes}</p>}
        </div>
        <Button type="submit" disabled={saving} className="w-full sm:w-auto">
          {saving ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Send aria-hidden="true" />}
          {submission ? 'Atualizar entrega' : 'Entregar projeto'}
        </Button>
      </form>
    </>
  );
}
