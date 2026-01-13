import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import {
  Sparkles,
  LayoutDashboard,
  FileText,
  PenTool,
  BookOpen,
  Users,
  Settings,
  Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetodoSidebarProps {
  companyName: string;
  userRole: string;
  plan: string;
}

const mainMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/metodo/app' },
  { icon: FileText, label: 'Central de Prompts', href: '/metodo/app/prompts' },
  { icon: PenTool, label: 'Editor de Conteúdo', href: '/metodo/app/editor' },
  { icon: BookOpen, label: 'Treinamento', href: '/metodo/app/treinamento' },
];

const adminMenuItems = [
  { icon: Users, label: 'Equipe', href: '/metodo/app/equipe' },
  { icon: Settings, label: 'Configurações', href: '/metodo/app/config' },
];

export function MetodoSidebar({ companyName, userRole, plan }: MetodoSidebarProps) {
  const location = useLocation();
  const isAdmin = userRole === 'admin';

  const getPlanBadge = () => {
    const badges: Record<string, { label: string; className: string }> = {
      starter: { label: 'Starter', className: 'bg-muted text-muted-foreground' },
      pro: { label: 'Pro', className: 'bg-accent/10 text-accent' },
      business: { label: 'Business', className: 'bg-gold/10 text-gold' }
    };
    return badges[plan] || badges.starter;
  };

  const planBadge = getPlanBadge();

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="border-b border-border p-4">
        <Link to="/metodo/app" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-accent to-gold rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-display font-bold text-foreground block truncate">
              Método IA
            </span>
            <span className="text-xs text-muted-foreground truncate block">
              {companyName}
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.href}
                  >
                    <Link to={item.href}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administração</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminMenuItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.href}
                    >
                      <Link to={item.href}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-accent" />
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", planBadge.className)}>
            Plano {planBadge.label}
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
