import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Search, Sun, Moon } from 'lucide-react';
import { GlobalSearch } from './GlobalSearch';
import { NotificationBell } from './NotificationBell';
import { useTheme } from '@/hooks/useTheme';
import { StreakBadge } from '@/components/gamification/StreakBadge';

interface MembersHeaderProps {
  user: User;
}

export const MembersHeader = ({ user }: MembersHeaderProps) => {
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Aluno';
  const [searchOpen, setSearchOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 min-w-0 items-center justify-between border-b border-border/50 bg-card/95 px-2 backdrop-blur-sm sm:px-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-1 sm:gap-4">
          <SidebarTrigger aria-label="Abrir menu de navegação" className="h-11 w-11 lg:hidden" />
          
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden lg:flex items-center gap-2 bg-secondary rounded-lg px-3 py-2 w-64 hover:bg-secondary/80 transition-colors"
          >
            <Search className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground flex-1 text-left">Buscar aulas...</span>
            <kbd className="text-[10px] text-muted-foreground/60 bg-background border border-border/50 rounded px-1.5 py-0.5">⌘K</kbd>
          </button>

          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Buscar aulas" className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-secondary transition-colors lg:hidden"
          >
            <Search className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="flex min-w-0 items-center gap-1 sm:gap-3">
          <div className="hidden sm:block"><StreakBadge userId={user.id} /></div>
          <button
            onClick={toggleTheme}
            className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-secondary transition-colors"
            aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
            title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-accent" /> : <Moon className="w-5 h-5 text-muted-foreground" />}
          </button>

          <NotificationBell />

          <div className="hidden items-center gap-3 sm:flex">
            <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center">
              <span className="text-accent font-semibold text-sm">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="hidden sm:block">
              <p className="max-w-[10rem] truncate text-sm font-medium text-foreground" title={displayName}>{displayName}</p>
              <p className="text-xs text-muted-foreground">Aluno</p>
            </div>
          </div>
        </div>
      </header>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};
