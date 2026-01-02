import { PenTool } from "lucide-react";

interface ExerciseBoxProps {
  title: string;
  description: string;
}

const ExerciseBox = ({ title, description }: ExerciseBoxProps) => {
  return (
    <div className="my-8 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
          <PenTool className="w-5 h-5 text-primary" />
        </div>
        <h4 className="font-bold text-lg text-foreground">{title}</h4>
      </div>
      <p className="text-foreground/80 leading-relaxed">{description}</p>
    </div>
  );
};

export default ExerciseBox;
