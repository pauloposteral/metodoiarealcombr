import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart3, TrendingUp, Lightbulb, Flame,
  PieChart, Calendar, Zap
} from 'lucide-react';

interface AnalyticsData {
  totalCarousels: number;
  thisMonthCount: number;
  avgSlides: number;
  topNiches: { niche: string; count: number }[];
  topStyles: { style: string; count: number }[];
  recentActivity: { date: string; count: number }[];
}

// #52 Virality score predictor
const getViralityTip = (total: number): { score: number; tip: string } => {
  if (total >= 50) return { score: 92, tip: 'Você está no top 5% de criadores. Continue variando nichos!' };
  if (total >= 20) return { score: 75, tip: 'Boa frequência! Tente postar 4-5x por semana para maximizar alcance.' };
  if (total >= 10) return { score: 58, tip: 'Está crescendo! Foque em hooks provocativos para aumentar saves.' };
  if (total >= 5) return { score: 40, tip: 'Bom começo! Crie pelo menos 3 carrosséis por semana.' };
  return { score: 20, tip: 'Comece criando 1 carrossel por dia sobre seu nicho principal.' };
};

// #54 Trending ideas
const TRENDING_IDEAS = [
  '🔥 "5 erros que todo iniciante comete em [nicho]"',
  '💡 "Como [benefício] em [tempo] sem [dor]"',
  '📊 "Dados mostram que [insight surpreendente]"',
  '🚀 "O método que [resultado] usam para [objetivo]"',
  '⚡ "Pare de [erro] e comece a [solução]"',
  '🎯 "[Número] passos para [resultado] comprovado"',
];

export const AnalyticsDashboard = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: carousels } = await supabase
        .from('saved_carousels')
        .select('slides, config, created_at, topic')
        .eq('user_id', user.id);

      if (!carousels || carousels.length === 0) {
        setData({
          totalCarousels: 0, thisMonthCount: 0, avgSlides: 0,
          topNiches: [], topStyles: [], recentActivity: [],
        });
        setLoading(false);
        return;
      }

      const now = new Date();
      const thisMonth = carousels.filter(c => {
        const d = new Date(c.created_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });

      const avgSlides = Math.round(
        carousels.reduce((sum, c) => sum + ((c.slides as any[])?.length || 0), 0) / carousels.length
      );

      // Extract niches from config
      const nicheMap: Record<string, number> = {};
      const styleMap: Record<string, number> = {};
      carousels.forEach(c => {
        const cfg = c.config as any;
        if (cfg?.audience?.niche) {
          const n = cfg.audience.niche;
          nicheMap[n] = (nicheMap[n] || 0) + 1;
        }
        if (cfg?.format?.style) {
          const s = cfg.format.style;
          styleMap[s] = (styleMap[s] || 0) + 1;
        }
      });

      const topNiches = Object.entries(nicheMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([niche, count]) => ({ niche, count }));

      const topStyles = Object.entries(styleMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([style, count]) => ({ style, count }));

      // Recent 7 days activity
      const recentActivity: { date: string; count: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const count = carousels.filter(c => c.created_at.startsWith(dateStr)).length;
        recentActivity.push({ date: d.toLocaleDateString('pt-BR', { weekday: 'short' }), count });
      }

      setData({
        totalCarousels: carousels.length,
        thisMonthCount: thisMonth.length,
        avgSlides,
        topNiches,
        topStyles,
        recentActivity,
      });
      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data || data.totalCarousels === 0) {
    return (
      <Card className="p-6 text-center border-dashed">
        <BarChart3 className="w-10 h-10 mx-auto mb-2 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          Crie carrosséis para ver suas métricas aqui
        </p>
      </Card>
    );
  }

  const virality = getViralityTip(data.totalCarousels);
  const maxActivity = Math.max(...data.recentActivity.map(a => a.count), 1);

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold">{data.totalCarousels}</p>
          <p className="text-xs text-muted-foreground">Total criados</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold">{data.thisMonthCount}</p>
          <p className="text-xs text-muted-foreground">Este mês</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold">{data.avgSlides}</p>
          <p className="text-xs text-muted-foreground">Média slides</p>
        </Card>
      </div>

      {/* #52 Virality Score */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-accent" />
          <h4 className="text-sm font-semibold">Score de Viralidade</h4>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                className="text-muted"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                className="text-accent"
                strokeWidth="3"
                strokeDasharray={`${virality.score}, 100`}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
              {virality.score}
            </span>
          </div>
          <p className="text-xs text-muted-foreground flex-1">{virality.tip}</p>
        </div>
      </Card>

      {/* #53 Niche Benchmark */}
      {data.topNiches.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <PieChart className="w-4 h-4 text-accent" />
            <h4 className="text-sm font-semibold">Seus Nichos</h4>
          </div>
          <div className="space-y-2">
            {data.topNiches.map(n => (
              <div key={n.niche} className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="capitalize">{n.niche}</span>
                    <span className="text-muted-foreground">{n.count}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-accent rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(n.count / data.totalCarousels) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Activity Chart */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-accent" />
          <h4 className="text-sm font-semibold">Atividade (7 dias)</h4>
        </div>
        <div className="flex items-end gap-1 h-16">
          {data.recentActivity.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <motion.div
                className="w-full bg-accent/80 rounded-t"
                initial={{ height: 0 }}
                animate={{ height: `${Math.max((day.count / maxActivity) * 48, 2)}px` }}
                transition={{ delay: i * 0.05 }}
              />
              <span className="text-[10px] text-muted-foreground">{day.date}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* #54 Trending Ideas */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-4 h-4 text-accent" />
          <h4 className="text-sm font-semibold">Ideias Trending</h4>
        </div>
        <div className="space-y-2">
          {TRENDING_IDEAS.slice(0, 4).map((idea, i) => (
            <p key={i} className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              {idea}
            </p>
          ))}
        </div>
      </Card>
    </div>
  );
};
