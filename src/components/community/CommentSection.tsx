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
  is_pinned: boolean | null;
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
      let rawData: any[] = [];
      
      if (type === 'community' && postId) {
        const { data, error } = await supabase
          .from('community_comments')
          .select('*')
          .eq('post_id', postId)
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: true });
        if (error) throw error;
        rawData = data || [];
      } else if (type === 'lesson' && lessonId) {
        const { data, error } = await supabase
          .from('lesson_comments')
          .select('*')
          .eq('lesson_id', lessonId)
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: true });
        if (error) throw error;
        rawData = data || [];
      }

      // Get profiles for all users
      const userIds = [...new Set(rawData.map(c => c.user_id))];
      let profilesMap: { [key: string]: { full_name: string | null; avatar_url: string | null } } = {};
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);
        
        profiles?.forEach(p => {
          profilesMap[p.id] = { full_name: p.full_name, avatar_url: p.avatar_url };
        });
      }

      // Get likes
      const { data: { user } } = await supabase.auth.getUser();
      const likeColumn = type === 'community' ? 'community_comment_id' : 'lesson_comment_id';
      
      let likes: { [key: string]: { count: number; userLiked: boolean } } = {};
      
      if (rawData.length > 0) {
        const commentIds = rawData.map(c => c.id);
        
        const { data: likesData } = await supabase
          .from('comment_likes')
          .select('*')
          .in(likeColumn, commentIds);

        if (likesData) {
          likesData.forEach(like => {
            const commentId = type === 'community' ? like.community_comment_id : like.lesson_comment_id;
            if (commentId && !likes[commentId]) {
              likes[commentId] = { count: 0, userLiked: false };
            }
            if (commentId) {
              likes[commentId].count++;
              if (user && like.user_id === user.id) {
                likes[commentId].userLiked = true;
              }
            }
          });
        }
      }

      // Organize comments into threads
      const commentsWithData: Comment[] = rawData.map(comment => ({
        id: comment.id,
        content: comment.content,
        is_pinned: comment.is_pinned,
        created_at: comment.created_at,
        user_id: comment.user_id,
        parent_id: comment.parent_id,
        profiles: profilesMap[comment.user_id] || { full_name: null, avatar_url: null },
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

      if (type === 'community' && postId) {
        const { error } = await supabase
          .from('community_comments')
          .insert({
            user_id: user.id,
            content: newComment.trim(),
            post_id: postId
          });
        if (error) throw error;
      } else if (type === 'lesson' && lessonId) {
        const { error } = await supabase
          .from('lesson_comments')
          .insert({
            user_id: user.id,
            content: newComment.trim(),
            lesson_id: lessonId
          });
        if (error) throw error;
      }

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
        if (type === 'community') {
          await supabase.from('comment_likes').insert({
            user_id: user.id,
            community_comment_id: commentId
          });
        } else {
          await supabase.from('comment_likes').insert({
            user_id: user.id,
            lesson_comment_id: commentId
          });
        }
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

      if (type === 'community' && postId) {
        const { error } = await supabase
          .from('community_comments')
          .insert({
            user_id: user.id,
            content,
            parent_id: parentId,
            post_id: postId
          });
        if (error) throw error;
      } else if (type === 'lesson' && lessonId) {
        const { error } = await supabase
          .from('lesson_comments')
          .insert({
            user_id: user.id,
            content,
            parent_id: parentId,
            lesson_id: lessonId
          });
        if (error) throw error;
      }

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
      if (type === 'community') {
        const { error } = await supabase
          .from('community_comments')
          .delete()
          .eq('id', commentId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('lesson_comments')
          .delete()
          .eq('id', commentId);
        if (error) throw error;
      }

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
      
      if (type === 'community') {
        const { error } = await supabase
          .from('community_comments')
          .update({ is_pinned: !comment?.is_pinned })
          .eq('id', commentId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('lesson_comments')
          .update({ is_pinned: !comment?.is_pinned })
          .eq('id', commentId);
        if (error) throw error;
      }

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
