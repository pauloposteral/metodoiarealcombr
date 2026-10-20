import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuAction, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton, SidebarHeader, SidebarFooter, useSidebar } from '@/components/ui/sidebar';
import { Home, BookOpen, FlaskConical, Clapperboard, UserRound, LogOut, ChevronLeft, ChevronDown, X, type LucideIcon } from 'lucide-react';
import logo from '@/assets/logo-iareal.png';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { MEMBER_NAVIGATION, memberNavigationGroup, type MemberDestination } from '@/lib/memberNavigation';

const icons: Record<MemberDestination, LucideIcon> = { home: Home, learn: BookOpen, lab: FlaskConical, create: Clapperboard, profile: UserRound };
export const MembersSidebar = () => {
  const navigate = useNavigate(); const { pathname } = useLocation();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === 'collapsed' && !isMobile;
  const activeGroup = memberNavigationGroup(pathname);
  const [expanded, setExpanded] = useState<MemberDestination | null>(activeGroup);
  useEffect(() => { setExpanded(activeGroup); }, [activeGroup]);
  function follow() { if (isMobile) setOpenMobile(false); }
  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) { toast({ title: 'Não foi possível sair. Tente novamente.', variant: 'destructive' }); return; }
    toast({ title: 'Até logo!', description: 'Você foi desconectado com sucesso.' }); navigate('/');
  }
  return <Sidebar className="border-r border-border/50" collapsible="icon">
    <SidebarHeader className="flex flex-row items-center justify-between border-b border-border/50 p-4"><Link to="/membros" onClick={follow} aria-label="Método IA Real — início"><img src={logo} alt="Método IA Real" className={`${collapsed ? 'w-10' : 'w-[180px]'} h-auto object-contain`} /></Link>{isMobile && <button type="button" onClick={() => setOpenMobile(false)} aria-label="Fechar menu" className="flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><X className="h-5 w-5" aria-hidden="true" /></button>}</SidebarHeader>
    <SidebarContent className="py-4"><SidebarGroup><SidebarGroupContent><nav aria-label="Navegação principal do aluno"><SidebarMenu>
      {MEMBER_NAVIGATION.map(group => {
        const Icon = icons[group.id]; const open = expanded === group.id && !collapsed;
        return <SidebarMenuItem key={group.id} data-primary-destination={group.id}>
          <SidebarMenuButton asChild isActive={activeGroup === group.id} className="min-h-12">
            <Link to={group.url} onClick={follow} title={group.title} aria-label={group.title} aria-current={pathname === group.url ? 'page' : undefined} className="flex items-center gap-3 rounded-xl px-3 py-3"><Icon className="h-5 w-5 shrink-0" aria-hidden="true" />{!collapsed && <span className="font-medium">{group.title}</span>}</Link>
          </SidebarMenuButton>
          {group.items.length > 0 && !collapsed && <SidebarMenuAction type="button" aria-label={`${open ? 'Recolher' : 'Mostrar'} opções de ${group.title}`} aria-expanded={open} aria-controls={`nav-${group.id}`} className="right-1 top-1 min-h-10 min-w-10" onClick={() => setExpanded(open ? null : group.id)}><ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" /></SidebarMenuAction>}
          {group.items.length > 0 && open && <SidebarMenuSub id={`nav-${group.id}`} className="mb-3">{group.items.map(item => <SidebarMenuSubItem key={item.url}><SidebarMenuSubButton asChild className="min-h-10"><NavLink to={item.url} onClick={follow} className="rounded-lg px-3 py-2 text-sm" activeClassName="bg-accent/10 font-medium text-foreground">{item.title}</NavLink></SidebarMenuSubButton></SidebarMenuSubItem>)}</SidebarMenuSub>}
        </SidebarMenuItem>;
      })}
    </SidebarMenu></nav></SidebarGroupContent></SidebarGroup>
      {!collapsed && <div className="mx-4 mt-auto rounded-xl border border-accent/20 bg-accent/5 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Um próximo passo</p><Link to="/membros/pratica-reels" onClick={follow} className="mt-2 block text-sm font-medium underline decoration-accent underline-offset-4">Monte seu roteiro de Reel →</Link></div>}
    </SidebarContent>
    <SidebarFooter className="border-t border-border/50 p-4"><button type="button" onClick={() => void handleLogout()} aria-label="Sair da conta" className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-muted-foreground hover:bg-secondary/50 hover:text-foreground"><LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />{!collapsed && <span>Sair</span>}</button><button type="button" onClick={() => { follow(); navigate('/'); }} aria-label="Voltar ao site" className="mt-2 flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-muted-foreground hover:bg-secondary/50 hover:text-foreground"><ChevronLeft className="h-5 w-5 shrink-0" aria-hidden="true" />{!collapsed && <span>Voltar ao site</span>}</button></SidebarFooter>
  </Sidebar>;
};
