import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollReveal } from '@/components/ScrollReveal';
import { Sparkles, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function MetodoSolicitar() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    employees_count: '',
    industry: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('company_leads')
        .insert({
          company_name: formData.company_name,
          contact_name: formData.contact_name,
          email: formData.email,
          phone: formData.phone || null,
          employees_count: formData.employees_count || null,
          industry: formData.industry || null,
          message: formData.message || null,
          status: 'pending'
        });

      if (error) throw error;

      setSubmitted(true);
      toast.success('Solicitação enviada com sucesso!');
    } catch (error) {
      console.error('Error submitting lead:', error);
      toast.error('Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <ScrollReveal>
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-accent" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-4">
              Solicitação recebida!
            </h1>
            <p className="text-muted-foreground mb-8">
              Analisaremos sua solicitação e entraremos em contato em até 24 horas 
              com as instruções de acesso.
            </p>
            <Button asChild>
              <Link to="/metodo">Voltar para o início</Link>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link to="/metodo" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-accent to-gold rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">Método IA</span>
          </Link>
        </div>
      </header>

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            <ScrollReveal>
              <Link 
                to="/metodo" 
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Link>

              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                Solicitar acesso
              </h1>
              <p className="text-muted-foreground mb-8">
                Preencha os dados da sua empresa. Analisaremos e liberaremos seu acesso em até 24h.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="company_name">Nome da empresa *</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      placeholder="Ex: Minha Empresa Ltda"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="contact_name">Seu nome *</Label>
                    <Input
                      id="contact_name"
                      value={formData.contact_name}
                      onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                      placeholder="Ex: João Silva"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email corporativo *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Ex: joao@empresa.com.br"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">WhatsApp</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Ex: (11) 99999-9999"
                    />
                  </div>

                  <div>
                    <Label htmlFor="employees_count">Tamanho da equipe</Label>
                    <Select 
                      value={formData.employees_count} 
                      onValueChange={(value) => setFormData({ ...formData, employees_count: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-3">1 a 3 pessoas</SelectItem>
                        <SelectItem value="4-10">4 a 10 pessoas</SelectItem>
                        <SelectItem value="11-30">11 a 30 pessoas</SelectItem>
                        <SelectItem value="31-100">31 a 100 pessoas</SelectItem>
                        <SelectItem value="100+">Mais de 100 pessoas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="industry">Segmento</Label>
                    <Select 
                      value={formData.industry} 
                      onValueChange={(value) => setFormData({ ...formData, industry: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agencia">Agência de Marketing</SelectItem>
                        <SelectItem value="ecommerce">E-commerce</SelectItem>
                        <SelectItem value="servicos">Prestação de Serviços</SelectItem>
                        <SelectItem value="varejo">Varejo</SelectItem>
                        <SelectItem value="saude">Saúde</SelectItem>
                        <SelectItem value="educacao">Educação</SelectItem>
                        <SelectItem value="tecnologia">Tecnologia</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message">Como pretende usar o Método IA?</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Conte um pouco sobre seus objetivos..."
                      rows={4}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar solicitação'
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Ao enviar, você concorda com nossos{' '}
                  <Link to="/termos" className="underline hover:text-foreground">termos de uso</Link>
                  {' '}e{' '}
                  <Link to="/privacidade" className="underline hover:text-foreground">política de privacidade</Link>.
                </p>
              </form>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
