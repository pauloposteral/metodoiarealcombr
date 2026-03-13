import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, ArrowRight, User, Target, Loader2, Briefcase, Lightbulb, Rocket, PenTool } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface OnboardingDialogProps {
  userId: string;
}

const goals = [
  { id: 'productivity', label: 'Produtividade', desc: 'Automatizar tarefas do dia a dia', icon: Rocket },
  { id: 'content', label: 'Criar conteúdo', desc: 'Posts, carrosséis e textos com IA', icon: PenTool },
  { id: 'business', label: 'Negócios', desc: 'Usar IA para crescer meu negócio', icon: Briefcase },
  { id: 'learning', label: 'Aprender IA', desc: 'Entender como funciona a fundo', icon: Lightbulb },
];

export const OnboardingDialog = ({ userId }: OnboardingDialogProps) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('onboarding_done')
        .eq('id', userId)
        .maybeSingle();

      if (data && !data.onboarding_done) {
        setOpen(true);
      }
    };
    if (userId) checkOnboarding();
  }, [userId]);

  const toggleGoal = (id: string) => {
    setSelectedGoals(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      await supabase
        .from('profiles')
        .update({
          full_name: fullName || undefined,
          bio: bio || undefined,
          onboarding_done: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      toast({ title: 'Bem-vindo! 🎉', description: 'Sua conta está pronta. Bons estudos!' });
      setOpen(false);
    } catch {
      toast({ title: 'Erro', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    await supabase
      .from('profiles')
      .update({ onboarding_done: true, updated_at: new Date().toISOString() })
      .eq('id', userId);
    setOpen(false);
  };

  const steps = [
    // Step 0: Welcome
    <div key="welcome" className="text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto">
        <Sparkles className="w-8 h-8 text-accent" />
      </div>
      <h2 className="text-2xl font-bold font-display text-foreground">Bem-vindo ao IA Real! 🚀</h2>
      <p className="text-muted-foreground text-sm max-w-sm mx-auto">
        Estamos felizes em ter você aqui. Vamos configurar seu perfil em poucos segundos.
      </p>
      <Button onClick={() => setStep(1)} className="bg-accent hover:bg-accent/90 text-accent-foreground w-full">
        Começar <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>,
    // Step 1: Name
    <div key="name" className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
          <User className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h2 className="font-bold font-display text-foreground">Como podemos te chamar?</h2>
          <p className="text-xs text-muted-foreground">Seu nome aparecerá na comunidade</p>
        </div>
      </div>
      <div>
        <Label>Nome completo</Label>
        <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Seu nome" autoFocus />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setStep(0)} className="flex-1">Voltar</Button>
        <Button onClick={() => setStep(2)} className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
          Continuar <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>,
    // Step 2: Goals
    <div key="goals" className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
          <Target className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h2 className="font-bold font-display text-foreground">Qual seu objetivo?</h2>
          <p className="text-xs text-muted-foreground">Selecione um ou mais (opcional)</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {goals.map(goal => {
          const selected = selectedGoals.includes(goal.id);
          return (
            <button
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                selected
                  ? 'border-accent bg-accent/10'
                  : 'border-border/50 hover:border-accent/30'
              }`}
            >
              <goal.icon className={`w-5 h-5 mb-1.5 ${selected ? 'text-accent' : 'text-muted-foreground'}`} />
              <p className="text-sm font-medium text-foreground">{goal.label}</p>
              <p className="text-[10px] text-muted-foreground">{goal.desc}</p>
            </button>
          );
        })}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Voltar</Button>
        <Button onClick={() => setStep(3)} className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
          Continuar <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>,
    // Step 3: Bio + finish
    <div key="bio" className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h2 className="font-bold font-display text-foreground">Quase lá!</h2>
          <p className="text-xs text-muted-foreground">Conte um pouco sobre você (opcional)</p>
        </div>
      </div>
      <div>
        <Label>Bio (opcional)</Label>
        <Input value={bio} onChange={e => setBio(e.target.value)} placeholder="Ex: Empreendedor, apaixonado por IA..." />
      </div>
      <Button onClick={handleFinish} disabled={saving} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
        Começar a aprender!
      </Button>
    </div>,
  ];

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={e => e.preventDefault()}>
        <div className="p-2">
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-8 bg-accent' : i < step ? 'w-2 bg-accent/50' : 'w-2 bg-border'}`} />
            ))}
          </div>
          {steps[step]}
          {step > 0 && (
            <button onClick={handleSkip} className="text-xs text-muted-foreground hover:text-foreground mt-4 block mx-auto transition-colors">
              Pular por agora
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
