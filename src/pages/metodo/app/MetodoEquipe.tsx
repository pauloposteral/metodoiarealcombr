import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  UserPlus, 
  MoreHorizontal, 
  Mail,
  Shield,
  Crown,
  Trash2,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollReveal } from '@/components/ScrollReveal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  user_email?: string;
  user_name?: string;
}

interface ContextType {
  user: any;
  companyData: {
    role: string;
    company: {
      id: string;
      name: string;
      plan: string;
      max_users?: number;
    };
  };
}

const planLimits: Record<string, number> = {
  starter: 3,
  pro: 10,
  business: 999
};

export default function MetodoEquipe() {
  const { user, companyData } = useOutletContext<ContextType>();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'user' | 'admin'>('user');
  const [inviting, setInviting] = useState(false);

  const maxUsers = planLimits[companyData.company.plan] || 3;
  const canInvite = members.length < maxUsers;
  const isAdmin = companyData.role === 'admin';

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('company_users')
        .select(`
          id,
          user_id,
          role,
          joined_at
        `)
        .eq('company_id', companyData.company.id)
        .order('joined_at');

      if (error) throw error;

      // For now, we'll just use the data we have
      // In a real app, you'd join with profiles table
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching team:', error);
      toast.error('Erro ao carregar equipe');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Digite o email do colaborador');
      return;
    }

    setInviting(true);

    try {
      // In a real implementation, this would:
      // 1. Check if user exists
      // 2. Send invitation email
      // 3. Create pending invite record
      
      toast.info('Funcionalidade de convite será implementada em breve!');
      setInviteDialogOpen(false);
      setInviteEmail('');
    } catch (error) {
      console.error('Error inviting:', error);
      toast.error('Erro ao enviar convite');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Remover este membro da equipe?')) return;

    try {
      const { error } = await supabase
        .from('company_users')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      setMembers(members.filter(m => m.id !== memberId));
      toast.success('Membro removido');
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Erro ao remover membro');
    }
  };

  const handleChangeRole = async (memberId: string, newRole: 'admin' | 'user') => {
    try {
      const { error } = await supabase
        .from('company_users')
        .update({ role: newRole as any })
        .eq('id', memberId);

      if (error) throw error;

      setMembers(members.map(m => 
        m.id === memberId ? { ...m, role: newRole } : m
      ));
      toast.success('Papel atualizado');
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Erro ao atualizar papel');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <ScrollReveal>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              Equipe
            </h1>
            <p className="text-muted-foreground">
              Gerencie os membros da sua empresa.
            </p>
          </div>
          {isAdmin && (
            <Button onClick={() => setInviteDialogOpen(true)} disabled={!canInvite}>
              <UserPlus className="w-4 h-4 mr-2" />
              Convidar
            </Button>
          )}
        </div>
      </ScrollReveal>

      {/* Usage Card */}
      <ScrollReveal delay={100}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {members.length} de {maxUsers} usuários
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Plano {companyData.company.plan}
                  </p>
                </div>
              </div>
              {!canInvite && (
                <Badge variant="secondary">Limite atingido</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>

      {/* Team Members */}
      <ScrollReveal delay={150}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Membros</CardTitle>
            <CardDescription>Pessoas com acesso à plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {members.map((member) => {
                const isCurrentUser = member.user_id === user.id;
                const initials = member.user_email?.charAt(0).toUpperCase() || 'U';
                
                return (
                  <div key={member.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-accent/10 text-accent">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground flex items-center gap-2">
                          {member.user_name || member.user_email || 'Usuário'}
                          {isCurrentUser && (
                            <Badge variant="outline" className="text-xs">Você</Badge>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Desde {new Date(member.joined_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={member.role === 'admin' ? 'default' : 'secondary'}
                        className="flex items-center gap-1"
                      >
                        {member.role === 'admin' ? (
                          <>
                            <Crown className="w-3 h-3" />
                            Admin
                          </>
                        ) : (
                          <>
                            <Shield className="w-3 h-3" />
                            Usuário
                          </>
                        )}
                      </Badge>

                      {isAdmin && !isCurrentUser && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => handleChangeRole(
                                member.id, 
                                member.role === 'admin' ? 'user' : 'admin'
                              )}>
                              {member.role === 'admin' ? 'Tornar usuário' : 'Tornar admin'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remover
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convidar colaborador</DialogTitle>
            <DialogDescription>
              Envie um convite para um novo membro da equipe.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colaborador@empresa.com"
              />
            </div>

            <div>
              <Label htmlFor="invite-role">Papel</Label>
              <Select value={inviteRole} onValueChange={(v: 'user' | 'admin') => setInviteRole(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Admins podem gerenciar a equipe e configurações.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleInvite} disabled={inviting}>
              {inviting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar convite
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
