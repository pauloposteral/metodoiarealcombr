import { Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useLessonBookmark } from '@/hooks/useLessonData';

/** Toggle that saves the lesson in /membros/salvos. */
export function BookmarkButton({ lessonId }: { lessonId: string }) {
  const { isBookmarked, isReady, toggle } = useLessonBookmark(lessonId);

  const handleClick = () => {
    const next = !isBookmarked;
    toggle.mutate(next, {
      onSuccess: () =>
        toast(next
          ? { title: 'Aula salva', description: 'Ela fica em Salvos, no menu lateral.' }
          : { title: 'Aula removida dos salvos' }),
      onError: () => toast({ title: 'Não foi possível atualizar os salvos', description: 'Tente de novo em instantes.', variant: 'destructive' }),
    });
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleClick}
      disabled={!isReady || toggle.isPending}
      aria-label="Salvar aula"
      aria-pressed={isBookmarked}
      title={isBookmarked ? 'Aula salva' : 'Salvar aula'}
      className="shrink-0"
    >
      {isBookmarked ? <BookmarkCheck className="text-gold-dark dark:text-accent" aria-hidden="true" /> : <Bookmark aria-hidden="true" />}
    </Button>
  );
}
