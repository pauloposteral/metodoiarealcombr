import type { ReactNode } from 'react';
import { BookOpen, Brain, ChevronDown, ChevronRight, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { isReviewOverdue, isTrackKey, moduleCode, moduleDisplayTitle, TRACKS } from '@/lib/curriculum';
import { LESSON_TYPE_LABELS } from '@/lib/adminCourseForm';
import { formatDateOnly } from '@/lib/dateOnly';
import { cn } from '@/lib/utils';
import type { AdminCourse, AdminLesson, AdminModule } from './courseAdminTypes';

interface ExpandButtonProps {
  expanded: boolean;
  label: string;
  controls: string;
  onClick: () => void;
  size?: 'md' | 'sm';
}

function ExpandButton({ expanded, label, controls, onClick, size = 'md' }: ExpandButtonProps) {
  const Icon = expanded ? ChevronDown : ChevronRight;
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn('shrink-0 text-muted-foreground hover:text-foreground', size === 'md' ? 'h-9 w-9' : 'h-8 w-8')}
      aria-expanded={expanded}
      aria-controls={controls}
      aria-label={`${expanded ? 'Recolher' : 'Expandir'} ${label}`}
      onClick={onClick}
    >
      <Icon aria-hidden="true" />
    </Button>
  );
}

interface RowActionsProps {
  label: string;
  addLabel?: string;
  onAdd?: () => void;
  onEdit: () => void;
  onDelete: () => void;
  children?: ReactNode;
}

function RowActions({ label, addLabel, onAdd, onEdit, onDelete, children }: RowActionsProps) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      {children}
      {onAdd && addLabel && (
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onAdd} aria-label={`${addLabel} em ${label}`} title={addLabel}>
          <Plus aria-hidden="true" />
        </Button>
      )}
      <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit} aria-label={`Editar ${label}`} title="Editar">
        <Pencil aria-hidden="true" />
      </Button>
      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={onDelete} aria-label={`Excluir ${label}`} title="Excluir">
        <Trash2 aria-hidden="true" />
      </Button>
    </div>
  );
}

function PublishedBadge({ published, hiddenLabel }: { published: boolean | null; hiddenLabel: string }) {
  return (
    <Badge variant={published ? 'default' : 'secondary'} className="text-[11px]">
      {published ? 'Publicado' : hiddenLabel}
    </Badge>
  );
}

interface CourseRowProps {
  course: AdminCourse;
  expanded: boolean;
  onToggle: () => void;
  onAddModule: () => void;
  onEdit: () => void;
  onDelete: () => void;
  children?: ReactNode;
}

export function CourseRow({ course, expanded, onToggle, onAddModule, onEdit, onDelete, children }: CourseRowProps) {
  const contentId = `curso-${course.id}-modulos`;
  const label = `o curso ${course.title}`;
  return (
    <li className="overflow-hidden rounded-xl border border-border/50 bg-card">
      <div className="flex items-center gap-2 p-3 sm:gap-3 sm:p-4">
        <ExpandButton expanded={expanded} label={label} controls={contentId} onClick={onToggle} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold text-foreground [overflow-wrap:anywhere]">{course.title}</h2>
            <PublishedBadge published={course.is_published} hiddenLabel="Rascunho" />
            {course.is_free && <Badge variant="outline" className="text-[11px]">Grátis</Badge>}
          </div>
          <p className="truncate text-xs text-muted-foreground">/{course.slug}</p>
        </div>
        <RowActions label={label} addLabel="Adicionar módulo" onAdd={onAddModule} onEdit={onEdit} onDelete={onDelete} />
      </div>
      {expanded && (
        <div id={contentId} className="border-t border-border/50 bg-secondary/20">
          {children}
        </div>
      )}
    </li>
  );
}

interface ModuleRowProps {
  module: AdminModule;
  expanded: boolean;
  onToggle: () => void;
  onAddLesson: () => void;
  onEdit: () => void;
  onDelete: () => void;
  children?: ReactNode;
}

