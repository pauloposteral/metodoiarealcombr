import { BookOpen } from "lucide-react";

interface SummaryBoxProps {
  items: string[];
}

const SummaryBox = ({ items }: SummaryBoxProps) => {
  return (
    <div className="my-8 bg-muted rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-primary" />
        </div>
        <h4 className="font-bold text-lg text-foreground">Resumo da Aula</h4>
      </div>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
              {index + 1}
            </span>
            <span className="text-foreground/80">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SummaryBox;
