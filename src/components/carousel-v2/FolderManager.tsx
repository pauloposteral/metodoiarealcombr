import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FolderPlus, Folder, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface CarouselFolder {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

interface FolderManagerProps {
  selectedFolderId: string | null;
  onSelectFolder: (id: string | null) => void;
}

export const FolderManager = ({ selectedFolderId, onSelectFolder }: FolderManagerProps) => {
  const [folders, setFolders] = useState<CarouselFolder[]>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const fetchFolders = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('carousel_folders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    setFolders((data || []) as CarouselFolder[]);
  }, []);

  useEffect(() => { fetchFolders(); }, [fetchFolders]);

  const handleCreate = async () => {
    if (!newFolderName.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const colors = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];
    const color = colors[folders.length % colors.length];

    const { error } = await supabase.from('carousel_folders').insert({
      user_id: user.id,
      name: newFolderName.trim(),
      color,
    });

    if (error) { toast.error('Erro ao criar pasta'); return; }
    setNewFolderName('');
    setIsOpen(false);
    fetchFolders();
    toast.success('Pasta criada!');
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('carousel_folders').delete().eq('id', id);
    if (error) { toast.error('Erro ao excluir'); return; }
    if (selectedFolderId === id) onSelectFolder(null);
    fetchFolders();
    toast.success('Pasta excluída');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">📁 Pastas</h4>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <FolderPlus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Nova Pasta</DialogTitle>
            </DialogHeader>
            <div className="flex gap-2">
              <Input
                placeholder="Nome da pasta"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
              <Button onClick={handleCreate}>Criar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedFolderId === null ? 'default' : 'outline'}
          size="sm"
          className="h-7 text-xs"
          onClick={() => onSelectFolder(null)}
        >
          Todos
        </Button>
        {folders.map(folder => (
          <div key={folder.id} className="group relative">
            <Button
              variant={selectedFolderId === folder.id ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs gap-1.5"
              onClick={() => onSelectFolder(folder.id)}
            >
              <Folder className="w-3 h-3" style={{ color: folder.color }} />
              {folder.name}
            </Button>
            <button
              className="absolute -top-1 -right-1 hidden group-hover:flex items-center justify-center w-4 h-4 rounded-full bg-destructive text-destructive-foreground"
              onClick={(e) => { e.stopPropagation(); handleDelete(folder.id); }}
            >
              <Trash2 className="w-2.5 h-2.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
