import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Link2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ShareLinkButtonProps {
  carouselId: string | null;
}

export const ShareLinkButton = ({ carouselId }: ShareLinkButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateLink = async () => {
    if (!carouselId) {
      toast.error('Salve o carrossel primeiro');
      return;
    }

    setIsGenerating(true);
    try {
      // Check if already has a share id
      const { data: existing } = await supabase
        .from('saved_carousels')
        .select('public_share_id')
        .eq('id', carouselId)
        .single();

      if (existing?.public_share_id) {
        setShareUrl(`${window.location.origin}/preview/${existing.public_share_id}`);
        setIsOpen(true);
        setIsGenerating(false);
        return;
      }

      // Generate new share ID
      const shareId = crypto.randomUUID().slice(0, 12);
      const { error } = await supabase
        .from('saved_carousels')
        .update({ public_share_id: shareId })
        .eq('id', carouselId);

      if (error) throw error;

      const url = `${window.location.origin}/preview/${shareId}`;
      setShareUrl(url);
      setIsOpen(true);
      toast.success('Link de preview gerado!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao gerar link');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs"
        onClick={generateLink}
        disabled={isGenerating || !carouselId}
      >
        <Link2 className="w-3.5 h-3.5" />
        {isGenerating ? 'Gerando...' : 'Compartilhar'}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Link de Preview Público</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Envie este link para aprovação. Qualquer pessoa com o link pode visualizar.
          </p>
          <div className="flex gap-2">
            <Input value={shareUrl} readOnly className="text-xs" />
            <Button onClick={handleCopy} size="icon" variant="outline">
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
