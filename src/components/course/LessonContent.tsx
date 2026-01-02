import { LessonContent as LessonContentType } from "@/data/courseContent";
import ExampleBox from "./ExampleBox";
import SummaryBox from "./SummaryBox";
import ExerciseBox from "./ExerciseBox";
import Checklist from "./Checklist";
import VisualDiagram from "./VisualDiagram";
import ComparisonBox from "./ComparisonBox";
import TipBox from "./TipBox";

// Import course images
import aiFlowDiagram from "@/assets/course/ai-flow-diagram.jpg";
import methodComparison from "@/assets/course/method-comparison.jpg";
import personWorkingLaptop from "@/assets/course/person-working-laptop.jpg";
import refinementCycle from "@/assets/course/refinement-cycle.jpg";
import promptStructure from "@/assets/course/prompt-structure.jpg";
import teamCollaboration from "@/assets/course/team-collaboration.jpg";
import contentRepurposing from "@/assets/course/content-repurposing.jpg";
import entrepreneurCafe from "@/assets/course/entrepreneur-cafe.jpg";
import businessGrowth from "@/assets/course/business-growth.jpg";
import productivityCalendar from "@/assets/course/productivity-calendar.jpg";
import salesFunnel from "@/assets/course/sales-funnel.jpg";
import futureWork from "@/assets/course/future-work.jpg";

// Map image keys to actual imports
const imageMap: Record<string, string> = {
  "ai-flow-diagram": aiFlowDiagram,
  "method-comparison": methodComparison,
  "person-working-laptop": personWorkingLaptop,
  "refinement-cycle": refinementCycle,
  "prompt-structure": promptStructure,
  "team-collaboration": teamCollaboration,
  "content-repurposing": contentRepurposing,
  "entrepreneur-cafe": entrepreneurCafe,
  "business-growth": businessGrowth,
  "productivity-calendar": productivityCalendar,
  "sales-funnel": salesFunnel,
  "future-work": futureWork,
};

interface LessonContentProps {
  lesson: LessonContentType;
}

const LessonContent = ({ lesson }: LessonContentProps) => {
  const getImageSrc = (key?: string) => {
    if (!key) return "";
    return imageMap[key] || key;
  };

  return (
    <article className="prose prose-lg max-w-none">
      {/* Header Image */}
      {lesson.headerImage && (
        <VisualDiagram 
          imageSrc={getImageSrc(lesson.headerImage)} 
          alt={lesson.title}
        />
      )}

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
          
          {/* Visual element within section */}
          {section.visual && (
            <div className="pl-11">
              {section.visual.type === 'image' && section.visual.imageSrc && (
                <VisualDiagram 
                  imageSrc={getImageSrc(section.visual.imageSrc)} 
                  alt={section.visual.alt || section.title}
                  caption={section.visual.caption}
                />
              )}
              {section.visual.type === 'diagram' && section.visual.imageSrc && (
                <VisualDiagram 
                  imageSrc={getImageSrc(section.visual.imageSrc)} 
                  alt={section.visual.alt || section.title}
                  caption={section.visual.caption}
                />
              )}
              {section.visual.type === 'comparison' && section.visual.before && section.visual.after && (
                <ComparisonBox 
                  title={section.visual.comparisonTitle || "Comparação"}
                  before={section.visual.before}
                  after={section.visual.after}
                />
              )}
              {section.visual.type === 'tip' && section.visual.tipType && section.visual.tipTitle && section.visual.tipContent && (
                <TipBox 
                  type={section.visual.tipType}
                  title={section.visual.tipTitle}
                  content={section.visual.tipContent}
                />
              )}
            </div>
          )}
          
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