export function ModuleRow({ module, expanded, onToggle, onAddLesson, onEdit, onDelete, children }: ModuleRowProps) {
  const code = moduleCode(module);
  const title = moduleDisplayTitle(module);
  const trails = (module.trails ?? []).filter(isTrackKey);
  const contentId = `modulo-${module.id}-aulas`;
  const label = `o módulo ${code ? `${code} ` : ''}${title}`;
  return (
    <li>
      <div className="flex items-start gap-2 border-b border-border/30 py-3 pl-2 pr-3 sm:items-center sm:gap-3 sm:pl-10">
        <ExpandButton expanded={expanded} label={label} controls={contentId} onClick={onToggle} size="sm" />
        <BookOpen className="mt-2 hidden h-4 w-4 shrink-0 text-accent sm:mt-0 sm:block" aria-hidden="true" />
        <div className="min-w-0 flex-1 pt-1 sm:pt-0">
          <div className="flex flex-wrap items-center gap-1.5">
            {code && <Badge variant="outline" className="font-mono text-[11px]">{code}</Badge>}
            {module.is_star && (
              <span className="inline-flex items-center text-accent" title="Módulo-estrela">
                <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                <span className="sr-only">Módulo-estrela</span>
              </span>
            )}
            <span className="text-sm font-medium text-foreground [overflow-wrap:anywhere]">{title}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <PublishedBadge published={module.is_published} hiddenLabel="Oculto" />
            {module.hours_label && <span>{module.hours_label}</span>}
            {trails.length > 0 && (
              <span>
                <span className="sr-only">Trilhas: </span>
                {trails.map((trail) => (
                  <Badge key={trail} variant="secondary" className="mr-1 text-[11px] font-normal">{TRACKS[trail].shortLabel}</Badge>
                ))}
              </span>
            )}
          </div>
        </div>
        <RowActions label={label} addLabel="Adicionar aula" onAdd={onAddLesson} onEdit={onEdit} onDelete={onDelete} />
      </div>
      {expanded && (
        <div id={contentId} className="bg-secondary/10">
          {children}
        </div>
      )}
    </li>
  );
}

interface LessonRowProps {
  lesson: AdminLesson;
  onQuiz: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function ReviewedLabel({ reviewedAt }: { reviewedAt: string | null }) {
  const day = reviewedAt?.slice(0, 10) ?? null;
  const formatted = formatDateOnly(day, 'short');
  if (!day || !formatted) return <span>Sem data de revisão</span>;
  const overdue = isReviewOverdue(day);
  return (
    <span className={overdue ? 'font-medium text-red-700 dark:text-red-400' : undefined}>
      Revisada em <time dateTime={day}>{formatted}</time>
      {overdue && ' · revisão vencida'}
    </span>
  );
}

export function LessonRow({ lesson, onQuiz, onEdit, onDelete }: LessonRowProps) {
  const label = `a aula ${lesson.title}`;
  const typeLabel = LESSON_TYPE_LABELS[lesson.type ?? 'text'] ?? lesson.type;
  return (
    <li className="flex items-start gap-2 border-b border-border/20 py-2.5 pl-4 pr-3 sm:items-center sm:gap-3 sm:pl-20">
      <span className="w-5 shrink-0 pt-0.5 text-xs tabular-nums text-muted-foreground sm:pt-0" aria-hidden="true">{lesson.order_index + 1}</span>
      <div className="min-w-0 flex-1">
        <span className="block text-sm text-foreground [overflow-wrap:anywhere]">{lesson.title}</span>
        <span className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          <span>{lesson.estimated_minutes ?? 0} min</span>
          <span>{typeLabel}</span>
          {lesson.is_free && <span>Grátis</span>}
          {lesson.video_url && <span>Com vídeo</span>}
          {lesson.prompts && lesson.prompts.length > 0 && <span>{lesson.prompts.length} {lesson.prompts.length === 1 ? 'prompt' : 'prompts'}</span>}
          <ReviewedLabel reviewedAt={lesson.reviewed_at} />
        </span>
      </div>
      <RowActions label={label} onEdit={onEdit} onDelete={onDelete}>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onQuiz} aria-label={`Quiz da aula ${lesson.title}`} title="Quiz">
          <Brain aria-hidden="true" />
        </Button>
      </RowActions>
    </li>
  );
}
