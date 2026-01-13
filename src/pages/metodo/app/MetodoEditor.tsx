import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  PenTool, 
  Instagram, 
  Mail, 
  FileText,
  Sparkles,
  Copy,
  Check,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollReveal } from '@/components/ScrollReveal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

const contentTypes = [
  { id: 'post', label: 'Post Instagram', icon: Instagram, description: 'Legenda para feed' },
  { id: 'carousel', label: 'Carrossel', icon: PenTool, description: 'Roteiro de carrossel' },
  { id: 'email', label: 'Email', icon: Mail, description: 'Email marketing' },
  { id: 'text', label: 'Texto livre', icon: FileText, description: 'Qualquer tipo de texto' }
];

export default function MetodoEditor() {
  const { companyData } = useOutletContext<ContextType>();
  const [selectedType, setSelectedType] = useState('post');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    topic: '',
    tone: 'profissional',
    audience: '',
    objective: '',
    additionalInfo: ''
  });
  const [generatedContent, setGeneratedContent] = useState('');

  const toneOptions = [
    { value: 'profissional', label: 'Profissional' },
    { value: 'casual', label: 'Casual e amigável' },
    { value: 'persuasivo', label: 'Persuasivo' },
    { value: 'educativo', label: 'Educativo' },
    { value: 'inspirador', label: 'Inspirador' }
  ];

  const getSystemPrompt = () => {
    const prompts: Record<string, string> = {
      post: `Você é um especialista em conteúdo para Instagram. Crie uma legenda envolvente para o feed com:
- Hook forte na primeira linha
- Conteúdo relevante e útil
- Call-to-action claro
- Hashtags relevantes (máximo 10)
- Emojis moderados`,
      carousel: `Você é um especialista em carrosséis do Instagram. Crie um roteiro com 7 slides:
- Slide 1: Gancho forte e título chamativo
- Slides 2-6: Conteúdo educativo, um ponto por slide
- Slide 7: CTA e chamada para salvar/compartilhar
Formate cada slide claramente.`,
      email: `Você é um especialista em email marketing. Crie um email com:
- Assunto (máximo 60 caracteres)
- Preview text (máximo 90 caracteres)  
- Corpo do email persuasivo
- Call-to-action claro
- PS opcional`,
      text: `Você é um redator profissional. Crie o texto solicitado de forma clara, persuasiva e adequada ao público-alvo.`
    };
    return prompts[selectedType] || prompts.text;
  };

  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      toast.error('Digite o tema do conteúdo');
      return;
    }

    setLoading(true);
    setGeneratedContent('');

    try {
      const userPrompt = `
Tema: ${formData.topic}
Tom de voz: ${formData.tone}
${formData.audience ? `Público-alvo: ${formData.audience}` : ''}
${formData.objective ? `Objetivo: ${formData.objective}` : ''}
${formData.additionalInfo ? `Informações adicionais: ${formData.additionalInfo}` : ''}
Empresa: ${companyData.company.name}
      `.trim();

      const response = await supabase.functions.invoke('generate-carousel', {
        body: {
          messages: [
            { role: 'system', content: getSystemPrompt() },
            { role: 'user', content: userPrompt }
          ]
        }
      });

      if (response.error) throw response.error;

      // Handle streaming or regular response
      if (response.data?.content) {
        setGeneratedContent(response.data.content);
      } else if (typeof response.data === 'string') {
        setGeneratedContent(response.data);
      } else {
        throw new Error('Formato de resposta inválido');
      }

      toast.success('Conteúdo gerado!');
    } catch (error: any) {
      console.error('Error generating content:', error);
      if (error.message?.includes('429')) {
        toast.error('Limite de requisições atingido. Tente novamente em alguns segundos.');
      } else {
        toast.error('Erro ao gerar conteúdo. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    toast.success('Conteúdo copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <ScrollReveal>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Editor de Conteúdo
          </h1>
          <p className="text-muted-foreground">
            Gere conteúdo pronto para usar com ajuda de IA.
          </p>
        </div>
      </ScrollReveal>

      {/* Content Type Selection */}
      <ScrollReveal delay={100}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {contentTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedType === type.id
                  ? 'border-accent bg-accent/5'
                  : 'border-border hover:border-accent/50'
              }`}
            >
              <type.icon className={`w-5 h-5 mb-2 ${
                selectedType === type.id ? 'text-accent' : 'text-muted-foreground'
              }`} />
              <p className="font-medium text-sm text-foreground">{type.label}</p>
              <p className="text-xs text-muted-foreground">{type.description}</p>
            </button>
          ))}
        </div>
      </ScrollReveal>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <ScrollReveal delay={150}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configurar conteúdo</CardTitle>
              <CardDescription>Preencha as informações para gerar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="topic">Tema ou assunto *</Label>
                <Textarea
                  id="topic"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="Ex: 5 dicas de produtividade para empreendedores"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="tone">Tom de voz</Label>
                <Select 
                  value={formData.tone} 
                  onValueChange={(value) => setFormData({ ...formData, tone: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {toneOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="audience">Público-alvo</Label>
                <Input
                  id="audience"
                  value={formData.audience}
                  onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                  placeholder="Ex: Pequenos empresários, 30-45 anos"
                />
              </div>

              <div>
                <Label htmlFor="objective">Objetivo</Label>
                <Input
                  id="objective"
                  value={formData.objective}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                  placeholder="Ex: Gerar engajamento, vender produto"
                />
              </div>

              <div>
                <Label htmlFor="additionalInfo">Informações adicionais</Label>
                <Textarea
                  id="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                  placeholder="Qualquer contexto extra que ajude a gerar melhor..."
                  rows={2}
                />
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={loading || !formData.topic.trim()}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Gerar conteúdo
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Result */}
        <ScrollReveal delay={200}>
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Resultado</CardTitle>
                  <CardDescription>Conteúdo gerado pela IA</CardDescription>
                </div>
                {generatedContent && (
                  <Button size="sm" variant="outline" onClick={handleCopy}>
                    {copied ? (
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
                )}
              </div>
            </CardHeader>
            <CardContent>
              {generatedContent ? (
                <div className="bg-muted rounded-lg p-4 min-h-[300px]">
                  <pre className="text-sm whitespace-pre-wrap font-sans text-foreground">
                    {generatedContent}
                  </pre>
                </div>
              ) : (
                <div className="bg-muted/50 rounded-lg p-8 min-h-[300px] flex items-center justify-center text-center">
                  <div>
                    <Sparkles className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      Preencha as informações e clique em "Gerar conteúdo"
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </div>
  );
}
