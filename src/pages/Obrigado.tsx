import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Mail, PlayCircle, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo-iareal.png';
import { Helmet } from 'react-helmet-async';

const Obrigado = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Facebook Pixel - Purchase Event
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Purchase', {
        content_name: 'Método IA Real',
        content_category: 'Curso Online',
        currency: 'BRL',
      });
    }
    
    // Google Analytics - Conversion Event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'purchase', {
        transaction_id: Date.now().toString(),
        items: [{
          item_name: 'Método IA Real',
          item_category: 'Curso Online',
        }]
      });
    }
  }, []);

  const nextSteps = [
    {
      icon: Mail,
      title: 'Verifique seu e-mail',
      description: 'Enviamos os dados de acesso para o e-mail cadastrado na compra.',
    },
    {
      icon: PlayCircle,
      title: 'Acesse o curso',
      description: 'Clique no link do e-mail ou faça login na área de membros.',
    },
    {
      icon: Users,
      title: 'Entre na comunidade',
      description: 'Conecte-se com outros alunos e tire suas dúvidas.',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Obrigado! | Método IA Real</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-b from-navy-dark to-navy flex items-center justify-center px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Logo */}
          <img 
            src={logo} 
            alt="Método IA Real" 
            className="h-12 md:h-16 lg:h-20 mx-auto mb-8 w-auto min-w-[160px] md:min-w-[200px] object-contain"
          />

          {/* Success Icon */}
          <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-accent" />
          </div>

          {/* Title */}
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
            Parabéns! Você está dentro! 🎉
          </h1>

          <p className="text-xl text-primary-foreground/80 mb-8 max-w-lg mx-auto">
            Sua inscrição no <strong className="text-gold-light">Método IA Real</strong> foi confirmada. 
            Agora é hora de começar sua jornada.
          </p>

          {/* Next Steps */}
          <div className="bg-primary-foreground/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 mb-8 border border-primary-foreground/10">
            <h2 className="text-lg font-semibold text-primary-foreground mb-6">
              Próximos passos:
            </h2>
            <div className="space-y-4">
              {nextSteps.map((step, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-4 text-left p-4 bg-primary-foreground/5 rounded-xl"
                >
                  <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-foreground mb-1">
                      {index + 1}. {step.title}
                    </h3>
                    <p className="text-sm text-primary-foreground/70">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="hero" size="lg" className="group">
              <Link to="/auth">
                Acessar Área de Membros
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/">
                Voltar para o início
              </Link>
            </Button>
          </div>

          {/* Support */}
          <p className="text-primary-foreground/50 text-sm mt-8">
            Dúvidas? Entre em contato pelo suporte dentro da área de membros.
          </p>
        </div>
      </div>
    </>
  );
};

export default Obrigado;
