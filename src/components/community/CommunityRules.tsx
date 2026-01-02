import { Shield, Users, Target, Ban, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const rules = [
  {
    icon: Heart,
    title: 'Respeito entre membros',
    description: 'Trate todos com cordialidade e empatia. Somos uma comunidade de aprendizado.'
  },
  {
    icon: Target,
    title: 'Foco em aprendizado prático',
    description: 'Compartilhe experiências, dúvidas e resultados relacionados ao uso de IA.'
  },
  {
    icon: Ban,
    title: 'Nada de spam',
    description: 'Evite mensagens repetitivas ou conteúdo irrelevante para a comunidade.'
  },
  {
    icon: Users,
    title: 'Autopromoção com contexto',
    description: 'Compartilhar projetos é bem-vindo, desde que agregue valor à discussão.'
  }
];

export const CommunityRules = () => {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="w-5 h-5 text-gold" />
          Regras da Comunidade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rules.map((rule, index) => (
          <div key={index} className="flex items-start gap-3">
            <rule.icon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-primary-foreground">{rule.title}</p>
              <p className="text-xs text-muted-foreground">{rule.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
