import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Kanban, CalendarDays, MessageSquare, CheckCircle2, Clock,
  AlertTriangle, Send, Eye, Pencil, Trash2, CalendarIcon,
  Tag, Flag, Filter, ArrowUpDown
} from 'lucide-react';
import { toast } from 'sonner';

type WorkflowStatus = 'rascunho' | 'revisao' | 'aprovado' | 'publicado';
type Priority = 'baixa' | 'normal' | 'alta' | 'urgente';

interface WorkflowCarousel {
  id: string;
  topic: string;
  workflow_status: WorkflowStatus;
  scheduled_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  notes: string | null;
  priority: Priority;
  tags: string[];
  created_at: string;
  updated_at: string;
  thumbnail_url: string | null;
}

interface SlideComment {
  id: string;
  carousel_id: string;
  user_id: string;
  slide_index: number;
  content: string;
  is_resolved: boolean;
  created_at: string;
}

const STATUS_CONFIG: Record<WorkflowStatus, { label: string; color: string; icon: React.ReactNode }> = {
  rascunho: { label: 'Rascunho', color: 'bg-muted text-muted-foreground', icon: <Pencil className="w-3 h-3" /> },
  revisao: { label: 'Em Revisão', color: 'bg-amber-500/20 text-amber-600', icon: <Eye className="w-3 h-3" /> },
  aprovado: { label: 'Aprovado', color: 'bg-emerald-500/20 text-emerald-600', icon: <CheckCircle2 className="w-3 h-3" /> },
  publicado: { label: 'Publicado', color: 'bg-blue-500/20 text-blue-600', icon: <Send className="w-3 h-3" /> },
};

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  baixa: { label: 'Baixa', color: 'bg-slate-500/20 text-slate-500' },
  normal: { label: 'Normal', color: 'bg-blue-500/20 text-blue-500' },
  alta: { label: 'Alta', color: 'bg-orange-500/20 text-orange-500' },
  urgente: { label: 'Urgente', color: 'bg-red-500/20 text-red-500' },
};

interface WorkflowBoardProps {
  onOpenCarousel?: (id: string) => void;
}

