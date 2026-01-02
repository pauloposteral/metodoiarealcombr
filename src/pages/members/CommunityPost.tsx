import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Pin, Trash2, MoreVertical, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MembersLayout } from '@/components/members/MembersLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserAvatar } from '@/components/community/UserAvatar';
import { CommentSection } from '@/components/community/CommentSection';
import { getCategoryInfo } from '@/components/community/CategoryTabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  is_pinned: boolean;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  likes_count?: number;
  isLiked?: boolean;
}

const CommunityPost = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isModerator, setIsModerator] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
    fetchPost();
  }, [postId]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
      
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      setIsModerator(roles?.some(r => r.role === 'admin' || r.role === 'moderator') || false);
    }
  };

  const fetchPost = async () => {
    if (!postId) return;

    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          profiles:user_id (full_name, avatar_url)
        `)
        .eq('id', postId)
        .single();

      if (error) throw error;

      // Get likes
      const { count: likesCount } = await supabase
        .from('post_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      const { data: { user } } = await supabase.auth.getUser();
      let isLiked = false;
      if (user) {
        const { data: like } = await supabase
          .from('post_likes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .maybeSingle();
        isLiked = !!like;
      }

      setPost({
        ...data,
        likes_count: likesCount || 0,
        isLiked
      });
    } catch (error) {
      console.error('Error fetching post:', error);
      navigate('/membros/comunidade');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post || !currentUserId) return;

    try {
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', currentUserId)
        .maybeSingle();

      if (existingLike) {
        await supabase.from('post_likes').delete().eq('id', existingLike.id);
      } else {
        await supabase.from('post_likes').insert({
          post_id: post.id,
          user_id: currentUserId
        });
      }

      fetchPost();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleDelete = async () => {
    if (!post) return;

    try {
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;

      toast({
        title: 'Publicação excluída',
        description: 'A publicação foi removida com sucesso.'
      });

      navigate('/membros/comunidade');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a publicação.',
        variant: 'destructive'
      });
    }
  };

  const handlePin = async () => {
    if (!post || !isModerator) return;

    try {
      const { error } = await supabase
        .from('community_posts')
        .update({ is_pinned: !post.is_pinned })
        .eq('id', post.id);

      if (error) throw error;

      fetchPost();
    } catch (error) {
      console.error('Error pinning post:', error);
    }
  };

  if (loading) {
    return (
      <MembersLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
        </div>
      </MembersLayout>
    );
  }

  if (!post) {
    return (
      <MembersLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Publicação não encontrada.</p>
          <Link to="/membros/comunidade">
            <Button variant="link" className="text-gold mt-2">
              Voltar à comunidade
            </Button>
          </Link>
        </div>
      </MembersLayout>
    );
  }

  const categoryInfo = getCategoryInfo(post.category);
  const CategoryIcon = categoryInfo.icon;
  const userName = post.profiles?.full_name || 'Aluno';
  const isOwner = currentUserId === post.user_id;
  const canModerate = isModerator || isOwner;

  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: ptBR
  });

  return (
    <MembersLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back button */}
        <Link 
          to="/membros/comunidade"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar à comunidade
        </Link>

        {/* Post */}
        <Card className={`bg-card/50 border-border/50 ${post.is_pinned ? 'border-gold/50' : ''}`}>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <UserAvatar name={userName} avatarUrl={post.profiles?.avatar_url} size="lg" />
              
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {post.is_pinned && (
                        <Badge variant="secondary" className="bg-gold/20 text-gold border-0 gap-1">
                          <Pin className="w-3 h-3" />
                          Fixado
                        </Badge>
                      )}
                      <Badge variant="outline" className={`${categoryInfo.color} border-current/30 gap-1`}>
                        <CategoryIcon className="w-3 h-3" />
                        {categoryInfo.label}
                      </Badge>
                    </div>
                    <h1 className="text-2xl font-bold text-primary-foreground">
                      {post.title}
                    </h1>
                  </div>

                  {canModerate && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {isModerator && (
                          <DropdownMenuItem onClick={handlePin}>
                            <Pin className="w-4 h-4 mr-2" />
                            {post.is_pinned ? 'Desafixar' : 'Fixar'}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={handleDelete}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                  <span>por <span className="text-primary-foreground font-medium">{userName}</span></span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {timeAgo}
                  </span>
                </div>

                <div className="prose prose-invert max-w-none mb-6">
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {post.content}
                  </p>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 text-sm transition-colors ${
                      post.isLiked
                        ? 'text-red-400'
                        : 'text-muted-foreground hover:text-red-400'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                    {post.likes_count || 0} curtidas
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments */}
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-6">
            <CommentSection postId={postId} type="community" />
          </CardContent>
        </Card>
      </div>
    </MembersLayout>
  );
};

export default CommunityPost;
