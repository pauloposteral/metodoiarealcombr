import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, Mail, MessageSquare, Trophy, Newspaper, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Prefs {
  email_lesson_reminders: boolean;
  email_community_replies: boolean;
  email_achievements: boolean;
  email_weekly_digest: boolean;
}

interface NotificationSettingsProps {
  userId: string;
}

export const NotificationSettings = ({ userId }: NotificationSettingsProps) => {
  const [prefs, setPrefs] = useState<Prefs>({
    email_lesson_reminders: true,
    email_community_replies: true,
    email_achievements: true,
    email_weekly_digest: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (data) {
        setPrefs({
          email_lesson_reminders: data.email_lesson_reminders,
          email_community_replies: data.email_community_replies,
          email_achievements: data.email_achievements,
          email_weekly_digest: data.email_weekly_digest,
        });
      } else {
        // Create default prefs
        await supabase.from('notification_preferences').insert({ user_id: userId });
      }
      setLoading(false);
    };
    if (userId) fetch();
  }, [userId]);

  const updatePref = async (key: keyof Prefs, value: boolean) => {
    setPrefs(prev => ({ ...prev, [key]: value }));
    const { error } = await supabase
      .from('notification_preferences')
      .update({ [key]: value, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) {
      setPrefs(prev => ({ ...prev, [key]: !value }));
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <Card className="p-6 border-border/50">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Carregando preferências...</span>
        </div>
      </Card>
    );
  }

  const options = [
    { key: 'email_lesson_reminders' as const, label: 'Lembretes de aulas', desc: 'Receba lembretes para continuar estudando', icon: Mail },
    { key: 'email_community_replies' as const, label: 'Respostas na comunidade', desc: 'Quando alguém responder seus posts', icon: MessageSquare },
    { key: 'email_achievements' as const, label: 'Conquistas', desc: 'Quando desbloquear novas conquistas', icon: Trophy },
    { key: 'email_weekly_digest' as const, label: 'Resumo semanal', desc: 'Resumo de atividades da semana', icon: Newspaper },
  ];

  return (
    <Card className="p-6 border-border/50">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-5 h-5 text-accent" />
        <h2 className="font-display font-bold text-foreground">Notificações</h2>
      </div>
      <div className="space-y-4">
        {options.map(opt => (
          <div key={opt.key} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <opt.icon className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label className="text-sm font-medium text-foreground">{opt.label}</Label>
                <p className="text-xs text-muted-foreground">{opt.desc}</p>
              </div>
            </div>
            <Switch
              checked={prefs[opt.key]}
              onCheckedChange={(v) => updatePref(opt.key, v)}
            />
          </div>
        ))}
      </div>
    </Card>
  );
};
