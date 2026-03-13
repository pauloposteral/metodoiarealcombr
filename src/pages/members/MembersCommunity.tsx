import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Trophy, Search } from 'lucide-react';
import { MembersLayout } from '@/components/members/MembersLayout';
import { WelcomeMessage } from '@/components/community/WelcomeMessage';
import { CommunityRules } from '@/components/community/CommunityRules';
import { CategoryTabs, CategoryType } from '@/components/community/CategoryTabs';
import { PostCard } from '@/components/community/PostCard';
import { CreatePostDialog } from '@/components/community/CreatePostDialog';
import { ActivityIndicator } from '@/components/community/ActivityIndicator';
import { LeaderboardCard } from '@/components/gamification/LeaderboardCard';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type SortType = 'recent' | 'popular';

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
  _count?: {
    comments: number;
    likes: number;
  };
  isLiked?: boolean;
}

const MembersCommunity = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [sortBy, setSortBy] = useState<SortType>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState<string | undefined>();
  const [stats, setStats] = useState({
    totalPosts: 0,
    todayPosts: 0,
    totalComments: 0,
    activeMembers: 0
  });

  const { leaderboard, userRank } = useGamification(userId);

  useEffect(() => {
    fetchUserName();
    fetchPosts();
    fetchStats();
  }, [activeCategory, sortBy, searchQuery]);

  const fetchUserName = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();
      
      setUserName(profile?.full_name || user.email?.split('@')[0] || 'Aluno');
    }
  };

  const fetchStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count: totalPosts } = await supabase
        .from('community_posts')
        .select('*', { count: 'exact', head: true });

      const { count: todayPosts } = await supabase
        .from('community_posts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      const { count: totalComments } = await supabase
        .from('community_comments')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalPosts: totalPosts || 0,
        todayPosts: todayPosts || 0,
        totalComments: totalComments || 0,
        activeMembers: 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('community_posts')
        .select('*');

      if (activeCategory !== 'all') {
        query = query.eq('category', activeCategory);
      }

      query = query.order('is_pinned', { ascending: false });

      if (sortBy === 'recent') {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;

      // Get profiles for all users
      const userIds = [...new Set((data || []).map(p => p.user_id))];
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

      // Get counts and likes
      const { data: { user } } = await supabase.auth.getUser();
      
      const postsWithCounts: Post[] = await Promise.all((data || []).map(async (post) => {
        const { count: commentsCount } = await supabase
          .from('community_comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);

        const { count: likesCount } = await supabase
          .from('post_likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);

        let isLiked = false;
        if (user) {
          const { data: like } = await supabase
            .from('post_likes')
            .select('id')
            .eq('post_id', post.id)
            .eq('user_id', user.id)
            .maybeSingle();
          isLiked = !!like;
        }

        return {
          ...post,
          profiles: profilesMap[post.user_id] || { full_name: null, avatar_url: null },
          _count: {
            comments: commentsCount || 0,
            likes: likesCount || 0
          },
          isLiked
        };
      }));

      // Sort by popularity if needed
      if (sortBy === 'popular') {
        postsWithCounts.sort((a, b) => {
          const aScore = (a._count?.likes || 0) + (a._count?.comments || 0);
          const bScore = (b._count?.likes || 0) + (b._count?.comments || 0);
          return bScore - aScore;
        });
      }

      setPosts(postsWithCounts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingLike) {
        await supabase.from('post_likes').delete().eq('id', existingLike.id);
      } else {
        await supabase.from('post_likes').insert({
          post_id: postId,
          user_id: user.id
        });
      }

      fetchPosts();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return (
    <MembersLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary-foreground flex items-center gap-3">
              <Users className="w-8 h-8 text-gold" />
              Comunidade Método IA Real
            </h1>
            <p className="text-muted-foreground mt-1">
              Troque experiências, tire dúvidas e compartilhe resultados
            </p>
          </div>
          <CreatePostDialog onPostCreated={fetchPosts} />
        </div>

        {/* Welcome message */}
        <WelcomeMessage userName={userName} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CategoryTabs 
                activeCategory={activeCategory} 
                onCategoryChange={setActiveCategory} 
              />
              
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortType)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Mais recentes</SelectItem>
                  <SelectItem value="popular">Mais relevantes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Posts */}
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Carregando publicações...
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhuma publicação encontrada. Seja o primeiro a compartilhar!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map(post => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    onLike={handleLike}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ActivityIndicator stats={stats} />
            
            {/* Mini Leaderboard */}
            <div className="bg-card rounded-2xl p-4 border border-border/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-gold" />
                  <h3 className="font-display font-bold text-sm text-foreground">Top 5</h3>
                </div>
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={() => navigate('/membros/ranking')}
                  className="text-xs text-accent p-0 h-auto"
                >
                  Ver todos
                </Button>
              </div>
              <div className="space-y-2">
                {leaderboard.slice(0, 5).map((user, index) => (
                  <div 
                    key={user.user_id}
                    className={`flex items-center gap-2 p-2 rounded-lg ${
                      user.user_id === userId ? 'bg-accent/10' : ''
                    }`}
                  >
                    <span className={`w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-amber-600 text-white' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="flex-1 text-sm truncate text-foreground">
                      {user.full_name || 'Usuário'}
                    </span>
                    <span className="text-xs font-bold text-accent">{user.points}</span>
                  </div>
                ))}
              </div>
            </div>

            <CommunityRules />
          </div>
        </div>
      </div>
    </MembersLayout>
  );
};

export default MembersCommunity;
