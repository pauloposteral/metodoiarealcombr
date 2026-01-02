import { MessageCircle, HelpCircle, Trophy, Lightbulb, Bell } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type CategoryType = 'all' | 'discussoes' | 'duvidas' | 'resultados' | 'sugestoes' | 'avisos';

interface CategoryTabsProps {
  activeCategory: CategoryType;
  onCategoryChange: (category: CategoryType) => void;
}

const categories = [
  { value: 'all', label: 'Todos', icon: null },
  { value: 'discussoes', label: 'Discussões', icon: MessageCircle },
  { value: 'duvidas', label: 'Dúvidas', icon: HelpCircle },
  { value: 'resultados', label: 'Resultados', icon: Trophy },
  { value: 'sugestoes', label: 'Sugestões', icon: Lightbulb },
  { value: 'avisos', label: 'Avisos', icon: Bell },
];

export const CategoryTabs = ({ activeCategory, onCategoryChange }: CategoryTabsProps) => {
  return (
    <Tabs value={activeCategory} onValueChange={(value) => onCategoryChange(value as CategoryType)}>
      <TabsList className="bg-card/50 border border-border/50 p-1 h-auto flex-wrap">
        {categories.map(({ value, label, icon: Icon }) => (
          <TabsTrigger
            key={value}
            value={value}
            className="data-[state=active]:bg-gold data-[state=active]:text-navy-dark gap-1.5 text-sm px-3 py-2"
          >
            {Icon && <Icon className="w-4 h-4" />}
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export const getCategoryInfo = (category: string) => {
  const info: Record<string, { label: string; icon: typeof MessageCircle; color: string }> = {
    discussoes: { label: 'Discussão', icon: MessageCircle, color: 'text-blue-400' },
    duvidas: { label: 'Dúvida', icon: HelpCircle, color: 'text-amber-400' },
    resultados: { label: 'Resultado', icon: Trophy, color: 'text-emerald-400' },
    sugestoes: { label: 'Sugestão', icon: Lightbulb, color: 'text-purple-400' },
    avisos: { label: 'Aviso', icon: Bell, color: 'text-red-400' },
  };
  return info[category] || info.discussoes;
};
