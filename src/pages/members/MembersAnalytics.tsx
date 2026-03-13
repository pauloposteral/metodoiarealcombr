import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MembersLayout } from '@/components/members/MembersLayout';
import { supabase } from '@/integrations/supabase/client';
import { useGamification } from '@/hooks/useGamification';
import { useStreak } from '@/hooks/useStreak';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3, Flame, Trophy, BookOpen, Clock, TrendingUp,
  Calendar, CheckCircle2, Target, Award
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

interface ModuleProgress {
  name: string;
  completed: number;
  total: number;
  pct: number;
}

const COLORS = ['hsl(var(--accent))', '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#14b8a6', '#8b5cf6', '#f97316'];

const MembersAnalytics = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState<{ day: string; lessons: number }[]>([]);
  const [totalTime, setTotalTime] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const [recentActivity, setRecentActivity] = useState<{ date: string; count: number }[]>([]);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([]);
  const [achievements, setAchievements] = useState(0);

  const { userPoints, getLevelTitle } = useGamification(userId || undefined);
  const { streak } = useStreak(userId || undefined);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/auth'); return; }
      setUserId(user.id);

      const [progressRes, totalRes, timeRes, modulesRes, achievementsRes] = await Promise.all([
        supabase.from('lesson_progress').select('completed_at, time_spent_seconds, completed, lesson_id').eq('user_id', user.id),
        supabase.from('lessons').select('*', { count: 'exact', head: true }),
        supabase.from('lesson_progress').select('time_spent_seconds').eq('user_id', user.id),
        supabase.from('modules').select('id, title, lessons(id)').order('order_index'),
        supabase.from('user_achievements').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);

      const progress = progressRes.data || [];
      const completedIds = new Set(progress.filter(p => p.completed).map(p => p.lesson_id));
      setTotalLessons(totalRes.count || 0);
      setCompletedLessons(completedIds.size);
      setAchievements(achievementsRes.count || 0);

      // Total time
      const total = (timeRes.data || []).reduce((acc, p) => acc + (p.time_spent_seconds || 0), 0);
      setTotalTime(total);

      // Module progress
      const modules = (modulesRes.data || []) as any[];
      const modProg: ModuleProgress[] = modules.map(m => {
        const lessonIds = (m.lessons || []).map((l: any) => l.id);
        const done = lessonIds.filter((id: string) => completedIds.has(id)).length;
        return {
          name: m.title.length > 18 ? m.title.substring(0, 18) + '…' : m.title,
          completed: done,
          total: lessonIds.length,
          pct: lessonIds.length > 0 ? Math.round((done / lessonIds.length) * 100) : 0,
        };
      });
      setModuleProgress(modProg);

      // Weekly activity
      const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const weekly = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toISOString().split('T')[0];
        const count = progress.filter(p => p.completed && p.completed_at?.startsWith(dateStr)).length;
        return { day: days[d.getDay()], lessons: count };
      });
      setWeeklyData(weekly);

      // Monthly activity
      const monthly = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        const dateStr = d.toISOString().split('T')[0];
        const count = progress.filter(p => p.completed && p.completed_at?.startsWith(dateStr)).length;
        return { date: `${d.getDate()}/${d.getMonth() + 1}`, count };
      });
      setRecentActivity(monthly);

      setLoading(false);
    };
    load();
  }, [navigate]);

  const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const hours = Math.floor(totalTime / 3600);
  const minutes = Math.floor((totalTime % 3600) / 60);
  const level = userPoints?.level || 1;
  const points = userPoints?.points || 0;

  if (loading) {
    return (
      <MembersLayout>
        <div className="max-w-5xl mx-auto animate-pulse space-y-6">
          <div className="h-32 bg-secondary rounded-2xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-secondary rounded-xl" />)}
          </div>
          <div className="h-64 bg-secondary rounded-2xl" />
        </div>
      </MembersLayout>
    );
  }

  return (
    <MembersLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Meu Progresso</h1>
          <p className="text-sm text-muted-foreground">Acompanhe sua evolução no curso</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { icon: CheckCircle2, label: 'Aulas concluídas', value: `${completedLessons}/${totalLessons}`, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { icon: Flame, label: 'Streak atual', value: `${streak.current_streak} dias`, color: 'text-orange-500', bg: 'bg-orange-500/10' },
            { icon: Trophy, label: 'Nível', value: `${level} — ${getLevelTitle(level)}`, color: 'text-accent', bg: 'bg-accent/10' },
            { icon: Clock, label: 'Tempo total', value: `${hours}h ${minutes}min`, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { icon: Award, label: 'Conquistas', value: `${achievements}`, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          ].map((stat, i) => (
            <Card key={i} className="p-4 border-border/50">
              <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
              </div>
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Progress bar */}
        <Card className="p-6 border-border/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-accent" />
              <h2 className="font-display font-bold text-foreground">Progresso Geral</h2>
            </div>
            <span className="text-sm font-bold text-accent">{progressPct}%</span>
          </div>
          <Progress value={progressPct} className="h-3 mb-2" />
          <p className="text-xs text-muted-foreground">{completedLessons} de {totalLessons} aulas concluídas</p>
        </Card>

        {/* Module Progress */}
        {moduleProgress.length > 0 && (
          <Card className="p-6 border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-accent" />
              <h2 className="font-display font-bold text-foreground">Progresso por Módulo</h2>
            </div>
            <div className="space-y-3">
              {moduleProgress.map((mod, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-foreground truncate max-w-[70%]">{mod.name}</span>
                    <span className="text-xs text-muted-foreground">{mod.completed}/{mod.total} · {mod.pct}%</span>
                  </div>
                  <Progress value={mod.pct} className="h-2" />
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-accent" />
              <h2 className="font-display font-bold text-foreground">Esta Semana</h2>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar dataKey="lessons" name="Aulas" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-accent" />
              <h2 className="font-display font-bold text-foreground">Últimos 30 dias</h2>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={recentActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} interval={4} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area type="monotone" dataKey="count" name="Aulas" stroke="hsl(var(--accent))" fill="hsl(var(--accent) / 0.2)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Streak details */}
        <Card className="p-6 border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-orange-500" />
            <h2 className="font-display font-bold text-foreground">Sequência de Estudos</h2>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-orange-500">{streak.current_streak}</p>
              <p className="text-xs text-muted-foreground">Streak atual</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-accent">{streak.longest_streak}</p>
              <p className="text-xs text-muted-foreground">Maior streak</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{points}</p>
              <p className="text-xs text-muted-foreground">Pontos totais</p>
            </div>
          </div>
        </Card>
      </div>
    </MembersLayout>
  );
};

export default MembersAnalytics;
