import { useOutletContext } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  PenTool, 
  BookOpen, 
  ArrowRight, 
  Sparkles,
  TrendingUp,
  Clock,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollReveal } from '@/components/ScrollReveal';

interface ContextType {
  user: any;
  companyData: {
    role: string;
    company: {
      id: string;
      name: string;
      plan: string;
    };
  };
}

const quickActions = [
  {
    icon: FileText,
    title: 'Central de Prompts',
    description: 'Explore prompts organizados por categoria',
    href: '/metodo/app/prompts',
    color: 'text-blue-500 bg-blue-500/10'
  },
  {
    icon: PenTool,
    title: 'Editor de Conteúdo',
    description: 'Crie posts e carrosséis rapidamente',
    href: '/metodo/app/editor',
    color: 'text-purple-500 bg-purple-500/10'
  },
  {
    icon: BookOpen,
    title: 'Treinamento',
    description: 'Aprenda a usar a plataforma',
    href: '/metodo/app/treinamento',
    color: 'text-green-500 bg-green-500/10'
  }
];

const stats = [
  { icon: FileText, label: 'Prompts disponíveis', value: '50+' },
  { icon: TrendingUp, label: 'Economia de tempo', value: '10h/sem' },
  { icon: Target, label: 'Categorias', value: '5' }
];

export default function MetodoDashboard() {
  const { user, companyData } = useOutletContext<ContextType>();
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Usuário';

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome */}
      <ScrollReveal>
        <div className="bg-gradient-to-br from-navy-dark to-navy rounded-2xl p-6 md:p-8 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">
                Olá, {firstName}! 👋
              </h1>
              <p className="text-white/70 max-w-lg">
                Bem-vindo ao Método IA. Use as ferramentas abaixo para produzir mais 
                e economizar tempo todos os dias.
              </p>
            </div>
            <div className="hidden md:flex w-16 h-16 bg-white/10 rounded-2xl items-center justify-center">
              <Sparkles className="w-8 h-8" />
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Quick Actions */}
      <div>
        <h2 className="font-display text-lg font-semibold text-foreground mb-4">
          Acesso rápido
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <ScrollReveal key={action.href} delay={index * 100}>
              <Link to={action.href}>
                <Card className="h-full hover:border-accent/50 transition-colors cursor-pointer group">
                  <CardHeader className="pb-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${action.color}`}>
                      <action.icon className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-base group-hover:text-accent transition-colors">
                      {action.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {action.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <span className="text-sm text-accent font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      Acessar <ArrowRight className="w-4 h-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Stats */}
      <ScrollReveal delay={300}>
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="text-center">
              <CardContent className="pt-6">
                <stat.icon className="w-6 h-6 text-accent mx-auto mb-2" />
                <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollReveal>

      {/* Tips */}
      <ScrollReveal delay={400}>
        <Card className="bg-accent/5 border-accent/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground mb-1">
                  Dica do dia
                </h3>
                <p className="text-sm text-muted-foreground">
                  Comece pela Central de Prompts. Escolha um prompt de marketing, 
                  personalize com os dados da sua empresa e copie o resultado. 
                  Em 30 segundos você tem conteúdo pronto!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>
    </div>
  );
}
