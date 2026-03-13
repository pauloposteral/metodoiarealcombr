import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Search, CheckCircle2, XCircle, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import logoImage from '@/assets/logo-iareal.png';

interface Certificate {
  certificate_code: string;
  student_name: string;
  course_name: string;
  total_hours: number;
  completed_at: string;
}

const ValidateCertificate = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [searched, setSearched] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setSearched(true);
    setNotFound(false);
    setCertificate(null);

    try {
      // Use secure RPC function that only exposes necessary fields
      const { data, error } = await supabase
        .rpc('validate_certificate', { cert_code: code.trim().toUpperCase() });

      if (error) throw error;

      // The RPC returns an array, get the first result
      const result = Array.isArray(data) ? data[0] : data;

      if (result) {
        setCertificate(result);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error('Error validating certificate:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-dark to-navy">
      {/* Header */}
      <header className="border-b border-border/30 bg-navy-dark/50 backdrop-blur-sm">
        <div className="container py-4">
          <Link to="/" className="flex items-center gap-2 w-fit">
            <img src={logoImage} alt="Método IA Real" className="w-[250px] h-auto object-contain" />
          </Link>
        </div>
      </header>

      <main className="container py-12">
        <div className="max-w-2xl mx-auto">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-gold/20 mb-4">
              <Shield className="w-8 h-8 text-gold" />
            </div>
            <h1 className="text-3xl font-bold text-primary-foreground mb-2">
              Validar Certificado
            </h1>
            <p className="text-muted-foreground">
              Verifique a autenticidade de um certificado do curso Método IA Real
            </p>
          </div>

          {/* Search Form */}
          <Card className="bg-card/50 border-border/50 mb-8">
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="flex gap-3">
                <Input
                  type="text"
                  placeholder="Digite o código do certificado (ex: IAR-XXXXX-XXXX)"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="flex-1 bg-background/50 border-border/50"
                />
                <Button 
                  type="submit" 
                  disabled={loading || !code.trim()}
                  className="bg-gold hover:bg-gold/90 text-navy-dark gap-2"
                >
                  <Search className="w-4 h-4" />
                  {loading ? 'Buscando...' : 'Validar'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Result */}
          {searched && (
            <>
              {certificate ? (
                <Card className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-emerald-500/10 border-emerald-500/30">
                  <CardContent className="p-8">
                    <div className="text-center mb-6">
                      <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                      <h2 className="text-2xl font-bold text-emerald-500 mb-2">
                        Certificado Válido
                      </h2>
                      <p className="text-muted-foreground">
                        Este certificado é autêntico e foi emitido pelo Método IA Real
                      </p>
                    </div>

                    <div className="bg-card/50 rounded-lg p-6 space-y-4">
                      <div className="flex items-center gap-4">
                        <Award className="w-12 h-12 text-gold" />
                        <div>
                          <p className="text-sm text-muted-foreground">Aluno</p>
                          <p className="text-xl font-semibold text-primary-foreground">
                            {certificate.student_name}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border/30">
                        <div>
                          <p className="text-sm text-muted-foreground">Curso</p>
                          <p className="font-medium text-primary-foreground">
                            {certificate.course_name}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Carga Horária</p>
                          <p className="font-medium text-primary-foreground">
                            {certificate.total_hours} horas
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Data de Conclusão</p>
                          <p className="font-medium text-primary-foreground">
                            {new Date(certificate.completed_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border/30">
                        <p className="text-sm text-muted-foreground">Código de Validação</p>
                        <p className="font-mono font-medium text-primary-foreground">
                          {certificate.certificate_code}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : notFound ? (
                <Card className="bg-gradient-to-r from-red-500/10 via-red-500/5 to-red-500/10 border-red-500/30">
                  <CardContent className="p-8 text-center">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-red-500 mb-2">
                      Certificado Não Encontrado
                    </h2>
                    <p className="text-muted-foreground">
                      Não foi possível encontrar um certificado com este código. 
                      Verifique se o código foi digitado corretamente.
                    </p>
                  </CardContent>
                </Card>
              ) : null}
            </>
          )}

          {/* Info */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              O código de validação está localizado no rodapé do certificado.
            </p>
            <p className="mt-2">
              Em caso de dúvidas, entre em contato pelo suporte.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ValidateCertificate;
