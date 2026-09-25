import { useState, type FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TRAIL_QUIZ, countAnswered, scoreTrailQuiz, type TrailQuizAnswers, type TrailQuizResult } from '@/lib/trailQuiz';
import { cn } from '@/lib/utils';

/** Five questions on one screen; each answer weighs the tracks (see `@/lib/trailQuiz`). */
export function TrailQuiz({ onResult }: { onResult: (result: TrailQuizResult) => void }) {
  const [answers, setAnswers] = useState<TrailQuizAnswers>({});
  const answered = countAnswered(answers);
  const total = TRAIL_QUIZ.length;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = scoreTrailQuiz(answers);
    if (result) onResult(result);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {TRAIL_QUIZ.map((question, index) => (
        // The border sits on a wrapper: a bordered fieldset draws its legend on the border line.
        <div key={question.id} className="rounded-2xl border border-border/50 bg-card p-4 sm:p-5">
          <fieldset>
            <legend className="font-display font-semibold text-foreground">
              <span className="mr-2 text-sm font-medium text-muted-foreground">
                {index + 1}/{total}
                <span className="sr-only">:</span>
              </span>
              {question.title}
            </legend>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {question.options.map((option) => {
                const id = `trail-${question.id}-${option.id}`;
                const checked = answers[question.id] === option.id;
                return (
                  <label
                    key={option.id}
                    htmlFor={id}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm text-foreground transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2',
                      checked ? 'border-accent bg-accent/15' : 'border-border/60 hover:border-accent/50 hover:bg-secondary/40',
                    )}
                  >
                    <input
                      type="radio"
                      id={id}
                      name={`trail-${question.id}`}
                      value={option.id}
                      checked={checked}
                      onChange={() => setAnswers((previous) => ({ ...previous, [question.id]: option.id }))}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                    />
                    <span>{option.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>
      ))}

      <div className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {answered === total ? 'Tudo respondido. Veja a trilha recomendada.' : `${answered} de ${total} perguntas respondidas`}
        </p>
        <Button type="submit" variant="cta" disabled={answered < total}>
          Ver minha trilha
          <ArrowRight aria-hidden="true" />
        </Button>
      </div>
    </form>
  );
}
