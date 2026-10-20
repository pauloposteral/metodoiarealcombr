import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Shield, Lock, CreditCard, Banknote, CheckCircle, Loader2, Mail, Eye, EyeOff, User, Award, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { COURSE_PRICE_ID } from '@/lib/constants';
import { purchaseSessionState, safeCheckoutDestination } from '@/lib/purchaseState';
import { COURSE_BENEFITS, COURSE_DISPLAY_PRICE, COURSE_PAYMENT_NOTE, COURSE_ACCESS_NOTE } from '@/lib/courseOffer';
import logo from '@/assets/logo-iareal.png';
import { Helmet } from 'react-helmet-async';

const Checkout = () => {
  const navigate = useNavigate();
  const authBusy = useRef(false);
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', fullName: '' });
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [accessCheckError, setAccessCheckError] = useState(false);

  useEffect(() => {

    let cancelled = false;
    setCheckingAuth(true); setAccessCheckError(false); setIsAuthenticated(false);
    void (async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!session) { if (!cancelled) setUserEmail(''); return; }
        const [profile, role] = await Promise.all([
          supabase.from('profiles').select('access_status').eq('id', session.user.id).maybeSingle(),
          supabase.rpc('has_role', { _user_id: session.user.id, _role: 'admin' }),
        ]);
        if (cancelled) return;
        if (profile.error || role.error || (!profile.data && !role.data)) throw new Error('Access status unavailable');
        if (role.data || profile.data?.access_status === 'active') {
          navigate('/membros', { replace: true }); return;
        }
        if (profile.data?.access_status === 'revoked') { navigate('/acesso-bloqueado', { replace: true }); return; }
        setIsAuthenticated(true); setUserEmail(session.user.email ?? '');
      } catch { if (!cancelled) { setIsAuthenticated(false); setAccessCheckError(true); } }
      finally { if (!cancelled) setCheckingAuth(false); }
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authBusy.current) return;
    authBusy.current = true; setIsLoading(true);
    try {
      const email = formData.email.trim();
      const result = authMode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password: formData.password })
        : await supabase.auth.signUp({ email, password: formData.password, options: { emailRedirectTo: window.location.origin + '/membros', data: { full_name: formData.fullName.trim() } } });
      if (result.error) throw result.error;
      const session = result.data.session;
      const state = purchaseSessionState(authMode, session);
      if (state === 'confirmation-pending') {
        setIsAuthenticated(false); setConfirmationEmail(email); setFormData(previous => ({ ...previous, password: '' }));
        return;
      }
      if (state !== 'authenticated' || !session) throw new Error('Não foi possível confirmar a sessão. Entre novamente.');
      const [profile, role] = await Promise.all([
        supabase.from('profiles').select('access_status').eq('id', session.user.id).maybeSingle(),
        supabase.rpc('has_role', { _user_id: session.user.id, _role: 'admin' }),
      ]);
      if (profile.error || role.error || (!profile.data && !role.data)) throw new Error('Sua sessão foi criada, mas não foi possível conferir seu acesso. Tente entrar novamente antes de pagar.');
      if (role.data || profile.data?.access_status === 'active') { navigate('/membros', { replace: true }); return; }
      if (profile.data?.access_status === 'revoked') { navigate('/acesso-bloqueado', { replace: true }); return; }
      setConfirmationEmail(''); setIsAuthenticated(true); setUserEmail(session.user.email ?? email);
      setFormData(previous => ({ ...previous, password: '' }));
      toast.success('Sessão iniciada. Confira as condições antes de pagar.');
    } catch (caught) {
      setIsAuthenticated(false);
      const error = caught instanceof Error ? caught : new Error('Não foi possível concluir a operação.');
      let message = error.message;
      if (message.includes('Invalid login credentials')) message = 'E-mail ou senha incorretos.';
      else if (message.includes('Email not confirmed')) message = 'Confirme seu e-mail antes de entrar.';
      else if (message.includes('User already registered')) message = 'Este e-mail já está cadastrado. Faça login.';
      toast.error(message);
    } finally { authBusy.current = false; setIsLoading(false); }
  };

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setIsAuthenticated(false); throw new Error('Sua sessão terminou. Entre novamente.'); }

      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'InitiateCheckout', { content_name: 'Método IA Real', currency: 'BRL', value: 497 });
      }
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: COURSE_PRICE_ID, mode: 'payment' },
      });
      if (error) throw error;
      const destination = safeCheckoutDestination(data?.url);
      if (destination) window.location.href = destination;
      else throw new Error('Endereço de pagamento inválido.');
    } catch (caught) {
      const err = caught instanceof Error ? caught : new Error('Não foi possível concluir a operação.');
      toast.error('Erro ao iniciar pagamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const included = COURSE_BENEFITS;

  return (
    <>
      <Helmet>
        <title>Checkout | Método IA Real</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-navy-dark to-navy">
        {/* Top bar */}
        <div className="border-b border-primary-foreground/10 bg-navy-dark/80 backdrop-blur-md" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
          <div className="container px-4 py-3 flex items-center justify-between">
            <button type="button" onClick={() => navigate('/')} className="flex min-h-11 items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
            <img src={logo} alt="Método IA Real" className="w-[150px] sm:w-[220px] max-w-[50vw] h-auto object-contain" />
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

                  <div className="flex justify-between text-lg font-bold text-primary-foreground pt-2 border-t border-primary-foreground/10">
                    <span>Total</span>
                    <span>{COURSE_DISPLAY_PRICE}</span>
                  </div>
                  <p className="text-xs text-primary-foreground/70 text-center">{COURSE_PAYMENT_NOTE}</p><p className="mt-2 text-xs leading-relaxed opacity-80">{COURSE_ACCESS_NOTE}</p>
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
                    <span className="text-[10px]">Condições da oferta</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Auth + Payment */}
            <div className="md:col-span-3 order-1 md:order-2">
              {checkingAuth ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-accent" />
                </div>
              ) : accessCheckError ? (
            <section role="alert" className="rounded-xl border border-amber-500/40 p-5"><h2 className="font-semibold">Não foi possível verificar seu acesso.</h2><p className="mt-2 text-sm">Não inicie outra compra enquanto verificamos se você já possui acesso. Recarregue para tentar novamente.</p><Button type="button" variant="outline" className="mt-4" onClick={() => window.location.reload()}>Recarregar verificação</Button></section>
          ) : !isAuthenticated ? (
                <div className="bg-primary-foreground/5 backdrop-blur-sm rounded-2xl p-5 md:p-8 border border-primary-foreground/10">
                  <h2 className="font-display text-xl font-bold text-primary-foreground mb-1">Seus dados</h2>
                  <p className="text-sm text-primary-foreground/60 mb-5">Crie sua conta para acessar o curso</p>

                  <div className="flex gap-2 mb-5">
                    <Button
                      variant={authMode === 'signup' ? 'default' : 'outline'}
                      aria-pressed={authMode === 'signup'}
                      size="sm"
                      onClick={() => setAuthMode('signup')}
                      className="min-h-11 flex-1 text-xs border-primary-foreground/20"
                    >
                      Criar conta
                    </Button>
                    <Button
                      variant={authMode === 'login' ? 'default' : 'outline'}
                      aria-pressed={authMode === 'login'}
                      size="sm"
                      onClick={() => setAuthMode('login')}
                      className="min-h-11 flex-1 text-xs border-primary-foreground/20"
                    >
                      Já tenho conta
                    </Button>
                  </div>

{confirmationEmail && <section role="status" className="mb-4 rounded-xl border border-accent/40 bg-accent/10 p-4 text-primary-foreground"><h3 className="font-semibold">Confira seu e-mail</h3><p className="mt-2 text-sm leading-relaxed">Caso seja necessária confirmação para {confirmationEmail}, siga as instruções recebidas. A conta ainda não tem uma sessão ativa e nenhum pagamento foi iniciado.</p><Button type="button" variant="outline" className="mt-3 min-h-11" onClick={() => { setAuthMode('login'); setConfirmationEmail(''); }}>Já confirmei. Entrar</Button></section>}
                  <form onSubmit={handleAuth} className="space-y-4">
                    {authMode === 'signup' && (
                      <div className="space-y-1.5">
                        <Label htmlFor="purchase-name" className="text-primary-foreground text-sm">Nome completo</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/40" />
                          <Input
                            id="purchase-name" autoComplete="name" placeholder="Seu nome"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="pl-10 h-11 bg-primary-foreground/5 border-primary-foreground/15 text-primary-foreground"
                            required
                          />
                        </div>
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <Label htmlFor="purchase-email" className="text-primary-foreground text-sm">E-mail</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/40" />
                        <Input
                          type="email"
                          id="purchase-email" autoComplete="email" placeholder="seu@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="pl-10 h-11 bg-primary-foreground/5 border-primary-foreground/15 text-primary-foreground"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="purchase-password" className="text-primary-foreground text-sm">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/40" />
                        <Input
                          id="purchase-password" autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'} type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="pl-10 pr-10 h-11 bg-primary-foreground/5 border-primary-foreground/15 text-primary-foreground"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md text-primary-foreground/60 hover:text-primary-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" variant="hero" size="lg" className="w-full text-base py-5" disabled={isLoading}>
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>
                          {authMode === 'signup' ? 'Criar conta e continuar' : 'Entrar e continuar'}
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
                          Continuar para pagamento seguro
                          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </Button>

                    <p className="text-xs leading-relaxed text-primary-foreground/70">{COURSE_PAYMENT_NOTE}</p>
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
