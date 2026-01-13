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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Eye, 
  Check,
  X,
  Loader2,
  Building2,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Lead {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  industry: string | null;
  employees_count: string | null;
  message: string | null;
  status: string | null;
  created_at: string;
}

export default function AdminLeads() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [newCompanyData, setNewCompanyData] = useState({
    plan: 'starter' as 'starter' | 'pro' | 'business',
    max_users: 5,
  });

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

      await loadLeads();
    } finally {
      setLoading(false);
    }
  };

  const loadLeads = async () => {
    const { data, error } = await supabase
      .from('company_leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setLeads(data);
    }
  };

  const updateLeadStatus = async (leadId: string, status: string) => {
    const { error } = await supabase
      .from('company_leads')
      .update({ status })
      .eq('id', leadId);

    if (error) {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' });
    } else {
      toast({ title: 'Status atualizado!' });
      await loadLeads();
    }
  };

  const handleApprove = async () => {
    if (!selectedLead) return;

    try {
      // Create slug from company name
      const slug = selectedLead.company_name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Create company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert([{
          name: selectedLead.company_name,
          email: selectedLead.email,
          phone: selectedLead.phone,
          slug: slug,
          plan: newCompanyData.plan,
          status: 'active',
          max_users: newCompanyData.max_users,
        }])
        .select()
        .single();

      if (companyError) throw companyError;

      // Update lead status
      await supabase
        .from('company_leads')
        .update({ 
          status: 'aprovado',
          converted_company_id: company.id
        })
        .eq('id', selectedLead.id);

      toast({ 
        title: 'Lead aprovado!', 
        description: `Empresa ${selectedLead.company_name} criada com sucesso.` 
      });

      setApproveOpen(false);
      setSelectedLead(null);
      await loadLeads();
    } catch (error: any) {
      toast({
        title: 'Erro ao aprovar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const filteredLeads = leads.filter(
    (l) =>
      l.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.contact_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string | null) => {
    const colors: Record<string, string> = {
      novo: 'bg-yellow-500/10 text-yellow-500',
      em_analise: 'bg-blue-500/10 text-blue-500',
      aprovado: 'bg-green-500/10 text-green-500',
      rejeitado: 'bg-red-500/10 text-red-500',
    };
    return colors[status || 'novo'] || colors.novo;
  };

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
                <h1 className="text-3xl font-bold text-foreground">Leads</h1>
                <p className="text-muted-foreground">Gerencie as solicitações de acesso</p>
              </div>

              <Card>
                <CardHeader>
                  <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar lead..."
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
                        <TableHead>Empresa</TableHead>
                        <TableHead>Contato</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeads.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{lead.company_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>{lead.contact_name}</p>
                              <p className="text-sm text-muted-foreground">{lead.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadge(lead.status)}>
                              {lead.status || 'novo'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(lead.created_at), "dd/MM/yyyy", { locale: ptBR })}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedLead(lead);
                                  setDetailsOpen(true);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {lead.status !== 'aprovado' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-green-500 hover:text-green-600"
                                    onClick={() => {
                                      setSelectedLead(lead);
                                      setApproveOpen(true);
                                    }}
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-600"
                                    onClick={() => updateLeadStatus(lead.id, 'rejeitado')}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
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

        {/* Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalhes do Lead</DialogTitle>
            </DialogHeader>
            {selectedLead && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Empresa</Label>
                    <p className="font-medium">{selectedLead.company_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Contato</Label>
                    <p className="font-medium">{selectedLead.contact_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedLead.email}</span>
                  </div>
                  {selectedLead.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedLead.phone}</span>
                    </div>
                  )}
                  {selectedLead.industry && (
                    <div>
                      <Label className="text-muted-foreground">Setor</Label>
                      <p>{selectedLead.industry}</p>
                    </div>
                  )}
                  {selectedLead.employees_count && (
                    <div>
                      <Label className="text-muted-foreground">Funcionários</Label>
                      <p>{selectedLead.employees_count}</p>
                    </div>
                  )}
                </div>
                {selectedLead.message && (
                  <div>
                    <Label className="text-muted-foreground">Mensagem</Label>
                    <p className="mt-1 p-3 bg-muted rounded-lg">{selectedLead.message}</p>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Recebido em {format(new Date(selectedLead.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Approve Dialog */}
        <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Aprovar Lead</DialogTitle>
              <DialogDescription>
                Configure o plano para a empresa {selectedLead?.company_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Plano</Label>
                <Select
                  value={newCompanyData.plan}
                  onValueChange={(value: 'starter' | 'pro' | 'business') => 
                    setNewCompanyData({ ...newCompanyData, plan: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter (5 usuários)</SelectItem>
                    <SelectItem value="pro">Pro (15 usuários)</SelectItem>
                    <SelectItem value="business">Business (ilimitado)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Máximo de Usuários</Label>
                <Input
                  type="number"
                  value={newCompanyData.max_users}
                  onChange={(e) => setNewCompanyData({ ...newCompanyData, max_users: parseInt(e.target.value) })}
                  min={1}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setApproveOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleApprove} className="bg-green-500 hover:bg-green-600">
                Aprovar e Criar Empresa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarProvider>
  );
}
