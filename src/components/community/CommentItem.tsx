import { useState } from 'react';
import { Heart, Reply, Pin, Trash2, MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserAvatar } from './UserAvatar';

interface CommentItemProps {
  comment: {
    id: string;
    content: string;
    is_pinned: boolean;
    created_at: string;
    user_id: string;
    profiles?: {
      full_name: string | null;
      avatar_url: string | null;
    } | null;
    likes_count?: number;
    isLiked?: boolean;
    replies?: CommentItemProps['comment'][];
  };
  currentUserId?: string;
  isModerator?: boolean;
  onLike: (commentId: string) => void;
  onReply: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onPin?: (commentId: string) => void;
  depth?: number;
}

export const CommentItem = ({
  comment,
  currentUserId,
  isModerator,
  onLike,
  onReply,
  onDelete,
  onPin,
  depth = 0
}: CommentItemProps) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userName = comment.profiles?.full_name || 'Aluno';
  const isOwner = currentUserId === comment.user_id;
  const canModerate = isModerator || isOwner;
  const maxDepth = 3;

  const timeAgo = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: true,
    locale: ptBR
  });

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) return;
    
    setIsSubmitting(true);
    await onReply(comment.id, replyContent.trim());
    setReplyContent('');
    setShowReplyInput(false);
    setIsSubmitting(false);
  };

  return (
    <div className={`${depth > 0 ? 'ml-8 mt-4 pl-4 border-l-2 border-border/50' : ''}`}>
      <div className={`p-4 rounded-lg ${comment.is_pinned ? 'bg-gold/10 border border-gold/30' : 'bg-card/30'}`}>
        <div className="flex gap-3">
          <UserAvatar name={userName} avatarUrl={comment.profiles?.avatar_url} size="sm" />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-primary-foreground text-sm">{userName}</span>
                {comment.is_pinned && (
                  <span className="text-xs text-gold flex items-center gap-1">
                    <Pin className="w-3 h-3" />
                    Fixado
                  </span>
                )}
                <span className="text-xs text-muted-foreground">{timeAgo}</span>
              </div>
              
              {canModerate && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isModerator && onPin && (
                      <DropdownMenuItem onClick={() => onPin(comment.id)}>
                        <Pin className="w-4 h-4 mr-2" />
                        {comment.is_pinned ? 'Desafixar' : 'Fixar'}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={() => onDelete(comment.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <p className="text-muted-foreground text-sm whitespace-pre-wrap mb-3">
              {comment.content}
            </p>

            <div className="flex items-center gap-4">
              <button
                onClick={() => onLike(comment.id)}
                className={`flex items-center gap-1.5 text-xs transition-colors ${
                  comment.isLiked
                    ? 'text-red-400'
                    : 'text-muted-foreground hover:text-red-400'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${comment.isLiked ? 'fill-current' : ''}`} />
                {comment.likes_count || 0}
              </button>

              {depth < maxDepth && (
                <button
                  onClick={() => setShowReplyInput(!showReplyInput)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold transition-colors"
                >
                  <Reply className="w-3.5 h-3.5" />
                  Responder
                </button>
              )}
            </div>

            {showReplyInput && (
              <div className="mt-3 space-y-2">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Escreva sua resposta..."
                  rows={2}
                  className="text-sm"
                  maxLength={1000}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReplyInput(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmitReply}
                    disabled={isSubmitting || !replyContent.trim()}
                    className="bg-gold hover:bg-gold/90 text-navy-dark"
                  >
                    {isSubmitting ? 'Enviando...' : 'Responder'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              isModerator={isModerator}
              onLike={onLike}
              onReply={onReply}
              onDelete={onDelete}
              onPin={onPin}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
