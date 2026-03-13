import { ScrollReveal } from '@/components/ScrollReveal';
import { MessageSquare } from 'lucide-react';

interface ObjectionHandlerProps {
  objection: string;
  answer: string;
}

export const ObjectionHandler = ({ objection, answer }: ObjectionHandlerProps) => {
  return (
    <ScrollReveal>
      <div className="max-w-2xl mx-auto my-6 px-4">
        <div className="flex items-start gap-3 bg-muted/50 border border-border/50 rounded-xl p-4">
          <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground italic">"{objection}"</p>
            <p className="text-sm text-foreground font-medium mt-1.5">{answer}</p>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
};
