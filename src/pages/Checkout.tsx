import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Shield, Lock, CreditCard, Banknote, CheckCircle, Loader2, Mail, Eye, EyeOff, User, Award, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { COURSE_PRICE_ID } from '@/lib/constants';
import logo from '@/assets/logo-iareal.png';
import { Helmet } from 'react-helmet-async';

const Checkout = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', fullName: '' });
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsAuthenticated(true);
        setUserEmail(session.user.email || '');
      }
      setCheckingAuth(false);
    };
    checkAuth();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/membros`,
            data: { full_name: formData.fullName },
          },
        });
        if (error) throw error;
      }
      setIsAuthenticated(true);
      setUserEmail(formData.email);
      toast.success('Conta verificada com sucesso!');
    } catch (error: any) {
      let message = error.message;
      if (error.message.includes('Invalid login credentials')) message = 'Email ou senha incorretos.';
      else if (error.message.includes('User already registered')) message = 'Este email já está cadastrado. Faça login.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'InitiateCheckout', { content_name: 'Método IA Real', currency: 'BRL', value: 497 });
      }
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: COURSE_PRICE_ID, mode: 'payment' },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
      else throw new Error('URL não recebida');
    } catch (err: any) {
      toast.error('Erro ao iniciar pagamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const included = [
    'Acesso vitalício ao curso completo',
    'Biblioteca com 100+ prompts prontos',
    'Comunidade exclusiva de alunos',
    'Certificado de conclusão',
    'Atualizações futuras grátis',
    'Aula bônus: Como Estudar com IA',
    'Aula bônus: Como Ensinar com IA',
    'Suporte na comunidade',
  ];

  return (
    <>
      <Helmet>
        <title>Checkout | Método IA Real</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-navy-dark to-navy">
        {/* Top bar */}
        <div className="border-b border-primary-foreground/10 bg-navy-dark/80 backdrop-blur-md">
          <div className="container px-4 py-3 flex items-center justify-between">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
            <img src={logo} alt="Método IA Real" className="w-[250px] h-auto object-contain" />
            <div className="flex items-center gap-1.5 text-primary-foreground/50">
              <Lock className="w-3.5 h-3.5 text-green-500" />
              <span className="text-xs hidden sm:inline">Seguro</span>
            </div>
          </div>
        </div>

        <div className="container px-4 py-8 md:py-12">
          <div className="max-w-4xl mx-auto grid md:grid-cols-5 gap-6 md:gap-8">
            {/* Left: Product Summary */}
            <div className="md:col-span-2 order-2 md:order-1">
              <div className="bg-primary-foreground/5 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-primary-foreground/10 sticky top-24">
                <h3 className="font-display text-lg font-bold text-primary-foreground mb-4">Resumo do pedido</h3>

                <div className="space-y-2 mb-5">
                  {included.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-primary-foreground/80">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-primary-foreground/10 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-primary-foreground/60">
                    <span>Valor original</span>
                    <span className="line-through">R$ 997</span>
                  </div>
                  <div className="flex justify-between text-sm text-accent font-semibold">
                    <span>Desconto (50%)</span>
                    <span>-R$ 500</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-primary-foreground pt-2 border-t border-primary-foreground/10">
                    <span>Total</span>
                    <span>R$ 497</span>
                  </div>
                  <p className="text-xs text-primary-foreground/50 text-center">ou 12x de R$ 41,42 sem juros</p>
                </div>

                {/* Guarantee */}
                <div className="mt-5 bg-accent/10 border border-accent/20 rounded-xl p-4 text-center">
                  <Shield className="w-10 h-10 text-accent mx-auto mb-2" />
                  <p className="font-semibold text-sm text-primary-foreground mb-1">Garantia incondicional de 7 dias</p>
                  <p className="text-xs text-primary-foreground/60">
                    Se não gostar, devolvemos 100% do investimento. Sem perguntas.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                  <div className="flex items-center gap-1 text-primary-foreground/40">
                    <Award className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Certificado</span>
                  </div>
                  <div className="flex items-center gap-1 text-primary-foreground/40">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Acesso vitalício</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Auth + Payment */}
            <div className="md:col-span-3 order-1 md:order-2">
              {/* Spots counter */}
              <div className="flex items-center justify-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-6">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-red-400">Apenas 23 vagas restantes com desconto</span>
              </div>

              {checkingAuth ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-accent" />
                </div>
              ) : !isAuthenticated ? (
                <div className="bg-primary-foreground/5 backdrop-blur-sm rounded-2xl p-5 md:p-8 border border-primary-foreground/10">
                  <h2 className="font-display text-xl font-bold text-primary-foreground mb-1">Seus dados</h2>
                  <p className="text-sm text-primary-foreground/60 mb-5">Crie sua conta para acessar o curso</p>

                  <div className="flex gap-2 mb-5">
                    <Button
                      variant={authMode === 'signup' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAuthMode('signup')}
                      className="flex-1 text-xs border-primary-foreground/20"
                    >
                      Criar conta
                    </Button>
                    <Button
                      variant={authMode === 'login' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAuthMode('login')}
                      className="flex-1 text-xs border-primary-foreground/20"
                    >
                      Já tenho conta
                    </Button>
                  </div>

                  <form onSubmit={handleAuth} className="space-y-4">
                    {authMode === 'signup' && (
                      <div className="space-y-1.5">
                        <Label className="text-primary-foreground text-sm">Nome completo</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/40" />
                          <Input
                            placeholder="Seu nome"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="pl-10 h-11 bg-primary-foreground/5 border-primary-foreground/15 text-primary-foreground"
                            required
                          />
                        </div>
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <Label className="text-primary-foreground text-sm">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/40" />
                        <Input
                          type="email"
                          placeholder="seu@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="pl-10 h-11 bg-primary-foreground/5 border-primary-foreground/15 text-primary-foreground"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-primary-foreground text-sm">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/40" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="pl-10 pr-10 h-11 bg-primary-foreground/5 border-primary-foreground/15 text-primary-foreground"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-foreground/40"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" variant="hero" size="lg" className="w-full text-base py-5" disabled={isLoading}>
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>
                          {authMode === 'signup' ? 'Criar conta e pagar' : 'Entrar e pagar'}
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="bg-primary-foreground/5 backdrop-blur-sm rounded-2xl p-5 md:p-8 border border-primary-foreground/10">
                  <h2 className="font-display text-xl font-bold text-primary-foreground mb-1">Forma de pagamento</h2>
                  <p className="text-sm text-primary-foreground/60 mb-6">
                    Logado como <strong className="text-primary-foreground">{userEmail}</strong>
                  </p>

                  <div className="space-y-3">
                    <Button
                      variant="hero"
                      size="lg"
                      className="w-full group text-base py-6"
                      onClick={handlePayment}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5 mr-2" />
                          Pagar com Cartão — 12x R$41
                          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full group text-base py-6 border-green-500/30 hover:bg-green-500/10 hover:border-green-500/50 text-primary-foreground"
                      onClick={handlePayment}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Banknote className="w-5 h-5 mr-2 text-green-500" />
                          Pagar com PIX — R$447
                          <span className="ml-2 text-xs text-green-500 font-bold bg-green-500/10 px-2 py-0.5 rounded-full">10% OFF</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Security */}
                  <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-4 border-t border-primary-foreground/10">
                    <div className="flex items-center gap-1.5 text-primary-foreground/40">
                      <Lock className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-xs">SSL Seguro</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-primary-foreground/40">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span className="text-xs">Stripe Payments</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-primary-foreground/40">
                      <Shield className="w-3.5 h-3.5" />
                      <span className="text-xs">Dados protegidos</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
