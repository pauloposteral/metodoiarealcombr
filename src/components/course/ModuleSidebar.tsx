import { ModuleData } from "@/data/courseContent";
import { ChevronDown, ChevronRight, BookOpen, CheckCircle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ModuleSidebarProps {
  modules: ModuleData[];
  activeModuleId: string;
  activeLessonId: string;
  onSelectLesson: (moduleId: string, lessonId: string) => void;
  completedLessons?: string[];
}

const ModuleSidebar = ({
  modules,
  activeModuleId,
  activeLessonId,
  onSelectLesson,
  completedLessons = [],
}: ModuleSidebarProps) => {
  const [expandedModules, setExpandedModules] = useState<string[]>([activeModuleId]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  return (
    <nav className="w-full">
      <h3 className="text-lg font-bold text-foreground mb-4 px-4">
        Conteúdo do Curso
      </h3>
      <div className="space-y-2">
        {modules.map((module) => {
          const isExpanded = expandedModules.includes(module.id);
          const isActiveModule = module.id === activeModuleId;
          const completedCount = module.lessons.filter((l) =>
            completedLessons.includes(l.id)
          ).length;

          return (
            <div key={module.id} className="border-b border-border/50 pb-2">
              <button
                onClick={() => toggleModule(module.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                  isActiveModule
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted/50 text-foreground"
                )}
              >
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                  {module.number}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{module.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {completedCount}/{module.lessons.length} aulas
                  </p>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                )}
              </button>

              {isExpanded && (
                <div className="mt-1 ml-6 space-y-1">
                  {module.lessons.map((lesson, index) => {
                    const isActive = lesson.id === activeLessonId;
                    const isCompleted = completedLessons.includes(lesson.id);

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => onSelectLesson(module.id, lesson.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left text-sm transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted/50 text-foreground/80"
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <BookOpen className="w-4 h-4 flex-shrink-0 opacity-50" />
                        )}
                        <span className="truncate">
                          {index + 1}. {lesson.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
};

export default ModuleSidebar;
