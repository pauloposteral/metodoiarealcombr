import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  UserPlus, 
  FileText,
  Settings,
  Shield,
  CreditCard,
  BarChart3,
  GraduationCap
} from 'lucide-react';

const mainMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: GraduationCap, label: 'Cursos', href: '/admin/cursos' },
  { icon: Building2, label: 'Empresas', href: '/admin/empresas' },
  { icon: Users, label: 'Usuários', href: '/admin/usuarios' },
  { icon: UserPlus, label: 'Leads', href: '/admin/leads' },
  { icon: FileText, label: 'Prompts', href: '/admin/prompts' },
];

const systemMenuItems = [
  { icon: CreditCard, label: 'Vendas', href: '/admin/vendas' },
  { icon: BarChart3, label: 'Relatórios', href: '/admin/relatorios' },
  { icon: Settings, label: 'Configurações', href: '/admin/configuracoes' },
];

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-foreground text-lg">Admin</h2>
            <p className="text-xs text-muted-foreground">Painel de Controle</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground">
            Gerenciamento
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.href)}
                    isActive={location.pathname === item.href}
                    className="w-full"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground">
            Sistema
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemMenuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.href)}
                    isActive={location.pathname === item.href}
                    className="w-full"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50">
        <div className="flex items-center justify-center">
          <span className="px-3 py-1.5 bg-red-500/10 text-red-500 rounded-full text-xs font-medium">
            Acesso Total
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
