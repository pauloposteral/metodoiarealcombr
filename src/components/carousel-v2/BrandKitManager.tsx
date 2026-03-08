import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Palette, Plus, Trash2, Star, Upload, Check } from 'lucide-react';
import { toast } from 'sonner';
import { GOOGLE_FONTS } from './types';

export interface BrandKit {
  id: string;
  user_id: string;
  name: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  font_title: string;
  font_body: string;
  logo_url: string | null;
  is_default: boolean;
}

interface BrandKitManagerProps {
  onApplyBrandKit?: (kit: BrandKit) => void;
  compact?: boolean;
}

export const BrandKitManager = ({ onApplyBrandKit, compact }: BrandKitManagerProps) => {
  const [kits, setKits] = useState<BrandKit[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingKit, setEditingKit] = useState<Partial<BrandKit>>({
    name: 'Meu Brand Kit',
    primary_color: '#6366f1',
    secondary_color: '#f59e0b',
    accent_color: '#10b981',
    background_color: '#0f172a',
    text_color: '#ffffff',
    font_title: 'Plus Jakarta Sans',
    font_body: 'Inter',
  });

  useEffect(() => {
    loadKits();
  }, []);

  const loadKits = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('brand_kits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setKits(data as unknown as BrandKit[]);
  };

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error('Faça login'); return; }
    setIsLoading(true);
    try {
      if (editingKit.id) {
        const { error } = await supabase.from('brand_kits').update({
          name: editingKit.name,
          primary_color: editingKit.primary_color,
          secondary_color: editingKit.secondary_color,
          accent_color: editingKit.accent_color,
          background_color: editingKit.background_color,
          text_color: editingKit.text_color,
          font_title: editingKit.font_title,
          font_body: editingKit.font_body,
          logo_url: editingKit.logo_url,
        } as any).eq('id', editingKit.id);
        if (error) throw error;
        toast.success('Brand Kit atualizado!');
      } else {
        const { error } = await supabase.from('brand_kits').insert({
          user_id: user.id,
          ...editingKit,
        } as any);
        if (error) throw error;
        toast.success('Brand Kit criado!');
      }
      await loadKits();
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar Brand Kit');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('brand_kits').delete().eq('id', id);
    if (error) { toast.error('Erro ao deletar'); return; }
    toast.success('Brand Kit removido');
    await loadKits();
  };

  const handleSetDefault = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // Remove default from all
    await supabase.from('brand_kits').update({ is_default: false } as any).eq('user_id', user.id);
    await supabase.from('brand_kits').update({ is_default: true } as any).eq('id', id);
    await loadKits();
    toast.success('Brand Kit padrão definido!');
  };

  const openNew = () => {
    setEditingKit({
      name: 'Meu Brand Kit',
      primary_color: '#6366f1',
      secondary_color: '#f59e0b',
      accent_color: '#10b981',
      background_color: '#0f172a',
      text_color: '#ffffff',
      font_title: 'Plus Jakarta Sans',
      font_body: 'Inter',
    });
    setIsOpen(true);
  };

  const openEdit = (kit: BrandKit) => {
    setEditingKit(kit);
    setIsOpen(true);
  };

  const ColorInput = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded border border-border cursor-pointer relative overflow-hidden shrink-0">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 w-full h-full cursor-pointer opacity-0" />
        <div className="w-full h-full" style={{ backgroundColor: value }} />
      </div>
      <div className="flex-1">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-7 text-xs" />
      </div>
    </div>
  );

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Palette className="w-4 h-4 text-accent" />
            Brand Kits
          </h4>
          <Button variant="ghost" size="sm" onClick={openNew} className="h-6 px-2">
            <Plus className="w-3 h-3" />
          </Button>
        </div>
        {kits.length === 0 && (
          <p className="text-xs text-muted-foreground">Nenhum brand kit criado</p>
        )}
        {kits.map(kit => (
          <div
            key={kit.id}
            className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => onApplyBrandKit?.(kit)}
          >
            <div className="flex gap-0.5">
              {[kit.primary_color, kit.secondary_color, kit.accent_color, kit.background_color].map((c, i) => (
                <div key={i} className="w-4 h-4 rounded-sm" style={{ backgroundColor: c }} />
              ))}
            </div>
            <span className="text-xs font-medium flex-1 truncate">{kit.name}</span>
            {kit.is_default && <Star className="w-3 h-3 text-accent fill-accent" />}
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={(e) => { e.stopPropagation(); openEdit(kit); }}>
              <Palette className="w-3 h-3" />
            </Button>
          </div>
        ))}

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingKit.id ? 'Editar' : 'Novo'} Brand Kit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Nome do Brand Kit" value={editingKit.name || ''} onChange={(e) => setEditingKit(p => ({ ...p, name: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <ColorInput label="Principal" value={editingKit.primary_color || '#6366f1'} onChange={(v) => setEditingKit(p => ({ ...p, primary_color: v }))} />
                <ColorInput label="Secundária" value={editingKit.secondary_color || '#f59e0b'} onChange={(v) => setEditingKit(p => ({ ...p, secondary_color: v }))} />
                <ColorInput label="Acento" value={editingKit.accent_color || '#10b981'} onChange={(v) => setEditingKit(p => ({ ...p, accent_color: v }))} />
                <ColorInput label="Fundo" value={editingKit.background_color || '#0f172a'} onChange={(v) => setEditingKit(p => ({ ...p, background_color: v }))} />
                <ColorInput label="Texto" value={editingKit.text_color || '#ffffff'} onChange={(v) => setEditingKit(p => ({ ...p, text_color: v }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Fonte Título</Label>
                  <Select value={editingKit.font_title} onValueChange={(v) => setEditingKit(p => ({ ...p, font_title: v }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {GOOGLE_FONTS.map(f => <SelectItem key={f.name} value={f.name}>{f.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Fonte Corpo</Label>
                  <Select value={editingKit.font_body} onValueChange={(v) => setEditingKit(p => ({ ...p, font_body: v }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {GOOGLE_FONTS.map(f => <SelectItem key={f.name} value={f.name}>{f.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Preview */}
              <div className="rounded-lg p-4 border border-border" style={{ backgroundColor: editingKit.background_color, color: editingKit.text_color }}>
                <div className="flex gap-1 mb-2">
                  {[editingKit.primary_color, editingKit.secondary_color, editingKit.accent_color].map((c, i) => (
                    <div key={i} className="w-6 h-6 rounded-full" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <p className="text-sm font-bold" style={{ fontFamily: GOOGLE_FONTS.find(f => f.name === editingKit.font_title)?.family }}>Título de Exemplo</p>
                <p className="text-xs mt-1" style={{ fontFamily: GOOGLE_FONTS.find(f => f.name === editingKit.font_body)?.family }}>Texto de corpo do carrossel com a fonte selecionada.</p>
              </div>
              <div className="flex justify-between">
                {editingKit.id && (
                  <div className="flex gap-2">
                    <Button variant="destructive" size="sm" onClick={() => { handleDelete(editingKit.id!); setIsOpen(false); }}>
                      <Trash2 className="w-3 h-3 mr-1" /> Excluir
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleSetDefault(editingKit.id!)}>
                      <Star className="w-3 h-3 mr-1" /> Definir padrão
                    </Button>
                  </div>
                )}
                <div className="flex gap-2 ml-auto">
                  <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                  <Button onClick={handleSave} disabled={isLoading}>{isLoading ? 'Salvando...' : 'Salvar'}</Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return null;
};
