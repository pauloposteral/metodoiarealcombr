import { useState, useEffect } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CommentItem } from './CommentItem';

interface Comment {
  id: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  likes_count?: number;
  isLiked?: boolean;
  replies?: Comment[];
}

interface CommentSectionProps {
  postId?: string;
  lessonId?: string;
  type: 'community' | 'lesson';
}

export const CommentSection = ({ postId, lessonId, type }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isModerator, setIsModerator] = useState(false);
  const { toast } = useToast();

  const tableName = type === 'community' ? 'community_comments' : 'lesson_comments';
  const foreignKey = type === 'community' ? 'post_id' : 'lesson_id';
  const foreignValue = type === 'community' ? postId : lessonId;

  useEffect(() => {
    fetchCurrentUser();
    fetchComments();
  }, [postId, lessonId]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
      
      // Check if moderator
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      setIsModerator(roles?.some(r => r.role === 'admin' || r.role === 'moderator') || false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select(`
          *,
          profiles:user_id (full_name, avatar_url)
        `)
        .eq(foreignKey, foreignValue)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get likes
      const { data: { user } } = await supabase.auth.getUser();
      const likeColumn = type === 'community' ? 'community_comment_id' : 'lesson_comment_id';
      
      let likes: { [key: string]: { count: number; userLiked: boolean } } = {};
      
      if (data && data.length > 0) {
        const commentIds = data.map(c => c.id);
        
        const { data: likesData } = await supabase
          .from('comment_likes')
          .select('*')
          .in(likeColumn, commentIds);

        if (likesData) {
          likesData.forEach(like => {
            const commentId = like[likeColumn];
            if (!likes[commentId]) {
              likes[commentId] = { count: 0, userLiked: false };
            }
            likes[commentId].count++;
            if (user && like.user_id === user.id) {
              likes[commentId].userLiked = true;
            }
          });
        }
      }

      // Organize comments into threads
      const commentsWithData = (data || []).map(comment => ({
        ...comment,
        likes_count: likes[comment.id]?.count || 0,
        isLiked: likes[comment.id]?.userLiked || false,
        replies: [] as Comment[]
      }));

      const rootComments: Comment[] = [];
      const commentMap: { [key: string]: Comment } = {};

      commentsWithData.forEach(comment => {
        commentMap[comment.id] = comment;
      });

      commentsWithData.forEach(comment => {
        if (comment.parent_id && commentMap[comment.parent_id]) {
          commentMap[comment.parent_id].replies!.push(comment);
        } else if (!comment.parent_id) {
          rootComments.push(comment);
        }
      });

      setComments(rootComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const insertData: Record<string, unknown> = {
        user_id: user.id,
        content: newComment.trim(),
        [foreignKey]: foreignValue
      };

      const { error } = await supabase
        .from(tableName)
        .insert(insertData);

      if (error) throw error;

      setNewComment('');
      fetchComments();
      
      toast({
        title: 'Comentário adicionado!',
        description: 'Sua contribuição foi registrada.'
      });
    } catch (error) {
      console.error('Error creating comment:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o comentário.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (commentId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const likeColumn = type === 'community' ? 'community_comment_id' : 'lesson_comment_id';

      // Check if already liked
      const { data: existingLike } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq(likeColumn, commentId)
        .maybeSingle();

      if (existingLike) {
        await supabase.from('comment_likes').delete().eq('id', existingLike.id);
      } else {
        await supabase.from('comment_likes').insert({
          user_id: user.id,
          [likeColumn]: commentId
        });
      }

      fetchComments();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleReply = async (parentId: string, content: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const insertData: Record<string, unknown> = {
        user_id: user.id,
        content,
        parent_id: parentId,
        [foreignKey]: foreignValue
      };

      const { error } = await supabase
        .from(tableName)
        .insert(insertData);

      if (error) throw error;

      fetchComments();
    } catch (error) {
      console.error('Error creating reply:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar a resposta.',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      fetchComments();
      toast({
        title: 'Comentário excluído',
        description: 'O comentário foi removido.'
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o comentário.',
        variant: 'destructive'
      });
    }
  };

  const handlePin = async (commentId: string) => {
    if (!isModerator) return;

    try {
      const comment = comments.find(c => c.id === commentId) || 
        comments.flatMap(c => c.replies || []).find(r => r.id === commentId);
      
      const { error } = await supabase
        .from(tableName)
        .update({ is_pinned: !comment?.is_pinned })
        .eq('id', commentId);

      if (error) throw error;

      fetchComments();
    } catch (error) {
      console.error('Error pinning comment:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-lg font-semibold text-primary-foreground">
        <MessageCircle className="w-5 h-5 text-gold" />
        Comentários ({comments.length})
      </div>

      {/* New comment input */}
      <div className="space-y-3">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Compartilhe sua dúvida ou aprendizado..."
          rows={3}
          maxLength={1000}
        />
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            {newComment.length}/1000 caracteres
          </span>
          <Button
            onClick={handleSubmitComment}
            disabled={submitting || !newComment.trim()}
            className="bg-gold hover:bg-gold/90 text-navy-dark gap-2"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Enviando...' : 'Comentar'}
          </Button>
        </div>
      </div>

      {/* Comments list */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Carregando comentários...
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Seja o primeiro a comentar!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId || undefined}
              isModerator={isModerator}
              onLike={handleLike}
              onReply={handleReply}
              onDelete={handleDelete}
              onPin={handlePin}
            />
          ))}
        </div>
      )}
    </div>
  );
};
