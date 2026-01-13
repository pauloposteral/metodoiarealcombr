import { Button } from '@/components/ui/button';
import { ScrollReveal } from '@/components/ScrollReveal';
import { Clock, Sparkles, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export default function MetodoAcessoPendente() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/metodo');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <ScrollReveal>
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-8 h-8 text-amber-500" />
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-accent to-gold rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">Método IA</span>
          </div>

          <h1 className="font-display text-2xl font-bold text-foreground mb-4">
            Acesso pendente
          </h1>
          
          <p className="text-muted-foreground mb-6">
            Sua empresa está aguardando aprovação. Estamos analisando sua solicitação 
            e você receberá um email assim que o acesso for liberado.
          </p>

          <div className="bg-muted/50 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-3 text-left">
              <Mail className="w-5 h-5 text-accent shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-foreground">Fique tranquilo</p>
                <p className="text-muted-foreground">
                  Normalmente liberamos o acesso em até 24 horas úteis.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button variant="outline" onClick={handleLogout}>
              Sair da conta
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/metodo">Voltar para o site</Link>
            </Button>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
