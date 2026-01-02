import { Lightbulb } from "lucide-react";

interface ExampleBoxProps {
  title: string;
  content: string;
}

const ExampleBox = ({ title, content }: ExampleBoxProps) => {
  return (
    <div className="my-6 bg-primary/5 border-l-4 border-primary rounded-r-lg p-5">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-5 h-5 text-primary" />
        <h4 className="font-semibold text-primary">{title}</h4>
      </div>
      <div className="text-foreground/80 whitespace-pre-line text-sm leading-relaxed">
        {content}
      </div>
    </div>
  );
};

export default ExampleBox;
