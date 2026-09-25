import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Bell, CheckCircle2, Sparkles, Calendar, ArrowRight } from 'lucide-react';
import { MembersLayout } from '@/components/members/MembersLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDateOnly } from '@/lib/dateOnly';
import { cn } from '@/lib/utils';

interface Update {
  id: string;
  /** AAAA-MM-DD, or "Em breve" for announced features. */
  date: string;
  title: string;
  description: string;
  type: 'new' | 'update' | 'coming';
  link?: string;
}

const updates: Update[] = [
  {
    id: '15',
    date: '2026-09-24',
    title: 'Currículo completo: 13 módulos',
    description: 'O Método IA Real agora tem os 13 módulos completos, do MOD-00 (Comece por aqui) ao MOD-12 (Monetização), organizados em 4 trilhas por perfil (Carreira / CLT, Empreendedor, Criador de conteúdo e Construtor de apps) e na Formação completa. Cada aula mostra o selo "Atualizado em" e passa por revisão a cada 90 dias. Todo módulo termina com um projeto que você entrega pela plataforma, colando o link do resultado. Chegaram também a Biblioteca de prompts, o Glossário e a página Ferramentas e custos. O certificado passa a exigir 75% das aulas da sua trilha e o projeto final do MOD-12 entregue.',
    type: 'new',
    link: '/membros/cursos',
  },
  {
    id: '14',
    date: '2026-09-24',
    title: 'Descubra a sua trilha',
    description: 'Responda ao quiz e veja a trilha que combina com o seu objetivo: Carreira / CLT, Empreendedor, Criador de conteúdo, Construtor de apps ou Formação completa. Dá para trocar de trilha quando quiser.',
    type: 'new',
    link: '/membros/trilha',
  },
  {
    id: '13',
    date: '2026-09-24',
    title: 'Biblioteca de prompts',
    description: 'Todos os prompts das aulas liberadas para você em um só lugar, com busca sem precisar de acento, filtro por módulo e pela sua trilha, botão de copiar e link para a aula de origem.',
    type: 'new',
    link: '/membros/prompts',
  },
  {
    id: '12',
    date: '2026-09-24',
    title: 'Glossário de IA',
    description: 'Todo jargão do curso explicado em linguagem simples, com exemplo, termo em inglês, módulo onde é ensinado e termos relacionados, além de índice de A a Z. Os termos também aparecem na busca (⌘K).',
    type: 'new',
    link: '/membros/glossario',
  },
  {
    id: '11',
    date: '2026-09-24',
    title: 'Ferramentas e custos',
    description: 'A planilha viva das ferramentas usadas no curso: o que o plano grátis oferece, planos com preço de referência em reais, alternativa gratuita e data da última conferência, com filtro por categoria e por módulo. As ferramentas também aparecem na busca (⌘K).',
    type: 'new',
    link: '/membros/ferramentas',
  },
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

const TYPE_BADGES: Record<Update['type'], { label: string; className: string }> = {
  new: { label: 'Novo', className: 'bg-green-500/15 text-green-800 dark:text-green-400' },
  update: { label: 'Atualização', className: 'bg-blue-500/15 text-blue-800 dark:text-blue-400' },
  coming: { label: 'Em breve', className: 'bg-gold/20 text-amber-800 dark:text-gold' },
};

function UpdateDate({ value }: { value: string }) {
  const formatted = formatDateOnly(value);
  return (
    <span className="text-xs text-muted-foreground">
      {formatted ? <time dateTime={value}>{formatted}</time> : value}
    </span>
  );
}

/** Keeps "MOD-00" style codes on one line in narrow cards. */
function KeepCodesTogether({ text }: { text: string }) {
  return (
    <>
      {text.split(/(MOD-\d{2})/).map((part, index) => (index % 2 === 1 ? <span key={index} className="whitespace-nowrap">{part}</span> : part))}
    </>
  );
}

function UpdateCard({ update }: { update: Update }) {
  const badge = TYPE_BADGES[update.type];
  return (
    <Card
      className={cn(
        'relative border-border/50 bg-card/50 transition-all hover:border-gold/30',
        update.link && 'focus-within:ring-2 focus-within:ring-ring',
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className={cn('hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl sm:flex', update.type === 'coming' ? 'bg-gold/10' : 'bg-green-500/10')}>
            {update.type === 'coming'
              ? <Calendar className="h-5 w-5 text-gold" aria-hidden="true" />
              : <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" aria-hidden="true" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge className={cn('border-0', badge.className)}>{badge.label}</Badge>
              <UpdateDate value={update.date} />
            </div>
            <h2 className="mb-1 font-semibold text-foreground">
              {update.link ? (
                // The stretched link makes the whole card clickable while keeping one real, focusable link.
                <Link to={update.link} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
                  {update.title}
                </Link>
              ) : update.title}
            </h2>
            <p className="text-sm text-muted-foreground"><KeepCodesTogether text={update.description} /></p>
          </div>
          {update.link && <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-gold" aria-hidden="true" />}
        </div>
      </CardContent>
    </Card>
  );
}

const MembersUpdates = () => (
  <MembersLayout>
    <Helmet>
      <title>Atualizações | Método IA Real</title>
    </Helmet>
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2 text-amber-800 dark:text-gold">
          <Bell className="h-5 w-5" aria-hidden="true" />
          <span className="text-sm font-medium">Novidades da Plataforma</span>
        </div>
        <h1 className="mb-2 font-display text-2xl font-bold text-foreground md:text-3xl">
          Atualizações
        </h1>
        <p className="text-muted-foreground">
          Fique por dentro de todas as novidades, melhorias e novos conteúdos do curso
        </p>
      </div>

      {/* Info Card */}
      <Card className="mb-8 border-gold/30 bg-gradient-to-r from-gold/10 via-gold/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-gold/20 p-3">
              <Sparkles className="h-6 w-6 text-gold" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 className="mb-1 font-semibold text-foreground">
                Acesso Vitalício a Todas as Atualizações
              </h2>
              <p className="text-sm text-muted-foreground">
                Seu acesso inclui todas as atualizações futuras do curso. Novas aulas, materiais e
                ferramentas são adicionados regularmente sem custo adicional.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Updates List */}
      <ol className="space-y-4" aria-label="Histórico de atualizações">
        {updates.map((update) => (
          <li key={update.id}>
            <UpdateCard update={update} />
          </li>
        ))}
      </ol>

      {/* Subscribe Box */}
      <div className="mt-10 rounded-2xl bg-secondary/50 p-6 text-center">
        <Bell className="mx-auto mb-3 h-10 w-10 text-accent" aria-hidden="true" />
        <h2 className="mb-2 font-display text-lg font-bold text-foreground">
          Não perca nenhuma atualização
        </h2>
        <p className="text-sm text-muted-foreground">
          Acesse essa página regularmente para conferir as novidades ou
          entre na comunidade para receber avisos em primeira mão.
        </p>
      </div>
    </div>
  </MembersLayout>
);

export default MembersUpdates;
