import { Button } from '@/components/ui/button';
import { ScrollReveal } from '@/components/ScrollReveal';
import { Check, Sparkles, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Starter',
    price: 'R$ 97',
    period: '/mês',
    description: 'Para pequenas equipes começando com IA',
    features: [
      'Até 3 usuários',
      'Prompts essenciais (50+)',
      'Editor de conteúdo',
      'Treinamento básico',
      'Atualizações mensais',
      'Suporte por email'
    ],
    cta: 'Começar agora',
    popular: false,
    available: true
  },
  {
    name: 'Pro',
    price: 'R$ 197',
    period: '/mês',
    description: 'Para equipes que querem escalar',
    features: [
      'Até 10 usuários',
      'Todos os prompts (100+)',
      'Editor avançado',
      'Fluxos de IA completos',
      'Comunidade exclusiva',
      'Templates premium',
      'Suporte prioritário'
    ],
    cta: 'Em breve',
    popular: true,
    available: false
  },
  {
    name: 'Business',
    price: 'Sob consulta',
    period: '',
    description: 'Para empresas com necessidades específicas',
    features: [
      'Usuários ilimitados',
      'Acesso total',
      'Suporte dedicado',
      'Onboarding guiado',
      'Customizações',
      'Atualizações antecipadas',
      'SLA garantido'
    ],
    cta: 'Falar com vendas',
    popular: false,
    available: false
  }
];

const faqs = [
  {
    question: 'Posso testar antes de assinar?',
    answer: 'Sim! Oferecemos 7 dias para você experimentar a plataforma sem compromisso.'
  },
  {
    question: 'Como funciona a adição de usuários?',
    answer: 'O admin da empresa pode convidar colaboradores diretamente pelo painel. Cada usuário recebe acesso individual.'
  },
  {
    question: 'Posso fazer upgrade do plano?',
    answer: 'Sim, você pode fazer upgrade a qualquer momento. O valor será proporcional ao período restante.'
  },
  {
    question: 'Os prompts são atualizados?',
    answer: 'Sim! Adicionamos novos prompts e fluxos todo mês, baseados nas melhores práticas do mercado.'
  }
];

export default function MetodoPricing() {
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
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/metodo/login">Entrar</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/metodo/solicitar">Começar</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-12">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto">
              <Link 
                to="/metodo" 
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Link>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Planos simples, resultados reais
              </h1>
              <p className="text-lg text-muted-foreground">
                Escolha o plano ideal para sua equipe. Cancele quando quiser.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Plans */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <div 
                  className={cn(
                    "relative bg-card border rounded-2xl p-6 h-full flex flex-col",
                    plan.popular 
                      ? "border-accent shadow-lg shadow-accent/10" 
                      : "border-border"
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-medium px-3 py-1 rounded-full">
                      Mais popular
                    </div>
                  )}
                  
                  <div className="mb-6">
                    <h3 className="font-display text-xl font-bold text-foreground mb-2">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="font-display text-4xl font-bold text-foreground">
                        {plan.price}
                      </span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className="w-full" 
                    variant={plan.popular ? 'default' : 'outline'}
                    disabled={!plan.available}
                    asChild={plan.available}
                  >
                    {plan.available ? (
                      <Link to="/metodo/solicitar">{plan.cta}</Link>
                    ) : (
                      <span>{plan.cta}</span>
                    )}
                  </Button>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <h2 className="font-display text-3xl font-bold text-foreground text-center mb-12">
              Perguntas frequentes
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="font-display font-semibold text-foreground mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {faq.answer}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Método IA. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
