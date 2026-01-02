import { LessonContent as LessonContentType } from "@/data/courseContent";
import ExampleBox from "./ExampleBox";
import SummaryBox from "./SummaryBox";
import ExerciseBox from "./ExerciseBox";
import Checklist from "./Checklist";

interface LessonContentProps {
  lesson: LessonContentType;
}

const LessonContent = ({ lesson }: LessonContentProps) => {
  return (
    <article className="prose prose-lg max-w-none">
      {/* Introduction */}
      <div className="text-lg text-foreground/80 leading-relaxed mb-8 p-6 bg-muted/30 rounded-xl border-l-4 border-primary">
        {lesson.introduction}
      </div>

      {/* Sections */}
      {lesson.sections.map((section, index) => (
        <section key={index} className="mb-10">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
            <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm">
              {index + 1}
            </span>
            {section.title}
          </h2>
          <div className="text-foreground/80 whitespace-pre-line leading-relaxed pl-11">
            {section.content}
          </div>
          
          {/* Examples within section */}
          {section.examples?.map((example, exIndex) => (
            <div key={exIndex} className="pl-11">
              <ExampleBox title={example.title} content={example.content} />
            </div>
          ))}
        </section>
      ))}

      {/* Summary */}
      <SummaryBox items={lesson.summary} />

      {/* Checklist if exists */}
      {lesson.checklist && <Checklist items={lesson.checklist.items} />}

      {/* Exercise */}
      {lesson.exercise && (
        <ExerciseBox
          title={lesson.exercise.title}
          description={lesson.exercise.description}
        />
      )}
    </article>
  );
};

export default LessonContent;
