import { MembersLayout } from '@/components/members/MembersLayout';
import { Bell, CheckCircle2, Sparkles, Calendar, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Update {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'new' | 'update' | 'coming';
  link?: string;
}

const updates: Update[] = [
  {
    id: '10',
    date: '2026-03-13',
    title: 'Painel de Analytics Completo',
    description: 'Novo dashboard de progresso com gráficos de atividade semanal/mensal, progresso por módulo e tracking de tempo de estudo.',
    type: 'new',
    link: '/membros/analytics'
  },
  {
    id: '9',
    date: '2026-03-12',
    title: 'Sistema de Conquistas Automáticas',
    description: '11 conquistas desbloqueáveis automaticamente conforme você progride no curso. Receba notificações ao alcançar marcos!',
    type: 'new',
    link: '/membros/ranking'
  },
  {
    id: '8',
    date: '2026-03-11',
    title: 'Busca Global (⌘K)',
    description: 'Busque aulas, módulos, cursos e posts da comunidade usando o atalho ⌘K ou a barra de busca no topo.',
    type: 'new',
  },
  {
    id: '7',
    date: '2026-03-10',
    title: 'Preferências de Notificação',
    description: 'Controle quais notificações você recebe na página do seu perfil: lembretes de aula, comunidade, conquistas e resumo semanal.',
    type: 'new',
    link: '/membros/perfil'
  },
  {
    id: '6',
    date: '2026-03-08',
    title: 'Exportação de Dados (Admin)',
    description: 'Administradores podem exportar dados de leads, empresas, vendas, progresso e certificados em CSV.',
    type: 'update',
  },
  {
    id: '5',
    date: '2026-03-05',
    title: 'Editor de Carrosséis com IA',
    description: 'Nova ferramenta para criar carrosséis do Instagram usando inteligência artificial. Gere slides profissionais em segundos.',
    type: 'new',
    link: '/carrossel'
  },
  {
    id: '4',
    date: '2026-03-03',
    title: 'Comunidade de Alunos',
    description: 'Troque experiências, tire dúvidas e compartilhe resultados com outros alunos. Agora com busca integrada!',
    type: 'new',
    link: '/membros/comunidade'
  },
  {
    id: '3',
    date: '2026-03-01',
    title: 'Sistema de Certificado',
    description: 'Complete 100% do curso e gere seu certificado de conclusão automático com código de validação.',
    type: 'new',
    link: '/membros/certificado'
  },
  {
    id: '2',
    date: 'Em breve',
    title: 'Notificações por Email',
    description: 'Receba lembretes de estudo e novidades diretamente no seu email conforme suas preferências.',
    type: 'coming'
  },
  {
    id: '1',
    date: 'Em breve',
    title: 'Aulas em Vídeo',
    description: 'Em breve todas as aulas terão vídeos complementares para enriquecer seu aprendizado.',
    type: 'coming'
  }
];

const getTypeBadge = (type: Update['type']) => {
  switch (type) {
    case 'new':
      return <Badge className="bg-green-500/20 text-green-400 border-0">Novo</Badge>;
    case 'update':
      return <Badge className="bg-blue-500/20 text-blue-400 border-0">Atualização</Badge>;
    case 'coming':
      return <Badge className="bg-gold/20 text-gold border-0">Em breve</Badge>;
  }
};

const MembersUpdates = () => {
  const navigate = useNavigate();

  const formatDate = (dateStr: string) => {
    if (dateStr === 'Em breve') return dateStr;
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <MembersLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-gold mb-2">
            <Bell className="w-5 h-5" />
            <span className="text-sm font-medium">Novidades da Plataforma</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            Atualizações
          </h1>
          <p className="text-muted-foreground">
            Fique por dentro de todas as novidades, melhorias e novos conteúdos do curso
          </p>
        </div>

        {/* Info Card */}
        <Card className="bg-gradient-to-r from-gold/10 via-gold/5 to-transparent border-gold/30 mb-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-gold/20">
                <Sparkles className="w-6 h-6 text-gold" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  Acesso Vitalício a Todas as Atualizações
                </h3>
                <p className="text-sm text-muted-foreground">
                  Seu acesso inclui todas as atualizações futuras do curso. Novas aulas, materiais e 
                  ferramentas são adicionados regularmente sem custo adicional.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Updates List */}
        <div className="space-y-4">
          {updates.map((update) => (
            <Card 
              key={update.id} 
              className={`bg-card/50 border-border/50 transition-all hover:border-gold/30 ${
                update.link ? 'cursor-pointer' : ''
              }`}
              onClick={() => update.link && navigate(update.link)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      update.type === 'coming' ? 'bg-gold/10' : 'bg-green-500/10'
                    }`}>
                      {update.type === 'coming' ? (
                        <Calendar className="w-5 h-5 text-gold" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeBadge(update.type)}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(update.date)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {update.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {update.description}
                      </p>
                    </div>
                  </div>
                  {update.link && (
                    <Button variant="ghost" size="icon" className="flex-shrink-0">
                      <ArrowRight className="w-4 h-4 text-gold" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Subscribe Box */}
        <div className="mt-10 bg-secondary/50 rounded-2xl p-6 text-center">
          <Bell className="w-10 h-10 text-accent mx-auto mb-3" />
          <h3 className="font-display font-bold text-lg text-foreground mb-2">
            Não perca nenhuma atualização
          </h3>
          <p className="text-muted-foreground text-sm">
            Acesse essa página regularmente para conferir as novidades ou 
            entre na comunidade para receber avisos em primeira mão.
          </p>
        </div>
      </div>
    </MembersLayout>
  );
};

export default MembersUpdates;