import { Button } from '@/components/ui/button';
import { ScrollReveal } from '@/components/ScrollReveal';
import { 
  Zap, 
  Target, 
  Users, 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  FileText,
  MessageSquare,
  BarChart3,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: FileText,
    title: 'Central de Prompts',
    description: 'Biblioteca organizada por categoria: marketing, vendas, atendimento, gestão e conteúdo.'
  },
  {
    icon: Layers,
    title: 'Editor de Conteúdo',
    description: 'Crie posts, carrosséis e textos prontos para usar com geração automática.'
  },
  {
    icon: Sparkles,
    title: 'Fluxos de IA',
    description: 'Processos passo a passo: da ideia ao resultado em minutos.'
  },
  {
    icon: Users,
    title: 'Gestão de Equipe',
    description: 'Adicione colaboradores e padronize o uso de IA na empresa.'
  }
];

const benefits = [
  { icon: Clock, text: 'Economize 10h+ por semana' },
  { icon: Target, text: 'Padronize processos com IA' },
  { icon: TrendingUp, text: 'Aumente a produtividade do time' },
  { icon: Zap, text: 'Resultados desde o primeiro dia' }
];

const useCases = [
  {
    title: 'Agências de Marketing',
    description: 'Crie conteúdo para clientes em escala, com qualidade e consistência.'
  },
  {
    title: 'E-commerce',
    description: 'Descrições de produtos, emails e atendimento automatizados.'
  },
  {
    title: 'Negócios Locais',
    description: 'Redes sociais, respostas a clientes e promoções em minutos.'
  },
  {
    title: 'Times Internos',
    description: 'Marketing, vendas e gestão alinhados com o mesmo método.'
  }
];

export default function MetodoLanding() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/metodo" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-accent to-gold rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">Método IA</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/metodo/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Planos
            </Link>
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Recursos
            </a>
            <a href="#cases" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Para quem
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/metodo/login">Entrar</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/metodo/solicitar">Começar grátis</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Versão 1.0 disponível
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Inteligência Artificial aplicada ao{' '}
                <span className="text-accent">dia a dia das empresas</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Prompts prontos, fluxos organizados e ferramentas práticas para sua equipe 
                produzir mais com menos esforço.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="text-base">
                  <Link to="/metodo/solicitar">
                    Solicitar acesso
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-base">
                  <Link to="/metodo/pricing">Ver planos</Link>
                </Button>
              </div>
            </div>
          </ScrollReveal>

          {/* Benefits bar */}
          <ScrollReveal delay={200}>
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4"
                >
                  <benefit.icon className="w-5 h-5 text-accent shrink-0" />
                  <span className="text-sm font-medium text-foreground">{benefit.text}</span>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Tudo que sua empresa precisa
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Uma plataforma completa para aplicar IA de forma organizada e produtiva.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <div className="bg-card border border-border rounded-xl p-6 h-full hover:border-accent/50 transition-colors">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Simples de usar
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Em 3 passos sua equipe está produzindo mais.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '01', title: 'Escolha o prompt', desc: 'Navegue pela biblioteca organizada por categoria e objetivo.' },
              { step: '02', title: 'Personalize', desc: 'Adapte com dados da sua empresa em segundos.' },
              { step: '03', title: 'Use e repita', desc: 'Copie, cole e produza. Salve seus favoritos.' }
            ].map((item, index) => (
              <ScrollReveal key={index} delay={index * 150}>
                <div className="text-center">
                  <div className="text-5xl font-display font-bold text-accent/20 mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section id="cases" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Para quem é o Método IA?
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {useCases.map((useCase, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <div className="bg-card border border-border rounded-xl p-6 h-full">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    {useCase.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {useCase.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="bg-gradient-to-br from-navy-dark to-navy border border-accent/20 rounded-2xl p-8 md:p-12 text-center max-w-4xl mx-auto">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                Pronto para transformar sua empresa?
              </h2>
              <p className="text-white/70 mb-8 max-w-2xl mx-auto">
                Solicite acesso e comece a usar IA de forma prática e organizada.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="hero" asChild>
                  <Link to="/metodo/solicitar">
                    Solicitar acesso agora
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
                  <Link to="/metodo/pricing">Ver planos e preços</Link>
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-accent to-gold rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-foreground">Método IA</span>
            </div>
            <nav className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/termos" className="hover:text-foreground transition-colors">Termos</Link>
              <Link to="/privacidade" className="hover:text-foreground transition-colors">Privacidade</Link>
              <a href="mailto:contato@metodoiareal.com.br" className="hover:text-foreground transition-colors">Contato</a>
            </nav>
            <p className="text-sm text-muted-foreground">
              © 2025 Método IA. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
