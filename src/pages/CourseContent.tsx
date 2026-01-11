import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Menu, X, ArrowLeft, ArrowRight, Home, Award, PartyPopper } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { courseContent } from "@/data/courseContent";
import ModuleSidebar from "@/components/course/ModuleSidebar";
import LessonContent from "@/components/course/LessonContent";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const CourseContentPage = () => {
  const [activeModuleId, setActiveModuleId] = useState(courseContent[0].id);
  const [activeLessonId, setActiveLessonId] = useState(courseContent[0].lessons[0].id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [showCourseComplete, setShowCourseComplete] = useState(false);
  const navigate = useNavigate();

  // Load completed lessons from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("completedLessons");
    if (saved) {
      setCompletedLessons(JSON.parse(saved));
    }
  }, []);

  // Find current module and lesson
  const currentModule = courseContent.find((m) => m.id === activeModuleId);
  const currentLesson = currentModule?.lessons.find((l) => l.id === activeLessonId);

  // Navigation helpers
  const getAllLessons = () => {
    return courseContent.flatMap((module) =>
      module.lessons.map((lesson) => ({
        moduleId: module.id,
        lessonId: lesson.id,
        moduleNumber: module.number,
        lessonTitle: lesson.title,
      }))
    );
  };

  const allLessons = getAllLessons();
  const currentIndex = allLessons.findIndex((l) => l.lessonId === activeLessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const handleSelectLesson = (moduleId: string, lessonId: string) => {
    setActiveModuleId(moduleId);
    setActiveLessonId(lessonId);
    setIsSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const markAsComplete = () => {
    if (!completedLessons.includes(activeLessonId)) {
      const newCompleted = [...completedLessons, activeLessonId];
      setCompletedLessons(newCompleted);
      localStorage.setItem("completedLessons", JSON.stringify(newCompleted));
    }
    if (nextLesson) {
      handleSelectLesson(nextLesson.moduleId, nextLesson.lessonId);
    } else {
      // Course completed!
      setShowCourseComplete(true);
    }
  };

  const progress = Math.round((completedLessons.length / allLessons.length) * 100);

  if (!currentModule || !currentLesson) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Helmet>
        <title>{currentLesson.title} | Método IA Real</title>
        <meta
          name="description"
          content={currentLesson.introduction.slice(0, 160)}
        />
      </Helmet>

      {/* Course Complete Dialog */}
      <Dialog open={showCourseComplete} onOpenChange={setShowCourseComplete}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center">
                <PartyPopper className="w-10 h-10 text-gold" />
              </div>
            </div>
            <DialogTitle className="text-2xl">🎉 Parabéns!</DialogTitle>
            <DialogDescription className="text-base">
              Você concluiu todas as aulas do curso Método IA Real! 
              Agora você está pronto para aplicar o conhecimento e transformar sua forma de usar IA.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button 
              className="w-full bg-gold hover:bg-gold/90 text-navy-dark"
              onClick={() => navigate('/membros/certificado')}
            >
              <Award className="w-4 h-4 mr-2" />
              Ver meu certificado
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setShowCourseComplete(false);
                navigate('/membros');
              }}
            >
              Voltar ao início
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              {/* Mobile menu */}
              <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <ScrollArea className="h-full py-6">
                    <ModuleSidebar
                      modules={courseContent}
                      activeModuleId={activeModuleId}
                      activeLessonId={activeLessonId}
                      onSelectLesson={handleSelectLesson}
                      completedLessons={completedLessons}
                    />
                  </ScrollArea>
                </SheetContent>
              </Sheet>

              <Link to="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline font-semibold">Método IA Real</span>
              </Link>
            </div>

            {/* Progress bar */}
            <div className="flex-1 max-w-xs mx-4 hidden sm:block">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              {completedLessons.length}/{allLessons.length} aulas
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-80 border-r border-border h-[calc(100vh-57px)] sticky top-[57px]">
            <ScrollArea className="h-full py-6">
              <ModuleSidebar
                modules={courseContent}
                activeModuleId={activeModuleId}
                activeLessonId={activeLessonId}
                onSelectLesson={handleSelectLesson}
                completedLessons={completedLessons}
              />
            </ScrollArea>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <span>Módulo {currentModule.number}</span>
                <span>/</span>
                <span className="text-foreground">{currentModule.title}</span>
              </div>

              {/* Lesson Title */}
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">
                {currentLesson.title}
              </h1>

              {/* Lesson Content */}
              <LessonContent lesson={currentLesson} />

              {/* Navigation */}
              <div className="flex flex-col sm:flex-row gap-4 mt-12 pt-8 border-t border-border">
                {prevLesson ? (
                  <Button
                    variant="outline"
                    className="flex-1 justify-start gap-2"
                    onClick={() => handleSelectLesson(prevLesson.moduleId, prevLesson.lessonId)}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <div className="text-left">
                      <div className="text-xs text-muted-foreground">Anterior</div>
                      <div className="truncate">{prevLesson.lessonTitle}</div>
                    </div>
                  </Button>
                ) : (
                  <div className="flex-1" />
                )}

                <Button
                  className="flex-1"
                  onClick={markAsComplete}
                >
                  {nextLesson ? (
                    <>
                      <div className="text-left flex-1">
                        <div className="text-xs opacity-80">Concluir e avançar</div>
                        <div className="truncate">{nextLesson.lessonTitle}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    "Concluir curso"
                  )}
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default CourseContentPage;
