import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Plus, Pencil, Trash2, BookOpen, ChevronRight, ChevronDown,
  GraduationCap, Loader2, Eye, EyeOff, GripVertical, Brain
} from 'lucide-react';
import { QuizManager } from '@/components/admin/QuizManager';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  estimated_hours: number | null;
  difficulty: string | null;
  is_free: boolean | null;
  is_published: boolean | null;
  tags: string[] | null;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  course_id: string | null;
  is_published: boolean | null;
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  module_id: string;
  estimated_minutes: number | null;
  is_free: boolean | null;
  type: string | null;
  content: string | null;
  video_url: string | null;
}

type EditMode = 'course' | 'module' | 'lesson';

export default function AdminCursos() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Record<string, Module[]>>({});
  const [lessons, setLessons] = useState<Record<string, Lesson[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState<EditMode>('course');
  const [editItem, setEditItem] = useState<any>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [quizLesson, setQuizLesson] = useState<{ id: string; title: string } | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDifficulty, setFormDifficulty] = useState('beginner');
  const [formHours, setFormHours] = useState('');
  const [formThumbnail, setFormThumbnail] = useState('');
  const [formPublished, setFormPublished] = useState(true);
  const [formFree, setFormFree] = useState(false);
  const [formMinutes, setFormMinutes] = useState('');
  const [formType, setFormType] = useState('text');
  const [formContent, setFormContent] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/admin/login'); return; }
      setUser(user);
      await fetchCourses();
      setLoading(false);
    };
    init();
  }, [navigate]);

  const fetchCourses = async () => {
    const { data } = await supabase.from('courses').select('*').order('created_at');
    setCourses(data || []);
  };

  const fetchModules = async (courseId: string) => {
    const { data } = await supabase
      .from('modules')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index');
    setModules(prev => ({ ...prev, [courseId]: data || [] }));
  };

  const fetchLessons = async (moduleId: string) => {
    const { data } = await supabase
      .from('lessons')
      .select('*')
      .eq('module_id', moduleId)
      .order('order_index');
    setLessons(prev => ({ ...prev, [moduleId]: data || [] }));
  };

  const toggleCourse = (courseId: string) => {
    const next = new Set(expandedCourses);
    if (next.has(courseId)) {
      next.delete(courseId);
    } else {
      next.add(courseId);
      if (!modules[courseId]) fetchModules(courseId);
    }
    setExpandedCourses(next);
  };

  const toggleModule = (moduleId: string) => {
    const next = new Set(expandedModules);
    if (next.has(moduleId)) {
      next.delete(moduleId);
    } else {
      next.add(moduleId);
      if (!lessons[moduleId]) fetchLessons(moduleId);
    }
    setExpandedModules(next);
  };

  const openDialog = (mode: EditMode, item?: any, parent?: string) => {
    setEditMode(mode);
    setEditItem(item || null);
    setParentId(parent || null);

    if (item) {
      setFormTitle(item.title || '');
      setFormSlug(item.slug || '');
      setFormDescription(item.description || '');
      setFormDifficulty(item.difficulty || 'beginner');
      setFormHours(item.estimated_hours?.toString() || '');
      setFormThumbnail(item.thumbnail_url || '');
      setFormPublished(item.is_published ?? true);
      setFormFree(item.is_free ?? false);
      setFormMinutes(item.estimated_minutes?.toString() || '');
      setFormType(item.type || 'text');
      setFormContent(item.content || '');
      setFormVideoUrl(item.video_url || '');
    } else {
      setFormTitle('');
      setFormSlug('');
      setFormDescription('');
      setFormDifficulty('beginner');
      setFormHours('');
      setFormThumbnail('');
      setFormPublished(true);
      setFormFree(false);
      setFormMinutes('10');
      setFormType('text');
      setFormContent('');
      setFormVideoUrl('');
    }

    setDialogOpen(true);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleSave = async () => {
    if (!formTitle.trim()) {
      toast.error('Título é obrigatório');
      return;
    }
    setSaving(true);

    try {
      if (editMode === 'course') {
        const payload = {
          title: formTitle,
          slug: formSlug || generateSlug(formTitle),
          description: formDescription || null,
          difficulty: formDifficulty,
          estimated_hours: formHours ? parseFloat(formHours) : null,
          thumbnail_url: formThumbnail || null,
          is_published: formPublished,
          is_free: formFree,
        };

        if (editItem) {
          await supabase.from('courses').update(payload).eq('id', editItem.id);
          toast.success('Curso atualizado');
        } else {
          await supabase.from('courses').insert(payload);
          toast.success('Curso criado');
        }
        await fetchCourses();
      } else if (editMode === 'module') {
        const existingModules = modules[parentId!] || [];
        const payload = {
          title: formTitle,
          description: formDescription || null,
          course_id: parentId!,
          is_published: formPublished,
          order_index: editItem?.order_index ?? existingModules.length,
          slug: generateSlug(formTitle),
        };

        if (editItem) {
          await supabase.from('modules').update(payload).eq('id', editItem.id);
          toast.success('Módulo atualizado');
        } else {
          await supabase.from('modules').insert(payload);
          toast.success('Módulo criado');
        }
        await fetchModules(parentId!);
      } else if (editMode === 'lesson') {
        const existingLessons = lessons[parentId!] || [];
        const payload = {
          title: formTitle,
          description: formDescription || null,
          module_id: parentId!,
          estimated_minutes: formMinutes ? parseInt(formMinutes) : 10,
          is_free: formFree,
          type: formType,
          content: formContent || null,
          video_url: formVideoUrl || null,
          order_index: editItem?.order_index ?? existingLessons.length,
        };

        if (editItem) {
          await supabase.from('lessons').update(payload).eq('id', editItem.id);
          toast.success('Aula atualizada');
        } else {
          await supabase.from('lessons').insert(payload);
          toast.success('Aula criada');
        }
        await fetchLessons(parentId!);
      }

      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (mode: EditMode, id: string, parentCourseId?: string, parentModuleId?: string) => {
    if (!confirm('Tem certeza que deseja excluir?')) return;

    try {
      if (mode === 'course') {
        await supabase.from('courses').delete().eq('id', id);
        await fetchCourses();
      } else if (mode === 'module') {
        await supabase.from('modules').delete().eq('id', id);
        if (parentCourseId) await fetchModules(parentCourseId);
      } else {
        await supabase.from('lessons').delete().eq('id', id);
        if (parentModuleId) await fetchLessons(parentModuleId);
      }
      toast.success('Excluído com sucesso');
    } catch {
      toast.error('Erro ao excluir');
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AdminSidebar />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader user={user} />
          <main className="flex-1 p-6 lg:p-8 overflow-auto">
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <GraduationCap className="w-6 h-6 text-accent" />
                    Gerenciar Cursos
                  </h1>
                  <p className="text-muted-foreground text-sm mt-1">
                    Crie e organize cursos, módulos e aulas
                  </p>
                </div>
                <Button onClick={() => openDialog('course')} className="bg-accent hover:bg-accent/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Curso
                </Button>
              </div>

              {/* Course List */}
              {courses.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-2xl border border-border/50">
                  <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-lg font-semibold text-foreground mb-2">Nenhum curso criado</h2>
                  <p className="text-muted-foreground mb-4">Comece criando seu primeiro curso</p>
                  <Button onClick={() => openDialog('course')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Curso
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {courses.map(course => (
                    <div key={course.id} className="bg-card rounded-xl border border-border/50 overflow-hidden">
                      {/* Course row */}
                      <div className="flex items-center gap-3 p-4">
                        <button onClick={() => toggleCourse(course.id)} className="text-muted-foreground hover:text-foreground">
                          {expandedCourses.has(course.id) ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground truncate">{course.title}</h3>
                            <Badge variant={course.is_published ? 'default' : 'secondary'} className="text-xs">
                              {course.is_published ? 'Publicado' : 'Rascunho'}
                            </Badge>
                            {course.is_free && <Badge variant="outline" className="text-xs">Grátis</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">/{course.slug}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openDialog('module', null, course.id)} title="Adicionar módulo">
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openDialog('course', course)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete('course', course.id)} className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Modules */}
                      {expandedCourses.has(course.id) && (
                        <div className="border-t border-border/50 bg-secondary/20">
                          {(modules[course.id] || []).length === 0 ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                              Nenhum módulo ainda.{' '}
                              <button onClick={() => openDialog('module', null, course.id)} className="text-accent hover:underline">
                                Criar primeiro módulo
                              </button>
                            </div>
                          ) : (
                            (modules[course.id] || []).map(mod => (
                              <div key={mod.id}>
                                <div className="flex items-center gap-3 px-4 py-3 pl-12 border-b border-border/30">
                                  <button onClick={() => toggleModule(mod.id)} className="text-muted-foreground hover:text-foreground">
                                    {expandedModules.has(mod.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                  </button>
                                  <BookOpen className="w-4 h-4 text-accent flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <span className="text-sm font-medium text-foreground truncate block">{mod.title}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openDialog('lesson', null, mod.id)} title="Adicionar aula">
                                      <Plus className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openDialog('module', mod, course.id)}>
                                      <Pencil className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete('module', mod.id, course.id)}>
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Lessons */}
                                {expandedModules.has(mod.id) && (
                                  <div className="bg-secondary/10">
                                    {(lessons[mod.id] || []).length === 0 ? (
                                      <div className="p-3 pl-20 text-xs text-muted-foreground">
                                        Sem aulas.{' '}
                                        <button onClick={() => openDialog('lesson', null, mod.id)} className="text-accent hover:underline">
                                          Adicionar aula
                                        </button>
                                      </div>
                                    ) : (
                                      (lessons[mod.id] || []).map(lesson => (
                                        <div key={lesson.id} className="flex items-center gap-3 px-4 py-2.5 pl-20 border-b border-border/20">
                                          <span className="text-xs text-muted-foreground w-4">{lesson.order_index + 1}</span>
                                          <div className="flex-1 min-w-0">
                                            <span className="text-sm text-foreground truncate block">{lesson.title}</span>
                                            <span className="text-xs text-muted-foreground">
                                              {lesson.estimated_minutes}min · {lesson.type}
                                              {lesson.is_free && ' · Grátis'}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setQuizLesson({ id: lesson.id, title: lesson.title })} title="Quiz">
                                              <Brain className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openDialog('lesson', lesson, mod.id)}>
                                              <Pencil className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete('lesson', lesson.id, undefined, mod.id)}>
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editItem ? 'Editar' : 'Criar'}{' '}
              {editMode === 'course' ? 'Curso' : editMode === 'module' ? 'Módulo' : 'Aula'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados abaixo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <Label>Título *</Label>
              <Input
                value={formTitle}
                onChange={e => {
                  setFormTitle(e.target.value);
                  if (!editItem && editMode === 'course') {
                    setFormSlug(generateSlug(e.target.value));
                  }
                }}
                placeholder="Ex: Fundamentos de IA"
              />
            </div>

            {editMode === 'course' && (
              <div>
                <Label>Slug</Label>
                <Input
                  value={formSlug}
                  onChange={e => setFormSlug(e.target.value)}
                  placeholder="fundamentos-de-ia"
                />
              </div>
            )}

            <div>
              <Label>Descrição</Label>
              <Textarea
                value={formDescription}
                onChange={e => setFormDescription(e.target.value)}
                placeholder="Breve descrição..."
                rows={3}
              />
            </div>

            {editMode === 'course' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Dificuldade</Label>
                    <Select value={formDifficulty} onValueChange={setFormDifficulty}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Iniciante</SelectItem>
                        <SelectItem value="intermediate">Intermediário</SelectItem>
                        <SelectItem value="advanced">Avançado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Horas estimadas</Label>
                    <Input
                      type="number"
                      value={formHours}
                      onChange={e => setFormHours(e.target.value)}
                      placeholder="10"
                    />
                  </div>
                </div>
                <div>
                  <Label>URL da thumbnail</Label>
                  <Input
                    value={formThumbnail}
                    onChange={e => setFormThumbnail(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </>
            )}

            {editMode === 'lesson' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo</Label>
                    <Select value={formType} onValueChange={setFormType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Texto</SelectItem>
                        <SelectItem value="video">Vídeo</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Duração (min)</Label>
                    <Input
                      type="number"
                      value={formMinutes}
                      onChange={e => setFormMinutes(e.target.value)}
                      placeholder="10"
                    />
                  </div>
                </div>
                {formType === 'video' && (
                  <div>
                    <Label>URL do vídeo</Label>
                    <Input
                      value={formVideoUrl}
                      onChange={e => setFormVideoUrl(e.target.value)}
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                )}
                <div>
                  <Label>Conteúdo (Markdown)</Label>
                  <Textarea
                    value={formContent}
                    onChange={e => setFormContent(e.target.value)}
                    placeholder="# Título da aula..."
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
              </>
            )}

            {/* Toggles */}
            <div className="flex items-center gap-6 pt-2">
              {(editMode === 'course' || editMode === 'module') && (
                <div className="flex items-center gap-2">
                  <Switch checked={formPublished} onCheckedChange={setFormPublished} id="published" />
                  <Label htmlFor="published">Publicado</Label>
                </div>
              )}
              {(editMode === 'course' || editMode === 'lesson') && (
                <div className="flex items-center gap-2">
                  <Switch checked={formFree} onCheckedChange={setFormFree} id="free" />
                  <Label htmlFor="free">Gratuito</Label>
                </div>
              )}
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full bg-accent hover:bg-accent/90">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editItem ? 'Salvar alterações' : 'Criar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
