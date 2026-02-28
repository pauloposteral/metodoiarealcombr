import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookmarkPlus } from 'lucide-react';
import { toast } from 'sonner';
import type { CarouselSlide, CarouselTheme, CarouselConfig } from './types';

interface SaveAsTemplateDialogProps {
  slides: CarouselSlide[];
  theme: CarouselTheme;
  config: CarouselConfig | null;
  topic: string;
}

const CATEGORIES = [
  { value: 'custom', label: 'Personalizado' },
  { value: 'educacional', label: 'Educacional' },
  { value: 'viral', label: 'Viral' },
  { value: 'vendas', label: 'Vendas' },
  { value: 'autoridade', label: 'Autoridade' },
  { value: 'storytelling', label: 'Storytelling' },
];

export const SaveAsTemplateDialog = ({ slides, theme, config, topic }: SaveAsTemplateDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('custom');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || slides.length === 0) {
      toast.error('Dê um nome ao template');
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error('Faça login'); return; }

      const { error } = await supabase.from('carousel_templates').insert({
        user_id: user.id,
        name: name.trim(),
        category,
        slides: slides as any,
        theme: theme as any,
        config: config as any,
      });

      if (error) throw error;
      toast.success('Template salvo!');
      setIsOpen(false);
      setName('');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar template');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <BookmarkPlus className="w-3.5 h-3.5" />
          Salvar Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Salvar como Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Nome do template"
            value={name}
            onChange={(e) => setName(e.target.value)}
            defaultValue={topic}
          />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
