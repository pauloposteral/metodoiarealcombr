import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Loader2,
  Building2,
  UserCog,
  MoreHorizontal,
  Shield,
  User as UserIcon
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CompanyUser {
  id: string;
  user_id: string;
  role: 'admin' | 'user';
  joined_at: string;
  company: {
    id: string;
    name: string;
  };
  profile?: {
    full_name: string | null;
  };
}

export default function AdminUsuarios() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session) navigate('/admin/login');
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate('/admin/login');
        return;
      }
      setTimeout(() => verifyAndLoad(session.user.id), 0);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const verifyAndLoad = async (userId: string) => {
    try {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roleData) {
        navigate('/admin/login');
        return;
      }

      await loadUsers();
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('company_users')
      .select(`
        id,
        user_id,
        role,
        joined_at,
        companies (
          id,
          name
        )
      `)
      .order('joined_at', { ascending: false });

    if (!error && data) {
      // Fetch profiles for each user
      const usersWithProfiles = await Promise.all(
        data.map(async (u: any) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', u.user_id)
            .maybeSingle();
          
          return {
            ...u,
            company: u.companies,
            profile,
          };
        })
      );
      setUsers(usersWithProfiles);
    }
  };

  const updateUserRole = async (userId: string, companyId: string, newRole: 'admin' | 'user') => {
    const { error } = await supabase
      .from('company_users')
      .update({ role: newRole })
      .eq('user_id', userId)
      .eq('company_id', companyId);

    if (error) {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' });
    } else {
      toast({ title: 'Papel atualizado!' });
      await loadUsers();
    }
  };

  const removeUser = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este usuário da empresa?')) return;

    const { error } = await supabase
      .from('company_users')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Erro ao remover', variant: 'destructive' });
    } else {
      toast({ title: 'Usuário removido!' });
      await loadUsers();
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      (u.profile?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.company?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader user={user} />
          <main className="flex-1 p-6 lg:p-8 overflow-auto">
            <div className="max-w-7xl mx-auto space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Usuários</h1>
                <p className="text-muted-foreground">Gerencie os usuários das empresas</p>
              </div>

              <Card>
                <CardHeader>
                  <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar usuário..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Empresa</TableHead>
                        <TableHead>Papel</TableHead>
                        <TableHead>Entrou em</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <UserIcon className="w-4 h-4 text-primary" />
                              </div>
                              <span className="font-medium">
                                {u.profile?.full_name || 'Sem nome'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-muted-foreground" />
                              <span>{u.company?.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              u.role === 'admin' 
                                ? 'bg-purple-500/10 text-purple-500' 
                                : 'bg-slate-500/10 text-slate-500'
                            }>
                              {u.role === 'admin' ? (
                                <><Shield className="w-3 h-3 mr-1" /> Admin</>
                              ) : (
                                <><UserCog className="w-3 h-3 mr-1" /> Usuário</>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {u.joined_at && format(new Date(u.joined_at), "dd/MM/yyyy", { locale: ptBR })}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => updateUserRole(
                                    u.user_id, 
                                    u.company?.id, 
                                    u.role === 'admin' ? 'user' : 'admin'
                                  )}
                                >
                                  <UserCog className="w-4 h-4 mr-2" />
                                  {u.role === 'admin' ? 'Tornar Usuário' : 'Tornar Admin'}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => removeUser(u.id)}
                                  className="text-red-500"
                                >
                                  Remover da Empresa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
