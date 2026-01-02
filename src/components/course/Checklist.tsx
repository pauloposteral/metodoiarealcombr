import { CheckCircle2 } from "lucide-react";

interface ChecklistProps {
  items: string[];
}

const Checklist = ({ items }: ChecklistProps) => {
  return (
    <div className="my-6 bg-muted/50 rounded-lg p-5">
      <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-green-500" />
        Checklist de Verificação
      </h4>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className="w-5 h-5 rounded border-2 border-muted-foreground/30 flex-shrink-0 mt-0.5" />
            <span className="text-foreground/80 text-sm">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Checklist;
