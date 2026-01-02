import { MembersLayout } from '@/components/members/MembersLayout';
import { FileText, Download, ExternalLink, Sparkles, BookOpen, Video, MessageSquare } from 'lucide-react';

const materials = [
  {
    category: "Biblioteca de Prompts",
    icon: Sparkles,
    items: [
      { title: "Prompts para Textos", description: "50+ prompts para criar textos profissionais", type: "PDF" },
      { title: "Prompts para Conteúdo", description: "Modelos para posts, legendas e artigos", type: "PDF" },
      { title: "Prompts para Negócios", description: "Ofertas, vendas e atendimento", type: "PDF" },
      { title: "Prompts para Produtividade", description: "Organização e planejamento", type: "PDF" },
    ]
  },
  {
    category: "Materiais Complementares",
    icon: BookOpen,
    items: [
      { title: "Guia de Ferramentas de IA", description: "Lista completa de ferramentas recomendadas", type: "PDF" },
      { title: "Checklist do Método", description: "Passo a passo para aplicar o método", type: "PDF" },
      { title: "Templates de Estrutura", description: "Modelos prontos para usar", type: "DOC" },
    ]
  },
];

const MembersMaterials = () => {
  return (
    <MembersLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            Materiais
          </h1>
          <p className="text-muted-foreground">
            Todos os materiais complementares do curso em um só lugar
          </p>
        </div>

        <div className="space-y-8">
          {materials.map((category, index) => (
            <div key={index}>
              <div className="flex items-center gap-2 mb-4">
                <category.icon className="w-5 h-5 text-accent" />
                <h2 className="font-display font-bold text-lg text-foreground">{category.category}</h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {category.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="bg-card rounded-xl p-5 border border-border/50 hover:border-accent/30 hover:shadow-elegant transition-all group cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 bg-accent/10 text-accent text-xs font-medium rounded">
                            {item.type}
                          </span>
                        </div>
                        <h3 className="font-medium text-foreground mb-1 group-hover:text-accent transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                        <Download className="w-5 h-5 text-muted-foreground group-hover:text-accent" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Coming Soon */}
        <div className="mt-12 bg-secondary/50 rounded-2xl p-6 text-center">
          <p className="text-muted-foreground">
            Novos materiais são adicionados regularmente.{' '}
            <span className="text-accent font-medium">Fique atento às atualizações!</span>
          </p>
        </div>
      </div>
    </MembersLayout>
  );
};

export default MembersMaterials;
