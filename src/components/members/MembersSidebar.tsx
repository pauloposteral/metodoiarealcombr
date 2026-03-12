import { useNavigate, useLocation } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { 
  Home, 
  BookOpen, 
  FileText, 
  Gift, 
  Bell, 
  HelpCircle,
  LogOut,
  ChevronLeft,
  Award,
  LayoutGrid,
  Users,
  Trophy,
  GraduationCap
} from 'lucide-react';
import logo from '@/assets/logo-iareal.png';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const menuItems = [
  { title: 'Início', url: '/membros', icon: Home },
  { title: 'Cursos', url: '/membros/cursos', icon: GraduationCap },
  { title: 'Módulos', url: '/membros/modulos', icon: BookOpen },
  { title: 'Comunidade', url: '/membros/comunidade', icon: Users },
  { title: 'Ranking', url: '/membros/ranking', icon: Trophy },
  { title: 'Materiais', url: '/membros/materiais', icon: FileText },
  { title: 'Carrosséis', url: '/carrossel', icon: LayoutGrid },
  { title: 'Bônus', url: '/membros/bonus', icon: Gift },
  { title: 'Certificado', url: '/membros/certificado', icon: Award },
  { title: 'Atualizações', url: '/membros/atualizacoes', icon: Bell },
  { title: 'Suporte', url: '/membros/suporte', icon: HelpCircle },
];

export const MembersSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Até logo!",
      description: "Você foi desconectado com sucesso.",
    });
    navigate('/');
  };

  return (
    <Sidebar 
      className="border-r border-border/50"
      collapsible="icon"
    >
      <SidebarHeader className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <img 
            src={logo} 
            alt="Método IA Real" 
            className={`transition-all duration-300 ${collapsed ? 'h-8' : 'h-10'}`}
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === '/membros'}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/50 transition-colors"
                      activeClassName="bg-accent/10 text-accent font-medium"
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-left text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-left text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors mt-2"
        >
          <ChevronLeft className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Voltar ao site</span>}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
};
