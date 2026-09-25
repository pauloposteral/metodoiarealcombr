import { CheckCircle2, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface CompleteLessonButtonProps {
  pending: boolean;
  onComplete: () => void;
  /** Project lesson without a delivery: ask before completing (never blocks). */
  confirmMissingProject: boolean;
  isFinalProject: boolean;
  isLastLesson: boolean;
}

export function CompleteLessonButton({ pending, onComplete, confirmMissingProject, isFinalProject, isLastLesson }: CompleteLessonButtonProps) {
  const label = isLastLesson ? 'Concluir aula' : 'Concluir aula e avançar';
  const button = (
    <Button
      type="button"
      size="lg"
      variant="cta"
      disabled={pending}
      onClick={confirmMissingProject ? undefined : onComplete}
      className="w-full whitespace-normal sm:w-auto"
    >
      {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <CheckCircle2 aria-hidden="true" />}
      {pending ? 'Salvando…' : label}
    </Button>
  );

  if (!confirmMissingProject) return button;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{button}</AlertDialogTrigger>
      <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Concluir sem entregar o projeto?</AlertDialogTitle>
          <AlertDialogDescription>
            Você ainda não colou o link do projeto. Pode concluir agora e entregar depois, nesta mesma aula.
            {isFinalProject && ' A entrega do projeto final é obrigatória para liberar o certificado.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Voltar e entregar</AlertDialogCancel>
          <AlertDialogAction onClick={onComplete}>Concluir mesmo assim</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
