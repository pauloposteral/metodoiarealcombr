import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Copy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

/** "Prompts desta aula": each prompt with a real copy button. */
export function LessonPrompts({ prompts }: { prompts: string[] | null }) {
  const items = (prompts ?? []).map((prompt) => prompt.trim()).filter(Boolean);
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="lesson-prompts-title" className="mb-8 rounded-2xl border border-accent/30 bg-accent/5 p-4 sm:p-6">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h2 id="lesson-prompts-title" className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
          <Sparkles className="h-5 w-5 text-gold-dark dark:text-accent" aria-hidden="true" />
          Prompts desta aula
        </h2>
        <Link
          to="/membros/prompts"
          className="rounded-sm text-sm font-medium text-foreground underline decoration-accent decoration-2 underline-offset-4 hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Biblioteca de prompts
        </Link>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">Copie, cole na sua IA e troque o que estiver entre [COLCHETES] pelo seu contexto.</p>
      <ol role="list" className="space-y-3">
        {items.map((prompt, index) => (
          <PromptCard key={index} number={index + 1} prompt={prompt} />
        ))}
      </ol>
    </section>
  );
}

function PromptCard({ number, prompt }: { number: number; prompt: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      toast({ title: `Prompt ${number} copiado`, description: 'Cole na IA e preencha os campos entre colchetes.' });
    } catch (error) {
      console.error('[LessonPrompts] clipboard write failed', error);
      toast({ title: 'Não foi possível copiar', description: 'Selecione o texto do prompt e copie manualmente.', variant: 'destructive' });
    }
  };

  return (
    <li className="overflow-hidden rounded-xl border border-border/60 bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-border/50 px-4 py-2">
        <h3 className="text-sm font-semibold text-foreground">Prompt {number}</h3>
        <Button type="button" variant="outline" size="sm" onClick={() => void copy()} aria-label={`Copiar prompt ${number}`}>
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          Copiar
        </Button>
      </div>
      <p className="whitespace-pre-wrap px-4 py-3 font-mono text-[13px] leading-relaxed text-foreground/90 [overflow-wrap:anywhere]">{prompt}</p>
    </li>
  );
}
