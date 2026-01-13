import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres')
});

type AuthMode = 'login' | 'reset';

export default function MetodoLogin() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: `${window.location.origin}/metodo/app`
        });
        if (error) throw error;
        toast.success('Email de recuperação enviado! Verifique sua caixa de entrada.');
        setMode('login');
      } else {
        // Validate input
        const validation = loginSchema.safeParse(formData);
        if (!validation.success) {
          toast.error(validation.error.errors[0].message);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Email ou senha incorretos');
          } else {
            toast.error(error.message);
          }
          setLoading(false);
          return;
        }

        // Check if user has active company access
        const { data: companyUser } = await supabase
          .from('company_users')
          .select('company_id, role, companies(status)')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (!companyUser) {
          await supabase.auth.signOut();
          toast.error('Você não tem acesso a nenhuma empresa. Solicite acesso primeiro.');
          setLoading(false);
          return;
        }

        toast.success('Login realizado com sucesso!');
        navigate('/metodo/app');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error('Erro ao processar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Link to="/metodo" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>

          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-accent to-gold rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">Método IA</span>
          </div>

          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            {mode === 'login' ? 'Entrar na plataforma' : 'Recuperar senha'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {mode === 'login' 
              ? 'Acesse sua conta para usar as ferramentas.' 
              : 'Digite seu email para receber o link de recuperação.'
            }
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="seu@email.com"
                required
              />
            </div>

            {mode === 'login' && (
              <div>
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    required
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
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {mode === 'login' ? 'Entrando...' : 'Enviando...'}
                </>
              ) : (
                mode === 'login' ? 'Entrar' : 'Enviar link'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            {mode === 'login' ? (
              <>
                <button
                  type="button"
                  onClick={() => setMode('reset')}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Esqueceu a senha?
                </button>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Não tem acesso?{' '}
                    <Link to="/metodo/solicitar" className="text-accent hover:underline">
                      Solicitar acesso
                    </Link>
                  </p>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Voltar para o login
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right side - Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-navy-dark to-navy items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            IA que funciona na prática
          </h2>
          <p className="text-white/70">
            Prompts testados, fluxos organizados e ferramentas prontas 
            para sua equipe produzir mais todos os dias.
          </p>
        </div>
      </div>
    </div>
  );
}
