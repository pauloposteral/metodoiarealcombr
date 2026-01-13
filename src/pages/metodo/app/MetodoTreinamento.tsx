import { useState } from 'react';
import { 
  BookOpen, 
  PlayCircle, 
  CheckCircle, 
  Clock,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollReveal } from '@/components/ScrollReveal';
import { cn } from '@/lib/utils';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

const trainingModules: Module[] = [
  {
    id: '1',
    title: 'Primeiros passos',
    description: 'Aprenda a navegar e configurar sua conta',
    lessons: [
      { id: '1-1', title: 'Bem-vindo ao Método IA', duration: '3 min', completed: true },
      { id: '1-2', title: 'Navegando pelo dashboard', duration: '5 min', completed: true },
      { id: '1-3', title: 'Configurando sua empresa', duration: '4 min', completed: false },
    ]
  },
  {
    id: '2',
    title: 'Central de Prompts',
    description: 'Domine o uso dos prompts',
    lessons: [
      { id: '2-1', title: 'O que são prompts e como usar', duration: '6 min', completed: false },
      { id: '2-2', title: 'Personalizando prompts', duration: '5 min', completed: false },
      { id: '2-3', title: 'Salvando favoritos', duration: '3 min', completed: false },
      { id: '2-4', title: 'Melhores práticas', duration: '7 min', completed: false },
    ]
  },
  {
    id: '3',
    title: 'Editor de Conteúdo',
    description: 'Crie conteúdo de alta qualidade',
    lessons: [
      { id: '3-1', title: 'Tipos de conteúdo disponíveis', duration: '4 min', completed: false },
      { id: '3-2', title: 'Gerando posts e legendas', duration: '6 min', completed: false },
      { id: '3-3', title: 'Criando carrosséis', duration: '8 min', completed: false },
      { id: '3-4', title: 'Emails que convertem', duration: '7 min', completed: false },
    ]
  },
  {
    id: '4',
    title: 'Gestão de equipe',
    description: 'Gerencie usuários e permissões',
    lessons: [
      { id: '4-1', title: 'Convidando colaboradores', duration: '4 min', completed: false },
      { id: '4-2', title: 'Papéis e permissões', duration: '5 min', completed: false },
      { id: '4-3', title: 'Boas práticas de equipe', duration: '6 min', completed: false },
    ]
  }
];

export default function MetodoTreinamento() {
  const [expandedModule, setExpandedModule] = useState<string | null>('1');

  const totalLessons = trainingModules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = trainingModules.reduce(
    (acc, m) => acc + m.lessons.filter(l => l.completed).length, 
    0
  );
  const progressPercentage = Math.round((completedLessons / totalLessons) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <ScrollReveal>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Treinamento
          </h1>
          <p className="text-muted-foreground">
            Aprenda a usar todas as funcionalidades da plataforma.
          </p>
        </div>
      </ScrollReveal>

      {/* Progress Card */}
      <ScrollReveal delay={100}>
        <Card className="bg-gradient-to-br from-accent/5 to-transparent border-accent/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-accent" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display font-semibold text-foreground">
                    Seu progresso
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    {completedLessons} de {totalLessons} aulas
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
              <div className="text-right">
                <span className="font-display text-2xl font-bold text-accent">
                  {progressPercentage}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>

      {/* Modules */}
      <div className="space-y-4">
        {trainingModules.map((module, index) => {
          const moduleCompleted = module.lessons.filter(l => l.completed).length;
          const isExpanded = expandedModule === module.id;
          
          return (
            <ScrollReveal key={module.id} delay={150 + index * 50}>
              <Card className="overflow-hidden">
                <button
                  onClick={() => setExpandedModule(isExpanded ? null : module.id)}
                  className="w-full text-left"
                >
                  <CardHeader className="hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          moduleCompleted === module.lessons.length 
                            ? "bg-green-500/10 text-green-500"
                            : "bg-muted text-muted-foreground"
                        )}>
                          {moduleCompleted === module.lessons.length ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <span className="font-display font-bold">{index + 1}</span>
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-base">{module.title}</CardTitle>
                          <CardDescription className="text-sm">
                            {module.description} • {moduleCompleted}/{module.lessons.length} aulas
                          </CardDescription>
                        </div>
                      </div>
                      <ChevronRight className={cn(
                        "w-5 h-5 text-muted-foreground transition-transform",
                        isExpanded && "rotate-90"
                      )} />
                    </div>
                  </CardHeader>
                </button>

                {isExpanded && (
                  <CardContent className="pt-0 border-t border-border">
                    <div className="divide-y divide-border">
                      {module.lessons.map((lesson) => (
                        <button
                          key={lesson.id}
                          className="w-full flex items-center gap-4 py-4 hover:bg-muted/30 -mx-6 px-6 transition-colors text-left"
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                            lesson.completed 
                              ? "bg-green-500/10 text-green-500"
                              : "bg-muted text-muted-foreground"
                          )}>
                            {lesson.completed ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <PlayCircle className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "font-medium text-sm",
                              lesson.completed ? "text-muted-foreground" : "text-foreground"
                            )}>
                              {lesson.title}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {lesson.duration}
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            </ScrollReveal>
          );
        })}
      </div>

      {/* Note */}
      <ScrollReveal delay={400}>
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">
            🚧 Conteúdo em produção. Novos módulos serão liberados em breve.
          </p>
        </div>
      </ScrollReveal>
    </div>
  );
}
