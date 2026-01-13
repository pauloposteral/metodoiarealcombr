import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CarouselWorkspace } from '@/components/carousel-v2/CarouselWorkspace';
import { TEMPLATE_PRESETS, CAROUSEL_THEMES } from '@/components/carousel-v2/types';
import { supabase } from '@/integrations/supabase/client';
import {
  Sparkles, Wand2, Zap, Download, Image, Layers,
  ChevronRight, Play, Users, Star, ArrowRight,
  Rocket, CheckCircle, Clock, Shield, Heart
} from 'lucide-react';

// ==========================================
// CARROSSEL PAGE - Complete Landing + Editor
// ==========================================

export default function CarrosselPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState('editor');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const features = [
    {
      icon: Wand2,
      title: 'IA Avançada',
      description: 'Motor de geração com IdeaRank, HookLab e QualityScore',
    },
    {
      icon: Image,
      title: 'Imagens por Slide',
      description: 'Cada slide com imagem gerada automaticamente por IA',
    },
    {
      icon: Layers,
      title: '10+ Templates',
      description: 'Biblioteca de estilos premium para todo objetivo',
    },
    {
      icon: Zap,
      title: '60 Segundos',
      description: 'Do tema ao carrossel pronto em menos de 1 minuto',
    },
    {
      icon: Download,
      title: 'Export Perfeito',
      description: 'PNG 1080x1350 + legenda + hashtags + primeiro comentário',
    },
    {
      icon: Shield,
      title: 'QA Automático',
      description: 'Verificação de qualidade antes de postar',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Carrosséis criados' },
    { value: '95%', label: 'Score médio de qualidade' },
    { value: '< 60s', label: 'Tempo de geração' },
    { value: '4.9★', label: 'Avaliação' },
  ];

  // ==========================================
  // If not authenticated, show landing
  // ==========================================
  if (isAuthenticated === false) {
    return (
      <>
        <Helmet>
          <title>Criador de Carrosséis para Instagram | IA Real</title>
          <meta name="description" content="Crie carrosséis virais para Instagram em 60 segundos com IA. Textos, design e imagens geradas automaticamente." />
        </Helmet>

        <div className="min-h-screen bg-background">
          {/* Hero Section */}
          <section className="relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent" />
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl opacity-30" />

            <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-4xl mx-auto"
              >
                <Badge className="mb-6 bg-accent/20 text-accent border-accent/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Motor de IA vNext
                </Badge>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                  Crie carrosséis
                  <span className="text-accent"> virais</span>
                  <br />em 60 segundos
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  O melhor criador de carrosséis para Instagram. 
                  Textos, design e imagens geradas por IA avançada. 
                  Pronto para postar.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    size="lg"
                    onClick={() => navigate('/auth')}
                    className="gap-2 px-8 bg-accent hover:bg-accent/90 text-lg"
                  >
                    <Wand2 className="w-5 h-5" />
                    Criar Meu Carrossel
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setActiveTab('demo')}
                    className="gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Ver Demonstração
                  </Button>
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-3xl mx-auto"
              >
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <p className="text-3xl md:text-4xl font-bold text-accent">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20 bg-muted/30">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  O motor de IA mais avançado
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Tecnologia de classe mundial para criar carrosséis que realmente engajam
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-6 h-full hover:border-accent/50 transition-colors">
                      <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4">
                        <feature.icon className="w-6 h-6 text-accent" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm">{feature.description}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Templates Section */}
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Templates para todo objetivo
                </h2>
                <p className="text-muted-foreground">
                  Estruturas testadas e aprovadas para máximo engajamento
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {TEMPLATE_PRESETS.map((template, index) => {
                  const templateTheme = CAROUSEL_THEMES.find(t => t.id === template.themeId);
                  
                  return (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden hover:border-accent/50 transition-colors">
                        <div 
                          className="h-32"
                          style={{ background: templateTheme?.backgroundGradient || 'linear-gradient(135deg, #1a1a2e, #16213e)' }}
                        >
                          <div className="w-full h-full flex items-center justify-center">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ background: templateTheme?.accentColor }}
                            />
                          </div>
                        </div>
                        <div className="p-5">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {template.category}
                            </Badge>
                          </div>
                          <h3 className="font-semibold mb-1">{template.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {template.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {template.features.map((f, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {f}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 bg-accent/5">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Pronto para criar seu primeiro carrossel viral?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Junte-se a milhares de criadores que estão economizando horas 
                e aumentando seu engajamento com carrosséis gerados por IA.
              </p>
              <Button
                size="lg"
                onClick={() => navigate('/auth')}
                className="gap-2 px-8 bg-accent hover:bg-accent/90 text-lg"
              >
                <Rocket className="w-5 h-5" />
                Começar Grátis
              </Button>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-20">
            <div className="max-w-3xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12">
                Perguntas Frequentes
              </h2>
              <div className="space-y-6">
                {[
                  {
                    q: 'Quanto tempo leva para criar um carrossel?',
                    a: 'Menos de 60 segundos! Nossa IA gera todo o conteúdo, design e imagens automaticamente.',
                  },
                  {
                    q: 'Posso editar o carrossel depois de gerado?',
                    a: 'Sim! Você tem controle total sobre textos, imagens, cores e layout. Edite o que quiser.',
                  },
                  {
                    q: 'As imagens são únicas?',
                    a: 'Sim, cada imagem é gerada por IA especificamente para o seu slide, com base no conteúdo.',
                  },
                  {
                    q: 'Qual o formato de exportação?',
                    a: 'PNG em 1080x1350 (formato ideal para Instagram), com opção de download individual ou ZIP.',
                  },
                ].map((faq, index) => (
                  <Card key={index} className="p-6">
                    <h3 className="font-semibold mb-2">{faq.q}</h3>
                    <p className="text-muted-foreground text-sm">{faq.a}</p>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        </div>
      </>
    );
  }

  // ==========================================
  // If loading auth state
  // ==========================================
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-accent">Carregando...</div>
      </div>
    );
  }

  // ==========================================
  // Authenticated: Show Editor
  // ==========================================
  return (
    <>
      <Helmet>
        <title>Editor de Carrosséis | IA Real</title>
        <meta name="description" content="Crie carrosséis virais para Instagram com IA avançada." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h1 className="font-bold">Carousel Engine</h1>
                <p className="text-xs text-muted-foreground">vNext</p>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="history">Histórico</TabsTrigger>
              </TabsList>
            </Tabs>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/membros')}
            >
              Voltar
            </Button>
          </div>
        </header>

        {/* Content */}
        <main>
          {activeTab === 'editor' && (
            <CarouselWorkspace />
          )}

          {activeTab === 'templates' && (
            <div className="max-w-7xl mx-auto px-4 py-8">
              <h2 className="text-2xl font-bold mb-6">Biblioteca de Templates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {TEMPLATE_PRESETS.map((template) => {
                  const templateTheme = CAROUSEL_THEMES.find(t => t.id === template.themeId);
                  
                  return (
                    <Card 
                      key={template.id} 
                      className="overflow-hidden hover:border-accent/50 transition-colors cursor-pointer"
                      onClick={() => setActiveTab('editor')}
                    >
                      <div 
                        className="h-32"
                        style={{ background: templateTheme?.backgroundGradient }}
                      />
                      <div className="p-5">
                        <Badge variant="outline" className="mb-2">{template.category}</Badge>
                        <h3 className="font-semibold mb-1">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="max-w-7xl mx-auto px-4 py-8">
              <h2 className="text-2xl font-bold mb-6">Histórico de Carrosséis</h2>
              <Card className="p-12 text-center">
                <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">Em breve</h3>
                <p className="text-muted-foreground">
                  Histórico de carrosséis criados será disponibilizado em breve
                </p>
              </Card>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
