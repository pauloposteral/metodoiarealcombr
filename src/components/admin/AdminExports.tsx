import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { exportToCSV } from '@/lib/exportCSV';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download, Loader2, FileSpreadsheet, Users, Building2, ShoppingCart, BookOpen, GraduationCap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ExportOption {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}

const exportOptions: ExportOption[] = [
  { id: 'leads', label: 'Leads', description: 'Todas as solicitações de acesso', icon: Users, color: 'text-orange-500' },
  { id: 'companies', label: 'Empresas', description: 'Empresas cadastradas', icon: Building2, color: 'text-blue-500' },
  { id: 'purchases', label: 'Vendas', description: 'Histórico de compras', icon: ShoppingCart, color: 'text-purple-500' },
  { id: 'progress', label: 'Progresso dos Alunos', description: 'Aulas concluídas por aluno', icon: BookOpen, color: 'text-emerald-500' },
  { id: 'certificates', label: 'Certificados', description: 'Certificados emitidos', icon: GraduationCap, color: 'text-accent' },
];

export const AdminExports = () => {
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = async (type: string) => {
    setExporting(type);
    try {
      switch (type) {
        case 'leads': {
          const { data } = await supabase.from('company_leads').select('*').order('created_at', { ascending: false });
          if (data) exportToCSV(data, 'leads', [
            { key: 'company_name', label: 'Empresa' },
            { key: 'contact_name', label: 'Contato' },
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'Telefone' },
            { key: 'employees_count', label: 'Funcionários' },
            { key: 'industry', label: 'Setor' },
            { key: 'status', label: 'Status' },
            { key: 'created_at', label: 'Data' },
          ]);
          break;
        }
        case 'companies': {
          const { data } = await supabase.from('companies').select('*').order('created_at', { ascending: false });
          if (data) exportToCSV(data, 'empresas', [
            { key: 'name', label: 'Nome' },
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'Telefone' },
            { key: 'plan', label: 'Plano' },
            { key: 'status', label: 'Status' },
            { key: 'max_users', label: 'Max Usuários' },
            { key: 'created_at', label: 'Data Criação' },
          ]);
          break;
        }
        case 'purchases': {
          const { data } = await supabase.from('purchases').select('*').order('created_at', { ascending: false });
          if (data) exportToCSV(data, 'vendas', [
            { key: 'client_name', label: 'Cliente' },
            { key: 'client_email', label: 'Email' },
            { key: 'product_name', label: 'Produto' },
            { key: 'amount', label: 'Valor' },
            { key: 'status', label: 'Status' },
            { key: 'payment_method', label: 'Método' },
            { key: 'created_at', label: 'Data' },
          ]);
          break;
        }
        case 'progress': {
          const { data } = await supabase
            .from('lesson_progress')
            .select('user_id, lesson_id, completed, completed_at, time_spent_seconds, lessons(title, modules(title))')
            .eq('completed', true)
            .order('completed_at', { ascending: false });
          if (data) {
            const rows = data.map((p: any) => ({
              user_id: p.user_id,
              lesson: p.lessons?.title || '',
              module: p.lessons?.modules?.title || '',
              completed_at: p.completed_at,
              time_minutes: Math.round((p.time_spent_seconds || 0) / 60),
            }));
            exportToCSV(rows, 'progresso-alunos', [
              { key: 'user_id', label: 'ID Aluno' },
              { key: 'module', label: 'Módulo' },
              { key: 'lesson', label: 'Aula' },
              { key: 'completed_at', label: 'Data Conclusão' },
              { key: 'time_minutes', label: 'Tempo (min)' },
            ]);
          }
          break;
        }
        case 'certificates': {
          const { data } = await supabase.from('certificates').select('*').order('completed_at', { ascending: false });
          if (data) exportToCSV(data, 'certificados', [
            { key: 'student_name', label: 'Aluno' },
            { key: 'course_name', label: 'Curso' },
            { key: 'certificate_code', label: 'Código' },
            { key: 'total_hours', label: 'Horas' },
            { key: 'completed_at', label: 'Data Conclusão' },
          ]);
          break;
        }
      }
      toast({ title: 'Exportação concluída!', description: 'O arquivo CSV foi baixado.' });
    } catch (error) {
      console.error('Export error:', error);
      toast({ title: 'Erro na exportação', variant: 'destructive' });
    } finally {
      setExporting(null);
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-accent" />
          Exportar Dados
        </CardTitle>
        <CardDescription>Baixe relatórios em CSV para análise</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {exportOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => handleExport(opt.id)}
              disabled={exporting === opt.id}
              className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors text-left disabled:opacity-50"
            >
              {exporting === opt.id ? (
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              ) : (
                <opt.icon className={`w-5 h-5 ${opt.color}`} />
              )}
              <div>
                <p className="font-medium text-foreground text-sm">{opt.label}</p>
                <p className="text-xs text-muted-foreground">{opt.description}</p>
              </div>
              <Download className="w-4 h-4 text-muted-foreground ml-auto" />
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