export const WorkflowBoard = ({ onOpenCarousel }: WorkflowBoardProps) => {
  const [carousels, setCarousels] = useState<WorkflowCarousel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('kanban');
  const [selectedCarousel, setSelectedCarousel] = useState<WorkflowCarousel | null>(null);
  const [comments, setComments] = useState<SlideComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentSlideIndex, setCommentSlideIndex] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    loadCarousels();
  }, []);

  const loadCarousels = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setIsLoading(true);
    const { data } = await supabase
      .from('saved_carousels')
      .select('id, topic, workflow_status, scheduled_at, approved_by, approved_at, notes, priority, tags, created_at, updated_at, thumbnail_url')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    if (data) setCarousels(data as unknown as WorkflowCarousel[]);
    setIsLoading(false);
  };

  const updateStatus = async (id: string, status: WorkflowStatus) => {
    const updates: any = { workflow_status: status };
    if (status === 'aprovado') {
      const { data: { user } } = await supabase.auth.getUser();
      updates.approved_by = user?.email || 'unknown';
      updates.approved_at = new Date().toISOString();
    }
    const { error } = await supabase.from('saved_carousels').update(updates).eq('id', id);
    if (error) { toast.error('Erro ao atualizar status'); return; }
    toast.success(`Status: ${STATUS_CONFIG[status].label}`);
    await loadCarousels();
  };

  const updatePriority = async (id: string, priority: Priority) => {
    await supabase.from('saved_carousels').update({ priority } as any).eq('id', id);
    await loadCarousels();
  };

  const updateSchedule = async (id: string, date: Date | undefined) => {
    await supabase.from('saved_carousels').update({ scheduled_at: date?.toISOString() || null } as any).eq('id', id);
    toast.success(date ? `Agendado para ${format(date, 'dd/MM/yyyy')}` : 'Agendamento removido');
    await loadCarousels();
  };

  const updateNotes = async (id: string, notes: string) => {
    await supabase.from('saved_carousels').update({ notes } as any).eq('id', id);
  };

  const loadComments = async (carouselId: string) => {
    const { data } = await supabase
      .from('slide_comments')
      .select('*')
      .eq('carousel_id', carouselId)
      .order('created_at', { ascending: true });
    if (data) setComments(data as unknown as SlideComment[]);
  };

  const addComment = async () => {
    if (!selectedCarousel || !newComment.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('slide_comments').insert({
      carousel_id: selectedCarousel.id,
      user_id: user.id,
      slide_index: commentSlideIndex,
      content: newComment.trim(),
    } as any);
    if (error) { toast.error('Erro ao comentar'); return; }
    setNewComment('');
    await loadComments(selectedCarousel.id);
    toast.success('Comentário adicionado!');
  };

  const toggleResolveComment = async (commentId: string, resolved: boolean) => {
    await supabase.from('slide_comments').update({ is_resolved: !resolved } as any).eq('id', commentId);
    if (selectedCarousel) await loadComments(selectedCarousel.id);
  };

  const openDetail = (carousel: WorkflowCarousel) => {
    setSelectedCarousel(carousel);
    setDetailOpen(true);
    loadComments(carousel.id);
  };

  const filteredCarousels = filterStatus === 'all' ? carousels : carousels.filter(c => c.workflow_status === filterStatus);

  const getByStatus = (status: WorkflowStatus) => filteredCarousels.filter(c => c.workflow_status === status);

  const KanbanColumn = ({ status }: { status: WorkflowStatus }) => {
    const items = getByStatus(status);
    const cfg = STATUS_CONFIG[status];
    return (
      <div className="flex-1 min-w-[240px]">
        <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-muted/30">
          {cfg.icon}
          <span className="text-sm font-semibold">{cfg.label}</span>
          <Badge variant="secondary" className="text-[10px] ml-auto">{items.length}</Badge>
        </div>
        <div className="space-y-2 min-h-[200px]">
          {items.map(c => (
            <Card
              key={c.id}
              className="p-3 cursor-pointer hover:ring-2 hover:ring-accent/50 transition-all"
              onClick={() => openDetail(c)}
            >
              <p className="text-sm font-medium truncate">{c.topic}</p>
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <Badge className={cn('text-[10px]', PRIORITY_CONFIG[(c.priority as Priority) || 'normal'].color)}>
                  {PRIORITY_CONFIG[(c.priority as Priority) || 'normal'].label}
                </Badge>
                {c.scheduled_at && (
                  <Badge variant="outline" className="text-[10px] gap-1">
                    <CalendarDays className="w-2.5 h-2.5" />
                    {format(new Date(c.scheduled_at), 'dd/MM')}
                  </Badge>
                )}
              </div>
              {c.tags && c.tags.length > 0 && (
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {c.tags.slice(0, 3).map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-[9px]">{tag}</Badge>
                  ))}
                </div>
              )}
            </Card>
          ))}
          {items.length === 0 && (
            <div className="text-center py-8 text-xs text-muted-foreground">Nenhum carrossel</div>
          )}
        </div>
      </div>
    );
  };

  const CalendarView = () => {
    const scheduledCarousels = carousels.filter(c => c.scheduled_at);
    const scheduledDates = scheduledCarousels.map(c => new Date(c.scheduled_at!));

    return (
      <div className="space-y-4">
        <Calendar
          mode="multiple"
          selected={scheduledDates}
          className={cn("p-3 pointer-events-auto rounded-lg border border-border")}
          locale={ptBR}
        />
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Próximos Agendamentos</h4>
          {scheduledCarousels
            .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime())
            .map(c => (
              <Card key={c.id} className="p-3 flex items-center gap-3 cursor-pointer hover:bg-muted/50" onClick={() => openDetail(c)}>
                <div className="text-center shrink-0">
                  <p className="text-lg font-bold">{format(new Date(c.scheduled_at!), 'dd')}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">{format(new Date(c.scheduled_at!), 'MMM', { locale: ptBR })}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.topic}</p>
                  <Badge className={cn('text-[10px] mt-1', STATUS_CONFIG[(c.workflow_status as WorkflowStatus) || 'rascunho'].color)}>
                    {STATUS_CONFIG[(c.workflow_status as WorkflowStatus) || 'rascunho'].label}
                  </Badge>
                </div>
              </Card>
            ))}
          {scheduledCarousels.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">Nenhum carrossel agendado</p>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <Card className="p-8 text-center glass-panel border-border"><Clock className="w-6 h-6 mx-auto animate-spin text-muted-foreground" /></Card>;
  }

  return (
    <Card className="p-4 glass-panel border-border">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Kanban className="w-4 h-4 text-accent" />
            Workflow
          </h3>
          <TabsList className="h-7">
            <TabsTrigger value="kanban" className="text-xs h-5 px-2">Kanban</TabsTrigger>
            <TabsTrigger value="calendar" className="text-xs h-5 px-2">Calendário</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="kanban" className="mt-0">
          <div className="flex gap-3 overflow-x-auto pb-2">
            <KanbanColumn status="rascunho" />
            <KanbanColumn status="revisao" />
            <KanbanColumn status="aprovado" />
            <KanbanColumn status="publicado" />
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="mt-0">
          <CalendarView />
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base truncate">{selectedCarousel?.topic}</DialogTitle>
          </DialogHeader>
          {selectedCarousel && (
            <div className="space-y-4">
              {/* Status */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                <div className="flex gap-1.5 flex-wrap">
                  {(Object.entries(STATUS_CONFIG) as [WorkflowStatus, typeof STATUS_CONFIG['rascunho']][]).map(([key, cfg]) => (
                    <Badge
                      key={key}
                      className={cn('text-xs cursor-pointer transition-all', cfg.color, selectedCarousel.workflow_status === key && 'ring-2 ring-accent')}
                      onClick={() => { updateStatus(selectedCarousel.id, key); setSelectedCarousel(prev => prev ? { ...prev, workflow_status: key } : null); }}
                    >
                      {cfg.icon}
                      <span className="ml-1">{cfg.label}</span>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Prioridade</label>
                <Select value={selectedCarousel.priority || 'normal'} onValueChange={(v) => { updatePriority(selectedCarousel.id, v as Priority); setSelectedCarousel(prev => prev ? { ...prev, priority: v as Priority } : null); }}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.entries(PRIORITY_CONFIG) as [Priority, typeof PRIORITY_CONFIG['normal']][]).map(([key, cfg]) => (
                      <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Schedule */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Agendamento</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className={cn("w-full justify-start text-xs", !selectedCarousel.scheduled_at && "text-muted-foreground")}>
                      <CalendarIcon className="w-3 h-3 mr-2" />
                      {selectedCarousel.scheduled_at ? format(new Date(selectedCarousel.scheduled_at), 'dd/MM/yyyy') : 'Selecionar data'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedCarousel.scheduled_at ? new Date(selectedCarousel.scheduled_at) : undefined}
                      onSelect={(date) => { updateSchedule(selectedCarousel.id, date); setSelectedCarousel(prev => prev ? { ...prev, scheduled_at: date?.toISOString() || null } : null); }}
                      locale={ptBR}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Notas</label>
                <Textarea
                  placeholder="Adicionar notas..."
                  defaultValue={selectedCarousel.notes || ''}
                  onBlur={(e) => updateNotes(selectedCarousel.id, e.target.value)}
                  rows={3}
                  className="text-xs"
                />
              </div>

              {/* Approval info */}
              {selectedCarousel.approved_by && (
                <div className="p-2 bg-emerald-500/10 rounded-lg text-xs">
                  <p className="text-emerald-600">
                    ✓ Aprovado por {selectedCarousel.approved_by}
                    {selectedCarousel.approved_at && ` em ${format(new Date(selectedCarousel.approved_at), 'dd/MM/yyyy HH:mm')}`}
                  </p>
                </div>
              )}

              {/* Slide Comments */}
              <div className="border-t border-border pt-3">
                <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-3 h-3" />
                  Comentários por Slide
                </h4>
                <div className="flex gap-2 mb-2">
                  <Select value={String(commentSlideIndex)} onValueChange={(v) => setCommentSlideIndex(Number(v))}>
                    <SelectTrigger className="h-7 text-xs w-24"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => (
                        <SelectItem key={i} value={String(i)}>Slide {i + 1}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Adicionar comentário..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="h-7 text-xs flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && addComment()}
                  />
                  <Button variant="outline" size="sm" className="h-7 px-2" onClick={addComment} disabled={!newComment.trim()}>
                    <Send className="w-3 h-3" />
                  </Button>
                </div>
                <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                  {comments.map(c => (
                    <div key={c.id} className={cn("p-2 rounded text-xs flex items-start gap-2", c.is_resolved ? 'bg-muted/30 line-through opacity-60' : 'bg-muted/50')}>
                      <Badge variant="outline" className="text-[9px] shrink-0">S{c.slide_index + 1}</Badge>
                      <p className="flex-1">{c.content}</p>
                      <Button variant="ghost" size="sm" className="h-4 w-4 p-0 shrink-0" onClick={() => toggleResolveComment(c.id, c.is_resolved)}>
                        <CheckCircle2 className={cn("w-3 h-3", c.is_resolved ? 'text-emerald-500' : 'text-muted-foreground')} />
                      </Button>
                    </div>
                  ))}
                  {comments.length === 0 && <p className="text-[10px] text-muted-foreground text-center py-2">Sem comentários</p>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {onOpenCarousel && (
                  <Button size="sm" className="flex-1 gap-1.5" onClick={() => { onOpenCarousel(selectedCarousel.id); setDetailOpen(false); }}>
                    <Pencil className="w-3 h-3" /> Abrir Editor
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};
