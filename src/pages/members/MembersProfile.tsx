import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MembersLayout } from '@/components/members/MembersLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { useGamification } from '@/hooks/useGamification';
import {
  User, Camera, Save, Loader2, Trophy, Zap, CheckCircle2,
  BookOpen, Bookmark, Star, LogOut, Flame
} from 'lucide-react';

const MembersProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [completedLessons, setCompletedLessons] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [notesCount, setNotesCount] = useState(0);
  const [joinedAt, setJoinedAt] = useState('');

  const { userPoints, getLevelTitle } = useGamification(userId || undefined);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/auth'); return; }

      setUserId(user.id);
      setEmail(user.email || '');
      setJoinedAt(new Date(user.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }));

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, bio, avatar_url')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setFullName(profile.full_name || '');
        setBio(profile.bio || '');
        setAvatarUrl(profile.avatar_url || '');
      }

      // Stats
      const { count: total } = await supabase.from('lessons').select('*', { count: 'exact', head: true });
      setTotalLessons(total || 0);

      const { count: completed } = await supabase
        .from('lesson_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('completed', true);
      setCompletedLessons(completed || 0);

      const { count: bookmarks } = await supabase
        .from('lesson_bookmarks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      setBookmarksCount(bookmarks || 0);

      const { count: notes } = await supabase
        .from('lesson_notes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      setNotesCount(notes || 0);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, bio, avatar_url: avatarUrl, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;
      toast({ title: 'Perfil atualizado!', description: 'Suas informações foram salvas.' });
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível salvar.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const level = userPoints?.level || 1;
  const points = userPoints?.points || 0;

  if (loading) {
    return (
      <MembersLayout>
        <div className="max-w-3xl mx-auto animate-pulse space-y-6">
          <div className="h-40 bg-secondary rounded-2xl" />
          <div className="h-60 bg-secondary rounded-2xl" />
        </div>
      </MembersLayout>
    );
  }

  return (
    <MembersLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-navy to-navy-light rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
          <div className="relative z-10 flex items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-accent/20 flex items-center justify-center border-2 border-accent/30">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-full h-full rounded-2xl object-cover" />
                ) : (
                  <span className="text-accent font-bold text-2xl">
                    {(fullName || email).charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-primary-foreground">
                {fullName || 'Aluno'}
              </h1>
              <p className="text-primary-foreground/60 text-sm">{email}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-accent text-xs font-medium">
                  <Zap className="w-3.5 h-3.5" />
                  Nível {level} — {getLevelTitle(level)}
                </span>
                <span className="text-primary-foreground/40 text-xs">
                  Membro desde {joinedAt}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: CheckCircle2, label: 'Aulas feitas', value: completedLessons, color: 'text-accent' },
            { icon: Star, label: 'Pontos', value: points, color: 'text-accent' },
            { icon: Bookmark, label: 'Salvos', value: bookmarksCount, color: 'text-accent' },
            { icon: BookOpen, label: 'Notas', value: notesCount, color: 'text-accent' },
          ].map((stat, i) => (
            <div key={i} className="bg-card rounded-xl p-4 border border-border/50 text-center">
              <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-1.5`} />
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className="bg-card rounded-2xl p-6 border border-border/50">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-foreground">Progresso Geral</h2>
            <span className="text-sm font-bold text-accent">{progressPct}%</span>
          </div>
          <Progress value={progressPct} className="h-2.5 mb-2" />
          <p className="text-xs text-muted-foreground">{completedLessons} de {totalLessons} aulas concluídas</p>
        </div>

        {/* Edit Profile */}
        <div className="bg-card rounded-2xl p-6 border border-border/50">
          <h2 className="font-display font-bold text-foreground mb-4">Editar Perfil</h2>
          <div className="space-y-4">
            <div>
              <Label>Nome completo</Label>
              <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Seu nome" />
            </div>
            <div>
              <Label>Bio</Label>
              <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Conte um pouco sobre você..." rows={3} />
            </div>
            <div>
              <Label>URL do avatar</Label>
              <Input value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="https://..." />
            </div>
            <Button onClick={handleSave} disabled={saving} className="bg-accent hover:bg-accent/90">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Salvar alterações
            </Button>
          </div>
        </div>

        {/* Account */}
        <div className="bg-card rounded-2xl p-6 border border-border/50">
          <h2 className="font-display font-bold text-foreground mb-4">Conta</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">{email}</p>
              <p className="text-xs text-muted-foreground">E-mail da conta</p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="text-destructive border-destructive/30 hover:bg-destructive/10">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </MembersLayout>
  );
};

export default MembersProfile;
