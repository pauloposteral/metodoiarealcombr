import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Check, Zap, Crown, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const plans = [
  {
    slug: 'free',
    name: 'Free',
    icon: Zap,
    priceMonthly: 0,
    priceYearly: 0,
    description: 'Comece a aprender IA gratuitamente',
    features: [
      '3 aulas preview',
      'Acesso à comunidade (leitura)',
      'Certificado não disponível',
    ],
    notIncluded: [
      'AI Sandbox',
      'Quizzes interativos',
      'Certificado verificável',
      'Suporte prioritário',
    ],
    cta: 'Começar Grátis',
    popular: false,
  },
  {
    slug: 'pro',
    name: 'Pro',
    icon: Crown,
    priceMonthly: 4990,
    priceYearly: 39900,
    description: 'Para quem leva IA a sério',
    features: [
      'Todos os módulos e aulas',
      'AI Sandbox (50 prompts/dia)',
      'Quizzes interativos',
      'Certificado verificável',
      'Comunidade completa',
      'Materiais complementares',
    ],
    notIncluded: [
      'Sandbox ilimitado',
      'Mentoria prioritária',
    ],
    cta: 'Assinar Pro',
    popular: true,
  },
  {
    slug: 'premium',
    name: 'Premium',
    icon: Sparkles,
    priceMonthly: 9990,
    priceYearly: 79900,
    description: 'Acesso total + suporte VIP',
    features: [
      'Tudo do Pro',
      'AI Sandbox ilimitado',
      'Mentoria prioritária',
      'Acesso antecipado a novos módulos',
      'Projetos guiados exclusivos',
      'Badge exclusiva no perfil',
    ],
    notIncluded: [],
    cta: 'Assinar Premium',
    popular: false,
  },
];

function formatPrice(cents: number) {
  if (cents === 0) return 'Grátis';
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
}

export default function Pricing() {
  const navigate = useNavigate();
  const { subscribed, plan: planSlug, openCheckout, openCustomerPortal } = useSubscription();
  const [yearly, setYearly] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSelectPlan = async (slug: string) => {
    if (slug === 'free') {
      navigate('/auth');
      return;
    }

    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.info('Faça login para assinar um plano');
      navigate('/auth');
      return;
    }

    // If already subscribed, open portal
    if (subscribed && planSlug !== 'free') {
      try {
        setLoadingPlan(slug);
        await openCustomerPortal();
      } catch {
        toast.error('Erro ao abrir portal de assinatura');
      } finally {
        setLoadingPlan(null);
      }
      return;
    }

    try {
      setLoadingPlan(slug);
      await openCheckout(slug as 'pro' | 'premium', yearly ? 'yearly' : 'monthly');
    } catch {
      toast.error('Erro ao iniciar checkout');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>Planos e Preços — IA Real Academy</title>
        <meta name="description" content="Escolha o plano ideal para dominar Inteligência Artificial. Do gratuito ao premium." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="py-16 md:py-24 text-center px-4">
          <Badge variant="outline" className="mb-4 border-accent text-accent">
            Planos e Preços
          </Badge>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Invista no seu futuro com IA
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Escolha o plano ideal para a sua jornada. Cancele quando quiser.
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className={`text-sm font-medium ${!yearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Mensal
            </span>
            <Switch checked={yearly} onCheckedChange={setYearly} />
            <span className={`text-sm font-medium ${yearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Anual
            </span>
            {yearly && (
              <Badge className="bg-accent/10 text-accent border-accent/20">
                Economia de ~33%
              </Badge>
            )}
          </div>
        </div>

        {/* Plans grid */}
        <div className="max-w-6xl mx-auto px-4 pb-24 grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const price = yearly ? plan.priceYearly : plan.priceMonthly;
            const isCurrent = isActive && planSlug === plan.slug;
            const Icon = plan.icon;

            return (
              <div
                key={plan.slug}
                className={`relative rounded-2xl border p-8 flex flex-col transition-all ${
                  plan.popular
                    ? 'border-accent shadow-lg shadow-accent/10 scale-[1.02]'
                    : 'border-border'
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground">
                    Mais Popular
                  </Badge>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    plan.popular ? 'bg-accent/20' : 'bg-muted'
                  }`}>
                    <Icon className={`w-5 h-5 ${plan.popular ? 'text-accent' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-foreground">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground">{plan.description}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <span className="text-3xl font-bold text-foreground">
                    {formatPrice(price)}
                  </span>
                  {price > 0 && (
                    <span className="text-sm text-muted-foreground">
                      /{yearly ? 'ano' : 'mês'}
                    </span>
                  )}
                  {yearly && price > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      = {formatPrice(Math.round(price / 12))}/mês
                    </p>
                  )}
                </div>

                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                  {plan.notIncluded.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm opacity-40">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="line-through">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSelectPlan(plan.slug)}
                  disabled={loadingPlan === plan.slug || isCurrent}
                  className={`w-full ${
                    plan.popular
                      ? 'bg-accent hover:bg-accent/90 text-accent-foreground'
                      : ''
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {loadingPlan === plan.slug ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {isCurrent ? 'Plano Atual' : plan.cta}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
