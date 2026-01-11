import { useNavigate } from 'react-router-dom';
import { MembersLayout } from '@/components/members/MembersLayout';
import { HelpCircle, MessageCircle, Mail, FileQuestion, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const faqItems = [
  {
    question: "Como acesso minhas aulas?",
    answer: "Clique em 'Módulos' no menu lateral e selecione o módulo desejado. As aulas estão organizadas em ordem progressiva."
  },
  {
    question: "Posso assistir as aulas no celular?",
    answer: "Sim! A plataforma é 100% responsiva e funciona perfeitamente em qualquer dispositivo."
  },
  {
    question: "Por quanto tempo tenho acesso?",
    answer: "Seu acesso é vitalício. Você pode assistir às aulas quantas vezes quiser, para sempre."
  },
  {
    question: "Como faço para baixar os materiais?",
    answer: "Acesse a seção 'Materiais' no menu e clique no botão de download ao lado de cada arquivo."
  },
];

const MembersSupport = () => {
  const navigate = useNavigate();

  return (
    <MembersLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            Suporte
          </h1>
          <p className="text-muted-foreground">
            Estamos aqui para ajudar você em sua jornada
          </p>
        </div>

        {/* Contact Options */}
        <div className="grid sm:grid-cols-2 gap-6 mb-10">
          <div className="bg-card rounded-2xl p-6 border border-border/50">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-display font-bold text-lg text-foreground mb-2">
              Email
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Envie sua dúvida e responderemos em até 24 horas
            </p>
            <a 
              href="mailto:suporte@metodoiareal.com.br"
              className="text-accent hover:text-accent/80 text-sm font-medium flex items-center gap-1"
            >
              suporte@metodoiareal.com.br
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border/50">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="font-display font-bold text-lg text-foreground mb-2">
              Comunidade
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Participe do grupo exclusivo de alunos e tire suas dúvidas
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-green-500 border-green-500/30 hover:bg-green-500/10"
              onClick={() => navigate('/membros/comunidade')}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Acessar comunidade
            </Button>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <FileQuestion className="w-5 h-5 text-accent" />
            <h2 className="font-display font-bold text-xl text-foreground">Perguntas Frequentes</h2>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-card rounded-xl p-5 border border-border/50">
                <h3 className="font-medium text-foreground mb-2">{item.question}</h3>
                <p className="text-sm text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Help Box */}
        <div className="mt-10 bg-secondary/50 rounded-2xl p-6 text-center">
          <HelpCircle className="w-10 h-10 text-accent mx-auto mb-3" />
          <h3 className="font-display font-bold text-lg text-foreground mb-2">
            Não encontrou o que procura?
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            Entre em contato conosco que teremos prazer em ajudar
          </p>
          <Button className="bg-accent hover:bg-accent/90">
            <Mail className="w-4 h-4 mr-2" />
            Enviar mensagem
          </Button>
        </div>
      </div>
    </MembersLayout>
  );
};

export default MembersSupport;
