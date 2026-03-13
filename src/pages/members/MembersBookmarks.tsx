import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MembersLayout } from '@/components/members/MembersLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Bookmark, BookOpen, Clock, Trash2, ChevronRight } from 'lucide-react';

interface BookmarkedLesson {
  id: string;
  bookmark_id: string;
  title: string;
  description: string | null;
  estimated_minutes: number | null;
  type: string | null;
  bookmarked_at: string;
}

const MembersBookmarks = () => {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<BookmarkedLesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('lesson_bookmarks')
      .select('id, created_at, lessons(id, title, description, estimated_minutes, type)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setBookmarks(data.map((b: any) => ({
        id: b.lessons.id,
        bookmark_id: b.id,
        title: b.lessons.title,
        description: b.lessons.description,
        estimated_minutes: b.lessons.estimated_minutes,
        type: b.lessons.type,
        bookmarked_at: b.created_at,
      })));
    }
    setLoading(false);
  };

  const removeBookmark = async (bookmarkId: string) => {
    await supabase.from('lesson_bookmarks').delete().eq('id', bookmarkId);
    setBookmarks(prev => prev.filter(b => b.bookmark_id !== bookmarkId));
  };

  return (
    <MembersLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Bookmark className="w-6 h-6 text-accent" />
          <h1 className="font-display text-2xl font-bold text-foreground">Aulas Salvas</h1>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-secondary rounded-xl animate-pulse" />)}
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-12">
            <Bookmark className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">Nenhuma aula salva ainda</p>
            <p className="text-sm text-muted-foreground/60 mb-4">
              Clique no ícone de bookmark nas aulas para salvá-las aqui
            </p>
            <Button variant="outline" onClick={() => navigate('/membros/cursos')}>
              <BookOpen className="w-4 h-4 mr-2" />Ver cursos
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarks.map(lesson => (
              <div
                key={lesson.bookmark_id}
                className="bg-card rounded-xl border border-border/50 p-4 flex items-center gap-4 hover:border-accent/30 transition-colors group"
              >
                <button
                  onClick={() => navigate(`/membros/aula/${lesson.id}`)}
                  className="flex-1 flex items-center gap-4 text-left min-w-0"
                >
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-accent" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{lesson.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {lesson.estimated_minutes && (
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{lesson.estimated_minutes}min</span>
                      )}
                      <span>{lesson.type || 'text'}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                  onClick={() => removeBookmark(lesson.bookmark_id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </MembersLayout>
  );
};

export default MembersBookmarks;
