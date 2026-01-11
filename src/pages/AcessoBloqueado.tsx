import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Mail, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AcessoBloqueado = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <Card className="max-w-lg w-full text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Acesso Temporariamente Bloqueado</CardTitle>
          <CardDescription className="text-base">
            Seu acesso à área de membros está temporariamente indisponível.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4 text-left space-y-2">
            <p className="text-sm text-muted-foreground">
              Isso pode acontecer por alguns motivos:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Pagamento ainda não confirmado</li>
              <li>Solicitação de reembolso processada</li>
              <li>Problema com o processamento do pagamento</li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Se você acredita que isso é um erro, entre em contato com nosso suporte:
            </p>
            
            <a 
              href="mailto:contato@metodoiareal.com.br"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <Mail className="w-4 h-4" />
              contato@metodoiareal.com.br
            </a>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleRefresh}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Verificar novamente
            </Button>
            <Button 
              variant="default"
              className="flex-1"
              onClick={handleLogout}
            >
              Sair da conta
            </Button>
          </div>

          <p className="text-xs text-muted-foreground pt-2">
            Se você acabou de realizar a compra, aguarde alguns minutos e tente novamente.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcessoBloqueado;
