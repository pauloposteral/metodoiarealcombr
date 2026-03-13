import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  Bell, Trophy, BookOpen, MessageSquare, Sparkles,
  CheckCircle2, X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Notification {
  id: string;
  type: 'achievement' | 'lesson' | 'community' | 'badge' | 'system';
  title: string;
  description: string;
  path?: string;
  time: Date;
  read: boolean;
}

export const NotificationBell = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const notifs: Notification[] = [];

    // Recent badge earnings
    const { data: badges } = await supabase
      .from('user_badges')
      .select('id, earned_at, badges(name, icon)')
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false })
      .limit(3);

    if (badges) {
      badges.forEach((b: any) => {
        if (b.badges) {
          notifs.push({
            id: `badge-${b.id}`,
            type: 'badge',
            title: `Novo badge: ${b.badges.name}`,
            description: 'Parabéns pela conquista!',
            path: '/membros/ranking',
            time: new Date(b.earned_at),
            read: false,
          });
        }
      });
    }

    // Recent lesson completions (last 5)
    const { data: progress } = await supabase
      .from('lesson_progress')
      .select('id, completed_at, lessons(title)')
      .eq('user_id', user.id)
      .eq('completed', true)
      .order('completed_at', { ascending: false })
      .limit(3);

    if (progress) {
      progress.forEach((p: any) => {
        if (p.lessons && p.completed_at) {
          notifs.push({
            id: `progress-${p.id}`,
            type: 'lesson',
            title: 'Aula concluída',
            description: p.lessons.title,
            time: new Date(p.completed_at),
            read: true,
          });
        }
      });
    }

    // Always add a welcome notification
    notifs.push({
      id: 'welcome',
      type: 'system',
      title: 'Bem-vindo ao Método IA Real!',
      description: 'Explore os módulos e comece a aprender.',
      path: '/membros/cursos',
      time: new Date(user.created_at),
      read: true,
    });

    // Sort by time
    notifs.sort((a, b) => b.time.getTime() - a.time.getTime());
    setNotifications(notifs);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleClick = (notif: Notification) => {
    if (notif.path) {
      navigate(notif.path);
      setOpen(false);
    }
  };

  const iconMap = {
    achievement: Trophy,
    lesson: CheckCircle2,
    community: MessageSquare,
    badge: Sparkles,
    system: BookOpen,
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 hover:bg-secondary rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-accent rounded-full text-[10px] font-bold text-accent-foreground flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
        <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
          <h3 className="font-display font-bold text-sm text-foreground">Notificações</h3>
          {unreadCount > 0 && (
            <span className="text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded-full font-medium">
              {unreadCount} nova{unreadCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="max-h-[320px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Nenhuma notificação
            </div>
          ) : (
            notifications.map(notif => {
              const Icon = iconMap[notif.type];
              return (
                <button
                  key={notif.id}
                  onClick={() => handleClick(notif)}
                  className={cn(
                    "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/50 border-b border-border/20 last:border-0",
                    !notif.read && "bg-accent/5"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                    !notif.read ? "bg-accent/20" : "bg-secondary"
                  )}>
                    <Icon className={cn("w-4 h-4", !notif.read ? "text-accent" : "text-muted-foreground")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm truncate", !notif.read ? "font-semibold text-foreground" : "text-foreground")}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{notif.description}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                      {formatDistanceToNow(notif.time, { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
