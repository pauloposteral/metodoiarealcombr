import { useState, useEffect } from 'react';
import { X, ArrowRight, Shield, Lock, CreditCard, Banknote, CheckCircle, Award, Clock, Loader2, Mail, Eye, EyeOff, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { COURSE_PRICE_ID } from '@/lib/constants';
import logo from '@/assets/logo-iareal.png';

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CheckoutDialog = ({ open, onOpenChange }: CheckoutDialogProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', fullName: '' });
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (!open) return;
    const checkAuth = async () => {
      setCheckingAuth(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsAuthenticated(true);
        setUserEmail(session.user.email || '');
      } else {
        setIsAuthenticated(false);
      }
      setCheckingAuth(false);
    };
    checkAuth();
  }, [open]);

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
      toast.success('Autenticado com sucesso!');
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
      // Meta Pixel tracking
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'InitiateCheckout', {
          content_name: 'Método IA Real',
          currency: 'BRL',
          value: 497,
        });
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: COURSE_PRICE_ID, mode: 'payment' },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL de checkout não recebida');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
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
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden bg-card border-accent/20 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-accent/10 to-accent/5 p-4 sm:p-6 text-center border-b border-border/50">
          <img src={logo} alt="Método IA Real" className="w-[250px] h-auto mx-auto mb-3 opacity-90 object-contain" />
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
            Finalizar Compra
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Acesso imediato ao Método IA Real</p>
        </div>

        <div className="p-4 sm:p-6 space-y-5">
          {/* Product Summary */}
          <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-foreground">Método IA Real</span>
              <div className="text-right">
                <span className="text-sm text-muted-foreground line-through block">R$ 997</span>
                <span className="text-xl font-bold text-foreground">R$ 497</span>
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

          {/* Spots Counter */}
          <div className="flex items-center justify-center gap-2 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-red-400">Apenas 23 vagas restantes com desconto</span>
          </div>

          {checkingAuth ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
            </div>
          ) : !isAuthenticated ? (
            /* Auth Form */
            <div>
              <div className="flex gap-2 mb-4">
                <Button
                  variant={authMode === 'login' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAuthMode('login')}
                  className="flex-1 text-xs"
                >
                  Já tenho conta
                </Button>
                <Button
                  variant={authMode === 'signup' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAuthMode('signup')}
                  className="flex-1 text-xs"
                >
                  Criar conta
                </Button>
              </div>

              <form onSubmit={handleAuth} className="space-y-3">
                {authMode === 'signup' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="checkout-name" className="text-xs">Nome completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="checkout-name"
                        placeholder="Seu nome"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="pl-10 h-10 bg-secondary text-sm"
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
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10 h-10 bg-secondary text-sm"
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
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10 pr-10 h-10 bg-secondary text-sm"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full h-10" disabled={isLoading}>
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
                    Pagar com Cartão — 12x R$41
                    <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="w-full group text-base py-5 border-green-500/30 hover:bg-green-500/10 hover:border-green-500/50 text-foreground"
                onClick={handlePayment}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Banknote className="w-5 h-5 mr-2 text-green-500" />
                    Pagar com PIX — R$447
                    <span className="ml-1 text-xs text-green-500 font-semibold">(10% off)</span>
                  </>
                )}
              </Button>
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
