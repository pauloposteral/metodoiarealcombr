import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Brain, CheckCircle2, XCircle, RotateCcw, Trophy,
  ChevronRight, Clock, Target, Sparkles
} from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  passing_score: number | null;
  time_limit_minutes: number | null;
  max_attempts: number | null;
}

interface QuizAttempt {
  id: string;
  score: number;
  passed: boolean;
  completed_at: string | null;
}

interface QuizPlayerProps {
  lessonId: string;
}

export const QuizPlayer = ({ lessonId }: QuizPlayerProps) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  // Quiz state
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    fetchQuiz();
  }, [lessonId]);

  // Timer
  useEffect(() => {
    if (!started || !timeLeft || finished) return;
    if (timeLeft <= 0) {
      handleFinish();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => (t ?? 1) - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, started, finished]);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const { data: quizData } = await supabase
        .from('quizzes')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('order_index')
        .limit(1)
        .maybeSingle();

      if (!quizData) { setLoading(false); return; }

      const questions = (quizData.questions as unknown as QuizQuestion[]) || [];
      setQuiz({ ...quizData, questions, passing_score: quizData.passing_score ?? 70, max_attempts: quizData.max_attempts ?? 3 });

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: attemptsData } = await supabase
          .from('quiz_attempts')
          .select('id, score, passed, completed_at')
          .eq('quiz_id', quizData.id)
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false });

        if (attemptsData) setAttempts(attemptsData as QuizAttempt[]);
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    setStarted(true);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setAnswers({});
    setFinished(false);
    setScore(0);
    if (quiz?.time_limit_minutes) setTimeLeft(quiz.time_limit_minutes * 60);
  };

  const handleSelectAnswer = (index: number) => {
    if (answered) return;
    setSelectedAnswer(index);
  };

  const handleConfirmAnswer = () => {
    if (selectedAnswer === null || !quiz) return;
    setAnswered(true);
    setAnswers(prev => ({ ...prev, [currentQuestion]: selectedAnswer }));
  };

  const handleNext = () => {
    if (!quiz) return;
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    if (!quiz) return;
    const allAnswers = { ...answers };
    if (selectedAnswer !== null && !answered) {
      allAnswers[currentQuestion] = selectedAnswer;
    }

    let correct = 0;
    quiz.questions.forEach((q, i) => {
      if (allAnswers[i] === q.correct) correct++;
    });
    const finalScore = Math.round((correct / quiz.questions.length) * 100);
    const passed = finalScore >= (quiz.passing_score ?? 70);

    setScore(finalScore);
    setFinished(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('quiz_attempts').insert({
        user_id: user.id,
        quiz_id: quiz.id,
        answers: allAnswers as any,
        score: finalScore,
        passed,
        time_spent_seconds: quiz.time_limit_minutes ? (quiz.time_limit_minutes * 60) - (timeLeft ?? 0) : null,
      });

      setAttempts(prev => [{ id: crypto.randomUUID(), score: finalScore, passed, completed_at: new Date().toISOString() }, ...prev]);

      toast({
        title: passed ? "🎉 Aprovado!" : "Tente novamente",
        description: passed
          ? `Você acertou ${correct}/${quiz.questions.length} (${finalScore}%)`
          : `Você precisa de ${quiz.passing_score}% para passar. Acertou ${finalScore}%.`,
      });
    } catch (error) {
      console.error('Error saving attempt:', error);
    }
  };

  if (loading || !quiz) return null;

  const hasPassed = attempts.some(a => a.passed);
  const attemptsLeft = (quiz.max_attempts ?? 3) - attempts.length;
  const canRetry = !hasPassed && attemptsLeft > 0;

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // Not started yet
  if (!started || finished) {
    return (
      <div className="bg-accent/5 border border-accent/20 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-accent" />
          <h2 className="font-display font-bold text-lg text-foreground">{quiz.title}</h2>
        </div>

        {finished && (
          <div className={cn(
            "rounded-xl p-6 mb-4 text-center border",
            score >= (quiz.passing_score ?? 70)
              ? "bg-green-500/10 border-green-500/30"
              : "bg-destructive/10 border-destructive/30"
          )}>
            {score >= (quiz.passing_score ?? 70) ? (
              <Trophy className="w-10 h-10 text-green-500 mx-auto mb-2" />
            ) : (
              <XCircle className="w-10 h-10 text-destructive mx-auto mb-2" />
            )}
            <p className="text-2xl font-bold text-foreground">{score}%</p>
            <p className="text-sm text-muted-foreground mt-1">
              {score >= (quiz.passing_score ?? 70) ? "Parabéns! Você passou!" : `Mínimo necessário: ${quiz.passing_score}%`}
            </p>
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" />{quiz.questions.length} questões</span>
          <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" />Mínimo {quiz.passing_score}%</span>
          {quiz.time_limit_minutes && (
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{quiz.time_limit_minutes} min</span>
          )}
        </div>

        {attempts.length > 0 && (
          <div className="mb-4 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Tentativas anteriores:</p>
            {attempts.slice(0, 3).map((a, i) => (
              <div key={a.id} className="flex items-center gap-2 text-sm">
                {a.passed ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <XCircle className="w-3.5 h-3.5 text-destructive" />}
                <span className="text-foreground">{a.score}%</span>
              </div>
            ))}
            {!hasPassed && <p className="text-xs text-muted-foreground">{attemptsLeft} tentativa(s) restante(s)</p>}
          </div>
        )}

        {hasPassed ? (
          <div className="flex items-center gap-2 text-green-500 font-medium text-sm">
            <CheckCircle2 className="w-4 h-4" />
            Quiz concluído com sucesso!
          </div>
        ) : canRetry || attempts.length === 0 ? (
          <Button onClick={handleStart} className="bg-accent hover:bg-accent/90">
            {attempts.length === 0 ? <><Brain className="w-4 h-4 mr-2" />Iniciar Quiz</> : <><RotateCcw className="w-4 h-4 mr-2" />Tentar Novamente</>}
          </Button>
        ) : (
          <p className="text-sm text-destructive">Tentativas esgotadas.</p>
        )}
      </div>
    );
  }

  // Active quiz
  const question = quiz.questions[currentQuestion];
  const isCorrect = answered && selectedAnswer === question.correct;
  const progress = ((currentQuestion + (answered ? 1 : 0)) / quiz.questions.length) * 100;

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-accent" />
          <span className="text-sm text-muted-foreground">Questão {currentQuestion + 1}/{quiz.questions.length}</span>
        </div>
        {timeLeft !== null && (
          <span className={cn("text-sm font-mono font-medium", timeLeft < 60 ? "text-destructive" : "text-muted-foreground")}>
            <Clock className="w-3.5 h-3.5 inline mr-1" />{formatTime(timeLeft)}
          </span>
        )}
      </div>

      <Progress value={progress} className="h-1.5 mb-6" />

      {/* Question */}
      <h3 className="text-lg font-semibold text-foreground mb-5">{question.question}</h3>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {question.options.map((option, i) => {
          let style = "border-border/50 hover:border-accent/40 cursor-pointer";
          if (answered) {
            if (i === question.correct) style = "border-green-500 bg-green-500/10";
            else if (i === selectedAnswer) style = "border-destructive bg-destructive/10";
            else style = "border-border/30 opacity-50";
          } else if (selectedAnswer === i) {
            style = "border-accent bg-accent/10";
          }

          return (
            <button
              key={i}
              onClick={() => handleSelectAnswer(i)}
              disabled={answered}
              className={cn(
                "w-full text-left rounded-xl p-4 border-2 transition-all",
                style
              )}
            >
              <div className="flex items-center gap-3">
                <span className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 flex-shrink-0",
                  answered && i === question.correct ? "border-green-500 text-green-500" :
                  answered && i === selectedAnswer ? "border-destructive text-destructive" :
                  selectedAnswer === i ? "border-accent text-accent bg-accent/10" :
                  "border-muted-foreground/30 text-muted-foreground"
                )}>
                  {answered && i === question.correct ? <CheckCircle2 className="w-4 h-4" /> :
                   answered && i === selectedAnswer ? <XCircle className="w-4 h-4" /> :
                   String.fromCharCode(65 + i)}
                </span>
                <span className="text-sm text-foreground">{option}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {answered && question.explanation && (
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 mb-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-accent">Explicação: </span>
            {question.explanation}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {!answered ? (
          <Button onClick={handleConfirmAnswer} disabled={selectedAnswer === null} className="bg-accent hover:bg-accent/90">
            Confirmar
          </Button>
        ) : (
          <Button onClick={handleNext} className="bg-accent hover:bg-accent/90">
            {currentQuestion < quiz.questions.length - 1 ? <>Próxima <ChevronRight className="w-4 h-4 ml-1" /></> : <>Finalizar <Trophy className="w-4 h-4 ml-1" /></>}
          </Button>
        )}
      </div>
    </div>
  );
};
