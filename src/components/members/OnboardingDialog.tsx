import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, ArrowRight, User, Loader2, Route as RouteIcon, PenLine } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface OnboardingDialogProps {
  userId: string;
}

const STEP_COUNT = 4;

export const OnboardingDialog = ({ userId }: OnboardingDialogProps) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_done')
        .eq('id', userId)
        .maybeSingle();
      if (error) {
        console.error('[OnboardingDialog] could not read onboarding state', error);
        return;
      }
      if (data && !data.onboarding_done) setOpen(true);
    };
    if (userId) void checkOnboarding();
  }, [userId]);

  /** Saves name/bio (when filled) and marks onboarding as done. */
  const finish = async (goToTrail: boolean) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim() || undefined,
          bio: bio.trim() || undefined,
          onboarding_done: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
      if (error) throw error;
      setOpen(false);
      if (goToTrail) navigate('/membros/trilha');
      else toast({ title: 'Tudo pronto!', description: 'Bons estudos. O quiz da trilha fica em Minha trilha, no menu.' });
    } catch (error) {
      console.error('[OnboardingDialog] could not save onboarding', error);
      toast({ title: 'Não foi possível salvar seu perfil', description: 'Tente de novo em instantes.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({ onboarding_done: true, updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (error) console.error('[OnboardingDialog] could not skip onboarding', error);
    setOpen(false);
  };

  const steps = [
    // Step 0: Welcome
    <div key="welcome" className="space-y-4 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/20">
        <Sparkles className="h-8 w-8 text-gold-dark dark:text-accent" aria-hidden="true" />
      </div>
      <DialogTitle className="font-display text-2xl font-bold text-foreground">Bem-vindo ao Método IA Real!</DialogTitle>
      <DialogDescription className="mx-auto max-w-sm text-sm text-muted-foreground">
        Vamos configurar seu perfil e escolher a sua trilha de estudo. Leva poucos minutos.
      </DialogDescription>
      <Button onClick={() => setStep(1)} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
        Começar <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
      </Button>
    </div>,
    // Step 1: Name
    <div key="name" className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20">
          <User className="h-5 w-5 text-gold-dark dark:text-accent" aria-hidden="true" />
        </div>
        <div>
          <DialogTitle className="font-display font-bold text-foreground">Como podemos te chamar?</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">Seu nome aparece na comunidade e no certificado.</DialogDescription>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="onboarding-name">Nome completo</Label>
        <Input id="onboarding-name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Seu nome" autoComplete="name" autoFocus />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setStep(0)} className="flex-1">Voltar</Button>
        <Button onClick={() => setStep(2)} className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90">
          Continuar <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>,
    // Step 2: Bio
    <div key="bio" className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20">
          <PenLine className="h-5 w-5 text-gold-dark dark:text-accent" aria-hidden="true" />
        </div>
        <div>
          <DialogTitle className="font-display font-bold text-foreground">Conte um pouco sobre você</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">Opcional. Aparece no seu perfil da comunidade.</DialogDescription>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="onboarding-bio">Bio (opcional)</Label>
        <Input id="onboarding-bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Ex.: Empreendedora, apaixonada por IA…" />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Voltar</Button>
        <Button onClick={() => setStep(3)} className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90">
          Continuar <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>,
    // Step 3: Trail
    <div key="trail" className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20">
          <RouteIcon className="h-5 w-5 text-gold-dark dark:text-accent" aria-hidden="true" />
        </div>
        <div>
          <DialogTitle className="font-display font-bold text-foreground">Descubra a sua trilha</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">5 perguntas, cerca de 2 minutos.</DialogDescription>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Carreira, Empreendedor, Criador de conteúdo, Construtor de apps ou Formação completa: o quiz indica por onde começar
        e você pode trocar quando quiser.
      </p>
      <Button onClick={() => void finish(true)} disabled={saving} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <RouteIcon className="mr-2 h-4 w-4" aria-hidden="true" />}
        Fazer o quiz da trilha
      </Button>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setStep(2)} className="flex-1" disabled={saving}>Voltar</Button>
        <Button variant="ghost" onClick={() => void finish(false)} className="flex-1" disabled={saving}>Explorar por conta própria</Button>
      </div>
    </div>,
  ];

  return (
    // Closing (X or Esc) counts as "Pular por agora"; clicks outside are ignored to avoid accidental skips.
    <Dialog open={open} onOpenChange={(next) => { if (!next && !saving) void handleSkip(); }}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <div className="p-2">
          <p className="sr-only" aria-live="polite">Passo {step + 1} de {STEP_COUNT}</p>
          <div className="mb-6 flex items-center justify-center gap-2" aria-hidden="true">
            {Array.from({ length: STEP_COUNT }, (_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-8 bg-accent' : i < step ? 'w-2 bg-accent/50' : 'w-2 bg-border'}`} />
            ))}
          </div>
          {steps[step]}
          {step > 0 && (
            <button
              type="button"
              onClick={() => void handleSkip()}
              className="mx-auto mt-4 block rounded-sm text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Pular por agora
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
