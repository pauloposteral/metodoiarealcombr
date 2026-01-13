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
import { Textarea } from '@/components/ui/textarea';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Plus,
  Edit,
  Trash2,
  Loader2,
  FileText,
  MoreHorizontal,
  Star
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type PromptCategory = 'marketing' | 'conteudo' | 'atendimento' | 'gestao' | 'vendas';

interface Prompt {
  id: string;
  title: string;
  description: string | null;
  content: string;
  category: PromptCategory;
  subcategory: string | null;
  is_premium: boolean | null;
  usage_count: number | null;
}

export default function AdminPrompts() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: 'marketing' as PromptCategory,
    subcategory: '',
    is_premium: false,
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

      await loadPrompts();
    } finally {
      setLoading(false);
    }
  };

  const loadPrompts = async () => {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .order('category')
      .order('order_index');

    if (!error && data) {
      setPrompts(data);
    }
  };

  const handleSave = async () => {
    try {
      if (editingPrompt) {
        const { error } = await supabase
          .from('prompts')
          .update({
            title: formData.title,
            description: formData.description,
            content: formData.content,
            category: formData.category,
            subcategory: formData.subcategory || null,
            is_premium: formData.is_premium,
          })
          .eq('id', editingPrompt.id);

        if (error) throw error;
        toast({ title: 'Prompt atualizado!' });
      } else {
        const { error } = await supabase
          .from('prompts')
          .insert([{
            title: formData.title,
            description: formData.description,
            content: formData.content,
            category: formData.category,
            subcategory: formData.subcategory || null,
            is_premium: formData.is_premium,
          }]);

        if (error) throw error;
        toast({ title: 'Prompt criado!' });
      }

      setDialogOpen(false);
      setEditingPrompt(null);
      resetForm();
      await loadPrompts();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setFormData({
      title: prompt.title,
      description: prompt.description || '',
      content: prompt.content,
      category: prompt.category,
      subcategory: prompt.subcategory || '',
      is_premium: prompt.is_premium || false,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este prompt?')) return;

    const { error } = await supabase.from('prompts').delete().eq('id', id);

    if (error) {
      toast({ title: 'Erro ao excluir', variant: 'destructive' });
    } else {
      toast({ title: 'Prompt excluído!' });
      await loadPrompts();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      category: 'marketing',
      subcategory: '',
      is_premium: false,
    });
  };

  const filteredPrompts = prompts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      marketing: 'bg-pink-500/10 text-pink-500',
      conteudo: 'bg-blue-500/10 text-blue-500',
      atendimento: 'bg-green-500/10 text-green-500',
      gestao: 'bg-purple-500/10 text-purple-500',
      vendas: 'bg-orange-500/10 text-orange-500',
    };
    return colors[category] || colors.marketing;
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
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Prompts</h1>
                  <p className="text-muted-foreground">Gerencie a biblioteca de prompts</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (!open) {
                    setEditingPrompt(null);
                    resetForm();
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      Novo Prompt
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingPrompt ? 'Editar Prompt' : 'Novo Prompt'}
                      </DialogTitle>
                      <DialogDescription>
                        Preencha os dados do prompt
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Título</Label>
                        <Input
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Nome do prompt"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Descrição</Label>
                        <Input
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Breve descrição"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Categoria</Label>
                          <Select
                            value={formData.category}
                            onValueChange={(value: PromptCategory) => 
                              setFormData({ ...formData, category: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="marketing">Marketing</SelectItem>
                              <SelectItem value="conteudo">Conteúdo</SelectItem>
                              <SelectItem value="atendimento">Atendimento</SelectItem>
                              <SelectItem value="gestao">Gestão</SelectItem>
                              <SelectItem value="vendas">Vendas</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Subcategoria</Label>
                          <Input
                            value={formData.subcategory}
                            onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                            placeholder="Ex: Redes Sociais"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Conteúdo do Prompt</Label>
                        <Textarea
                          value={formData.content}
                          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                          placeholder="Digite o prompt completo..."
                          rows={8}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={formData.is_premium}
                          onCheckedChange={(checked) => setFormData({ ...formData, is_premium: checked })}
                        />
                        <Label>Prompt Premium (apenas planos pagos)</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleSave}>
                        {editingPrompt ? 'Salvar' : 'Criar'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardHeader>
                  <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar prompt..."
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
                        <TableHead>Prompt</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Uso</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPrompts.map((prompt) => (
                        <TableRow key={prompt.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{prompt.title}</p>
                                {prompt.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-1">
                                    {prompt.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getCategoryColor(prompt.category)}>
                              {prompt.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {prompt.is_premium ? (
                              <Badge className="bg-yellow-500/10 text-yellow-500">
                                <Star className="w-3 h-3 mr-1" />
                                Premium
                              </Badge>
                            ) : (
                              <Badge variant="outline">Gratuito</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {prompt.usage_count || 0}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(prompt)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(prompt.id)}
                                  className="text-red-500"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Excluir
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
