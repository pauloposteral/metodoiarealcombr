import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { StoriesWorkspace } from '@/components/stories/StoriesWorkspace';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, ArrowRight, Smartphone, Wand2, 
  Image, Zap, Check, Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StoriesPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="w-12 h-12 text-accent" />
        </motion.div>
      </div>
    );
  }

  // Authenticated - Show workspace
  if (isAuthenticated) {
    return (
      <>
        <Helmet>
          <title>Stories Creator com IA | Método IA Real</title>
          <meta name="description" content="Crie stories incríveis para Instagram com inteligência artificial. Imagens profissionais geradas em segundos." />
        </Helmet>
        <StoriesWorkspace />
      </>
    );
  }

  // Landing page for unauthenticated users
  return (
    <>
      <Helmet>
        <title>Stories Creator com IA | Método IA Real</title>
        <meta name="description" content="Crie stories incríveis para Instagram com inteligência artificial. Imagens profissionais geradas em segundos." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/10 rounded-full blur-3xl opacity-50" />
          
          <div className="container relative mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent text-sm font-medium mb-6">
                  <Sparkles className="w-4 h-4" />
                  Powered by AI
                </div>
                
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
                  Stories que{' '}
                  <span className="text-gradient-gold">impressionam</span>
                  <br />em segundos
                </h1>
                
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Crie stories profissionais para Instagram com IA. 
                  Descreva sua visão e deixe a inteligência artificial gerar imagens incríveis.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg"
                    onClick={() => navigate('/auth')}
                    className="gap-2 text-lg h-14 px-8 bg-gradient-to-r from-accent to-gold-light hover:opacity-90 btn-shimmer"
                  >
                    Começar Grátis
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    className="gap-2 text-lg h-14 px-8"
                  >
                    <Smartphone className="w-5 h-5" />
                    Ver Exemplos
                  </Button>
                </div>
              </motion.div>

              {/* Phone mockup preview */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="mt-16 relative"
              >
                <div className="flex justify-center gap-4 md:gap-8">
                  {[
                    { style: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' },
                    { style: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ee9ca7 100%)' },
                    { style: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 70%, #d4af37 100%)' },
                  ].map((preview, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="relative"
                    >
                      <div 
                        className={`w-24 md:w-32 h-48 md:h-56 rounded-2xl shadow-2xl ${
                          i === 1 ? 'scale-110 z-10' : 'opacity-80'
                        }`}
                        style={{ background: preview.style }}
                      />
                      {i === 1 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Sparkles className="w-8 h-8 text-white/80" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Por que usar o Stories Creator?
              </h2>
              <p className="text-muted-foreground text-lg">
                Tecnologia de ponta para criadores de conteúdo
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  icon: Wand2,
                  title: 'IA Generativa',
                  description: 'Descreva sua ideia e veja a mágica acontecer. Imagens únicas geradas em segundos.',
                },
                {
                  icon: Image,
                  title: '8 Estilos Visuais',
                  description: 'De minimal a neon cyberpunk. Escolha o estilo perfeito para sua marca.',
                },
                {
                  icon: Zap,
                  title: 'Export HD',
                  description: 'Exporte em alta resolução (1080x1920) pronto para publicar no Instagram.',
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-2xl glass-panel hover-scale-micro"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-navy-dark to-navy glass-panel neon-border"
            >
              <Star className="w-12 h-12 text-accent mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Pronto para criar stories incríveis?
              </h2>
              <p className="text-white/70 text-lg mb-8">
                Junte-se a milhares de criadores usando IA para se destacar no Instagram
              </p>
              <Button 
                size="lg"
                onClick={() => navigate('/auth')}
                className="gap-2 text-lg h-14 px-10 bg-accent hover:bg-accent/90"
              >
                Começar Agora
                <ArrowRight className="w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-border">
          <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
            <p>© 2024 Método IA Real. Todos os direitos reservados.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default StoriesPage;