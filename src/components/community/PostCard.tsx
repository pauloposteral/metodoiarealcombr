import { Heart, MessageCircle, Pin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from './UserAvatar';
import { getCategoryInfo } from './CategoryTabs';

interface PostCardProps {
  post: {
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
    _count?: {
      comments: number;
      likes: number;
    };
    isLiked?: boolean;
  };
  onLike: (postId: string) => void;
}

export const PostCard = ({ post, onLike }: PostCardProps) => {
  const categoryInfo = getCategoryInfo(post.category);
  const CategoryIcon = categoryInfo.icon;
  const userName = post.profiles?.full_name || 'Aluno';
  
  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: ptBR
  });

  return (
    <Card className={`bg-card/50 border-border/50 hover:border-gold/30 transition-all duration-300 ${post.is_pinned ? 'border-gold/50 bg-gold/5' : ''}`}>
      <CardContent className="p-5">
        <div className="flex gap-4">
          <UserAvatar name={userName} avatarUrl={post.profiles?.avatar_url} />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
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
              <span className="text-xs text-muted-foreground flex items-center gap-1 flex-shrink-0">
                <Clock className="w-3 h-3" />
                {timeAgo}
              </span>
            </div>

            <Link to={`/membros/comunidade/post/${post.id}`} className="block group">
              <h3 className="text-lg font-semibold text-primary-foreground group-hover:text-gold transition-colors mb-2 line-clamp-2">
                {post.title}
              </h3>
              <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                {post.content}
              </p>
            </Link>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                por <span className="text-primary-foreground font-medium">{userName}</span>
              </span>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => onLike(post.id)}
                  className={`flex items-center gap-1.5 text-sm transition-colors ${
                    post.isLiked 
                      ? 'text-red-400' 
                      : 'text-muted-foreground hover:text-red-400'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                  {post._count?.likes || 0}
                </button>
                <Link 
                  to={`/membros/comunidade/post/${post.id}`}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  {post._count?.comments || 0}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
