import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  Copy, 
  Check, 
  Star, 
  Lock,
  Megaphone,
  FileText,
  Headphones,
  Settings,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollReveal } from '@/components/ScrollReveal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Variable {
  name: string;
  label: string;
  default?: string;
}

interface Prompt {
  id: string;
  title: string;
  description: string | null;
  content: string;
  category: string;
  subcategory: string | null;
  variables: Variable[];
  is_premium: boolean;
  usage_count: number;
}

interface ContextType {
  user: any;
  companyData: {
    role: string;
    company: {
      id: string;
      name: string;
      plan: string;
    };
  };
}

const categoryIcons: Record<string, any> = {
  marketing: Megaphone,
  conteudo: FileText,
  atendimento: Headphones,
  gestao: Settings,
  vendas: TrendingUp
};

const categoryLabels: Record<string, string> = {
  marketing: 'Marketing',
  conteudo: 'Conteúdo',
  atendimento: 'Atendimento',
  gestao: 'Gestão',
  vendas: 'Vendas'
};

export default function MetodoPrompts() {
  const { companyData } = useOutletContext<ContextType>();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isPremiumPlan = companyData.company.plan === 'pro' || companyData.company.plan === 'business';

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .order('category')
        .order('order_index');

      if (error) throw error;

      // Parse variables JSON with proper typing
      const parsedPrompts: Prompt[] = (data || []).map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        content: p.content,
        category: p.category,
        subcategory: p.subcategory,
        is_premium: p.is_premium ?? false,
        usage_count: p.usage_count ?? 0,
        variables: Array.isArray(p.variables) ? (p.variables as unknown as Variable[]) : []
      }));

      setPrompts(parsedPrompts);
    } catch (error) {
      console.error('Error fetching prompts:', error);
      toast.error('Erro ao carregar prompts');
    } finally {
      setLoading(false);
    }
  };

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = 
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || prompt.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openPromptDialog = (prompt: Prompt) => {
    if (prompt.is_premium && !isPremiumPlan) {
      toast.error('Este prompt é exclusivo para planos Pro e Business');
      return;
    }
    setSelectedPrompt(prompt);
    // Initialize variable values with defaults
    const initialValues: Record<string, string> = {};
    prompt.variables.forEach(v => {
      initialValues[v.name] = v.default || '';
    });
    setVariableValues(initialValues);
  };

  const getFilledContent = () => {
    if (!selectedPrompt) return '';
    let content = selectedPrompt.content;
    Object.entries(variableValues).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value || `[${key}]`);
    });
    return content;
  };

  const copyPrompt = async (content: string, promptId: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(promptId);
    toast.success('Prompt copiado!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = ['all', ...Object.keys(categoryLabels)];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <ScrollReveal>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Central de Prompts
          </h1>
          <p className="text-muted-foreground">
            Prompts testados e organizados para usar no dia a dia da sua empresa.
          </p>
        </div>
      </ScrollReveal>

      {/* Search */}
      <ScrollReveal delay={100}>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </ScrollReveal>

      {/* Categories */}
      <ScrollReveal delay={150}>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="flex-wrap h-auto gap-2 bg-transparent p-0">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              Todos
            </TabsTrigger>
            {Object.entries(categoryLabels).map(([key, label]) => {
              const Icon = categoryIcons[key];
              return (
                <TabsTrigger 
                  key={key} 
                  value={key}
                  className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                >
                  <Icon className="w-4 h-4 mr-1.5" />
                  {label}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </ScrollReveal>

      {/* Prompts Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPrompts.map((prompt, index) => {
          const Icon = categoryIcons[prompt.category] || FileText;
          const isLocked = prompt.is_premium && !isPremiumPlan;
          
          return (
            <ScrollReveal key={prompt.id} delay={index * 50}>
              <Card 
                className={cn(
                  "h-full cursor-pointer transition-all",
                  isLocked 
                    ? "opacity-70 hover:opacity-80" 
                    : "hover:border-accent/50 hover:shadow-md"
                )}
                onClick={() => openPromptDialog(prompt)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        "bg-accent/10 text-accent"
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {prompt.is_premium && (
                        <Badge variant="secondary" className="text-xs">
                          {isLocked ? <Lock className="w-3 h-3 mr-1" /> : <Star className="w-3 h-3 mr-1" />}
                          Premium
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-base mt-2">{prompt.title}</CardTitle>
                  <CardDescription className="text-sm line-clamp-2">
                    {prompt.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="capitalize">{categoryLabels[prompt.category]}</span>
                    {prompt.subcategory && (
                      <>
                        <span>•</span>
                        <span className="capitalize">{prompt.subcategory}</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          );
        })}
      </div>

      {filteredPrompts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum prompt encontrado.</p>
        </div>
      )}

      {/* Prompt Dialog */}
      <Dialog open={!!selectedPrompt} onOpenChange={() => setSelectedPrompt(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPrompt?.title}</DialogTitle>
            <DialogDescription>{selectedPrompt?.description}</DialogDescription>
          </DialogHeader>

          {selectedPrompt && (
            <div className="space-y-6">
              {/* Variables */}
              {selectedPrompt.variables.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Personalize</h4>
                  <div className="grid gap-4">
                    {selectedPrompt.variables.map((variable) => (
                      <div key={variable.name}>
                        <Label htmlFor={variable.name}>{variable.label}</Label>
                        <Input
                          id={variable.name}
                          value={variableValues[variable.name] || ''}
                          onChange={(e) => setVariableValues({
                            ...variableValues,
                            [variable.name]: e.target.value
                          })}
                          placeholder={variable.default || `Digite ${variable.label.toLowerCase()}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Generated Content */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">Prompt gerado</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyPrompt(getFilledContent(), selectedPrompt.id)}
                  >
                    {copiedId === selectedPrompt.id ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <pre className="text-sm whitespace-pre-wrap font-sans">
                    {getFilledContent()}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
