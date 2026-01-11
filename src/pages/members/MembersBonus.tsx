import { useNavigate } from 'react-router-dom';
import { MembersLayout } from '@/components/members/MembersLayout';
import { Gift, Play, Lock, CheckCircle2, FileText, ArrowRight } from 'lucide-react';

const bonusContent = [
  {
    title: "Biblioteca de Prompts Prontos",
    description: "Mais de 100 prompts testados e validados para diferentes situações",
    available: true,
    type: "Material"
  },
  {
    title: "Como Estudar com IA",
    description: "Aprenda a usar IA para acelerar seu aprendizado em qualquer área",
    available: true,
    type: "Aula Bônus"
  },
  {
    title: "Como Ensinar com IA",
    description: "Técnicas para usar IA na criação de conteúdo educacional",
    available: true,
    type: "Aula Bônus"
  },
  {
    title: "Atualizações Futuras",
    description: "Acesso vitalício a todas as novas aulas e materiais",
    available: true,
    type: "Incluído"
  },
];

const MembersBonus = () => {
  const navigate = useNavigate();

  const handleBonusClick = (bonus: typeof bonusContent[0]) => {
    if (bonus.title === "Biblioteca de Prompts Prontos") {
      navigate('/membros/materiais');
    }
  };

  return (
    <MembersLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-gold mb-2">
            <Gift className="w-5 h-5" />
            <span className="text-sm font-medium">Conteúdo Exclusivo</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            Bônus
          </h1>
          <p className="text-muted-foreground">
            Materiais e recursos extras incluídos no seu acesso para acelerar seu aprendizado
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {bonusContent.map((bonus, index) => (
            <div
              key={index}
              onClick={() => handleBonusClick(bonus)}
              className="bg-card rounded-2xl p-6 border border-border/50 hover:border-gold/30 hover:shadow-elegant transition-all group cursor-pointer relative overflow-hidden"
            >
              {/* Badge */}
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 bg-gold/10 text-gold text-xs font-bold rounded-full">
                  {bonus.type}
                </span>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/20 transition-colors">
                  {bonus.available ? (
                    <CheckCircle2 className="w-6 h-6 text-gold" />
                  ) : (
                    <Lock className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1 pt-1">
                  <h3 className="font-display font-bold text-lg text-foreground mb-2 group-hover:text-gold transition-colors">
                    {bonus.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {bonus.description}
                  </p>
                </div>
              </div>

              {bonus.available && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  {bonus.type === "Material" ? (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/membros/materiais');
                      }}
                      className="flex items-center gap-2 text-accent text-sm font-medium hover:text-accent/80 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      Acessar materiais
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ) : bonus.type === "Aula Bônus" ? (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/membros/modulos');
                      }}
                      className="flex items-center gap-2 text-accent text-sm font-medium hover:text-accent/80 transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      Ver aulas do curso
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="flex items-center gap-2 text-green-500 text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      Incluído no seu acesso
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Info box */}
        <div className="mt-8 bg-gold/5 border border-gold/20 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <Gift className="w-6 h-6 text-gold flex-shrink-0" />
            <div>
              <h3 className="font-display font-bold text-foreground mb-1">
                Acesso Vitalício
              </h3>
              <p className="text-sm text-muted-foreground">
                Todos os bônus e atualizações futuras estão incluídos no seu acesso. 
                Você não precisa pagar nada a mais para acessar novos conteúdos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MembersLayout>
  );
};

export default MembersBonus;
