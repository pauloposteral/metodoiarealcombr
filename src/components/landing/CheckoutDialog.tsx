import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { X, ArrowRight, Shield, Lock, CreditCard, Banknote, CheckCircle, Award, Clock, Loader2, Mail, Eye, EyeOff, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { COURSE_PRICE_ID } from '@/lib/constants';
import { purchaseSessionState, safeCheckoutDestination } from '@/lib/purchaseState';
import { COURSE_BENEFITS, COURSE_DISPLAY_PRICE, COURSE_PAYMENT_NOTE, COURSE_ACCESS_NOTE } from '@/lib/courseOffer';
import logo from '@/assets/logo-iareal.png';

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CheckoutDialog = ({ open, onOpenChange }: CheckoutDialogProps) => {
  const navigate = useNavigate();
  const authBusy = useRef(false);
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', fullName: '' });
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [accessCheckError, setAccessCheckError] = useState(false);

  useEffect(() => {
    if (!open) return;
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
          onOpenChange(false); navigate('/membros', { replace: true }); return;
        }
        if (profile.data?.access_status === 'revoked') { onOpenChange(false); navigate('/acesso-bloqueado', { replace: true }); return; }
        setIsAuthenticated(true); setUserEmail(session.user.email ?? '');
      } catch { if (!cancelled) { setIsAuthenticated(false); setAccessCheckError(true); } }
      finally { if (!cancelled) setCheckingAuth(false); }
    })();
    return () => { cancelled = true; };
  }, [open, onOpenChange, navigate]);

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
      if (role.data || profile.data?.access_status === 'active') { onOpenChange(false); navigate('/membros', { replace: true }); return; }
      if (profile.data?.access_status === 'revoked') { onOpenChange(false); navigate('/acesso-bloqueado', { replace: true }); return; }
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

      // Meta Pixel tracking
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'InitiateCheckout', {
          content_name: 'Método IA Real',
          currency: 'BRL',
          value: 497,
        });
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
      console.error('Checkout error:', err);
      toast.error('Erro ao iniciar pagamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const included = COURSE_BENEFITS;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden bg-card border-accent/20 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-accent/10 to-accent/5 p-4 sm:p-6 text-center border-b border-border/50">
          <img src={logo} alt="Método IA Real" className="w-[250px] h-auto mx-auto mb-3 opacity-90 object-contain" />
          <DialogTitle className="font-display text-xl sm:text-2xl font-bold text-foreground">
            Finalizar compra
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">Acesso liberado após a confirmação do pagamento.</DialogDescription>
        </div>

        <div className="p-4 sm:p-6 space-y-5">
          {/* Product Summary */}
          <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-foreground">Método IA Real</span>
              <div className="text-right">

                <span className="text-xl font-bold text-foreground">{COURSE_DISPLAY_PRICE}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              {included.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {checkingAuth ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
            </div>
          ) : accessCheckError ? (
            <section role="alert" className="rounded-xl border border-amber-500/40 p-5"><h2 className="font-semibold">Não foi possível verificar seu acesso.</h2><p className="mt-2 text-sm">Não inicie outra compra enquanto verificamos se você já possui acesso. Recarregue para tentar novamente.</p><Button type="button" variant="outline" className="mt-4" onClick={() => window.location.reload()}>Recarregar verificação</Button></section>
          ) : !isAuthenticated ? (
            /* Auth Form */
            <div>
              <div className="flex gap-2 mb-4">
                <Button
                  variant={authMode === 'login' ? 'default' : 'outline'}
                      aria-pressed={authMode === 'login'}
                  size="sm"
                  onClick={() => setAuthMode('login')}
                  className="min-h-11 flex-1 text-xs"
                >
                  Já tenho conta
                </Button>
                <Button
                  variant={authMode === 'signup' ? 'default' : 'outline'}
                      aria-pressed={authMode === 'signup'}
                  size="sm"
                  onClick={() => setAuthMode('signup')}
                  className="min-h-11 flex-1 text-xs"
                >
                  Criar conta
                </Button>
              </div>

{confirmationEmail && <section role="status" className="mb-4 rounded-xl border border-accent/40 bg-accent/10 p-4 text-foreground"><h3 className="font-semibold">Confira seu e-mail</h3><p className="mt-2 text-sm leading-relaxed">Caso seja necessária confirmação para {confirmationEmail}, siga as instruções recebidas. A conta ainda não tem uma sessão ativa e nenhum pagamento foi iniciado.</p><Button type="button" variant="outline" className="mt-3 min-h-11" onClick={() => { setAuthMode('login'); setConfirmationEmail(''); }}>Já confirmei. Entrar</Button></section>}
              <form onSubmit={handleAuth} className="space-y-3">
                {authMode === 'signup' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="checkout-name" className="text-xs">Nome completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="checkout-name"
                        autoComplete="name"
                        placeholder="Seu nome"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="pl-10 h-11 bg-secondary text-base lg:h-10 lg:text-sm"
                        required
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="checkout-email" className="text-xs">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="checkout-email"
                      type="email"
                      autoComplete="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10 h-11 bg-secondary text-base lg:h-10 lg:text-sm"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="checkout-password" className="text-xs">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="checkout-password"
                      autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10 pr-11 h-11 bg-secondary text-base lg:h-10 lg:text-sm"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="min-h-11 w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    <>
                      {authMode === 'login' ? 'Entrar e continuar' : 'Criar conta e continuar'}
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          ) : (
            /* Payment Buttons */
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground text-center">
                Logado como <strong className="text-foreground">{userEmail}</strong>
              </p>

              <Button
                variant="hero"
                size="lg"
                className="w-full group text-base py-5"
                onClick={handlePayment}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Continuar para pagamento seguro
                    <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>

              <p className="text-xs leading-relaxed text-muted-foreground">{COURSE_PAYMENT_NOTE}</p><p className="mt-2 text-xs leading-relaxed opacity-80">{COURSE_ACCESS_NOTE}</p>
            </div>
          )}

          {/* Guarantee */}
          <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 text-center">
            <Shield className="w-8 h-8 text-accent mx-auto mb-2" />
            <p className="font-semibold text-sm text-foreground mb-1">Garantia de 7 dias</p>
            <p className="text-xs text-muted-foreground">
              Se não gostar, devolvemos 100% do seu investimento. Sem perguntas.
            </p>
          </div>

          {/* Security badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Lock className="w-3.5 h-3.5 text-green-500" />
              <span className="text-[10px] font-medium">SSL Seguro</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <CreditCard className="w-3.5 h-3.5 text-accent" />
              <span className="text-[10px] font-medium">Stripe Payments</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Shield className="w-3.5 h-3.5 text-accent" />
              <span className="text-[10px] font-medium">Dados protegidos</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
