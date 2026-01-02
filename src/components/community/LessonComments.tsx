import { CommentSection } from './CommentSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';

interface LessonCommentsProps {
  lessonId: string;
}

export const LessonComments = ({ lessonId }: LessonCommentsProps) => {
  return (
    <Card className="bg-card/50 border-border/50 mt-8">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-gold" />
          Discussão da Aula
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Compartilhe sua dúvida ou aprendizado com outros alunos
        </p>
      </CardHeader>
      <CardContent>
        <CommentSection lessonId={lessonId} type="lesson" />
      </CardContent>
    </Card>
  );
};
