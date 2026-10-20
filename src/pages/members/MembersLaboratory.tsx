import { useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, BookOpen, CheckCircle2, Code2, ExternalLink, FlaskConical, GitBranch, Layers, LockKeyhole, Play, Search, ShieldCheck, Sparkles, Video, X } from 'lucide-react';
import { MembersLayout } from '@/components/members/MembersLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LabVideoDialog } from '@/components/lab/LabVideoDialog';
import { useCourseCatalog, useCompletedLessons } from '@/hooks/useCourseOutline';
import { LAB_COURSE_SLUG, filterLabVideos, labMissions, labRepositories, labTopics, labVideos, videoDuration, type LabTopic, type LabVideo } from '@/lib/labResources';

const TOPIC_ICONS = { apps: Layers, security: ShieldCheck, automation: GitBranch, design: Sparkles, delivery: Code2 };
const validTabs = ['jornada', 'videos', 'codigo'];

export default function MembersLaboratory() {
  const catalog = useCourseCatalog();
  const completed = useCompletedLessons();
  const [params, setParams] = useSearchParams();
  const requestedTab = params.get('tab') ?? 'jornada';
  const tab = validTabs.includes(requestedTab) ? requestedTab : 'jornada';
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState<LabTopic>('all');
  const [language, setLanguage] = useState<'all' | 'pt' | 'en'>('all');
  const [selectedVideo, setSelectedVideo] = useState<LabVideo | null>(null);
  const videoTrigger = useRef<HTMLButtonElement | null>(null);
  const videos = useMemo(() => filterLabVideos(labVideos, search, topic, language), [search, topic, language]);
  const entry = catalog.data?.entries.find(item => item.course.slug === LAB_COURSE_SLUG);
  const lessons = entry?.outline.lessons ?? [];
  const done = lessons.filter(lesson => completed.data?.has(lesson.id)).length;
  const available = lessons.filter(lesson => lesson.accessible);
  const next = available.find(lesson => !completed.data?.has(lesson.id)) ?? available[0];
  const progress = lessons.length ? Math.round(done / lessons.length * 100) : 0;
  const modules = [...(entry?.outline.modules ?? [])].sort((a, b) => a.order_index - b.order_index);
  const isPending = catalog.isPending || completed.isPending;
  const error = catalog.isError || completed.isError;
  const actionHref = next ? `/membros/aula/${next.id}` : `/membros/cursos/${LAB_COURSE_SLUG}`;

  function closeVideo() { setSelectedVideo(null); requestAnimationFrame(() => videoTrigger.current?.focus()); }
  return <MembersLayout>
    <Helmet><title>Laboratório de aplicativos | Método IA Real</title></Helmet>
    <div className="mx-auto max-w-6xl space-y-7 pb-10" data-lab-page>
      <header className="grid overflow-hidden rounded-[1.75rem] border border-slate-700 bg-[#0b1526] text-white md:grid-cols-[1fr_260px]">
        <div className="relative p-6 sm:p-8 lg:p-10">
          <p className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-amber-200"><FlaskConical className="h-4 w-4" aria-hidden="true" />Laboratório IA Real</p>
          <h1 className="max-w-xl font-display text-[2rem] font-bold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">Menos tentativa.<br /><span className="text-amber-200">Mais projeto pronto.</span></h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">Aprenda o processo de construir com IA. Um projeto, seis missões e evidências em cada etapa.</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {isPending ? <p role="status" className="text-sm text-slate-300">Buscando seu próximo passo…</p> : error ? <Button variant="outline" className="border-slate-500 bg-transparent text-white hover:bg-slate-800 hover:text-white" onClick={() => { void catalog.refetch(); void completed.refetch(); }}>Recarregar jornada</Button> : entry ? <Button asChild className="min-h-12 rounded-xl bg-amber-200 px-5 text-slate-950 hover:bg-amber-100"><Link to={actionHref}>{next ? (done ? 'Continuar meu projeto' : 'Começar o laboratório') : 'Ver acesso ao laboratório'}<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link></Button> : <Button asChild className="min-h-12 bg-amber-200 text-slate-950 hover:bg-amber-100"><Link to="/membros/cursos">Ver cursos disponíveis</Link></Button>}
            <button className="min-h-12 rounded-xl px-3 text-sm font-semibold text-slate-200 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2" onClick={() => setParams({ tab: 'videos' }, { replace: true })}>Explorar vídeos <span aria-hidden="true">↗</span></button>
          </div>
          {!isPending && !error && entry && <div className="mt-6 max-w-sm"><div className="mb-2 flex justify-between text-xs text-slate-300"><span>{done} de {lessons.length} etapas concluídas</span><span>{progress}%</span></div><div role="progressbar" aria-label="Progresso do laboratório" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} className="h-1.5 overflow-hidden rounded-full bg-slate-700"><div className="h-full rounded-full bg-amber-200" style={{ width: `${progress}%` }} /></div></div>}
        </div>
        <div className="relative hidden overflow-hidden border-l border-slate-700 md:block"><img src="/media/realis-laboratorio.webp" alt="Realis, mentor fictício do Método IA Real" width={560} height={766} className="h-full min-h-[350px] w-full object-cover object-[45%_center]" /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 px-5 pb-6 pt-16"><p className="text-xs uppercase tracking-widest text-amber-200">Aprenda. Crie. Aplique.</p></div></div>
      </header>

      <Tabs value={tab} onValueChange={value => setParams({ tab: value }, { replace: true })}>
        <TabsList className="mb-6 grid h-auto w-full grid-cols-3 rounded-xl bg-secondary/70 p-1.5 sm:max-w-xl">
          <TabsTrigger value="jornada" className="min-h-11 gap-2 rounded-lg px-2"><BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" /><span>Jornada</span></TabsTrigger>
          <TabsTrigger value="videos" className="min-h-11 gap-2 rounded-lg px-2"><Video className="h-4 w-4 shrink-0" aria-hidden="true" /><span>Vídeos</span></TabsTrigger>
          <TabsTrigger value="codigo" className="min-h-11 gap-2 rounded-lg px-2"><Code2 className="h-4 w-4 shrink-0" aria-hidden="true" /><span>Código</span></TabsTrigger>
        </TabsList>
        <TabsContent value="jornada" className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-display text-2xl font-bold">Da ideia à entrega.</h2><p className="mt-1 text-sm text-muted-foreground">Um caminho prático, sem pular pesquisa, teste ou revisão.</p></div><span className="rounded-full border px-3 py-1.5 text-xs">6 missões conectadas</span></div>
          {error && <p role="alert" className="rounded-xl border border-destructive/30 p-4 text-sm">Não foi possível consultar seu curso agora. Os vídeos e fontes continuam disponíveis; tente recarregar a jornada.</p>}
          {!isPending && !error && !entry && <p role="status" className="rounded-xl border p-4 text-sm text-muted-foreground">O curso do laboratório ainda não aparece no catálogo desta conta. Explore as referências ou abra os cursos disponíveis.</p>}
          <ol className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{labMissions.map((mission, index) => {
            const module = modules[index];
            const moduleLessons = lessons.filter(lesson => lesson.module_id === module?.id);
            const finished = moduleLessons.filter(lesson => completed.data?.has(lesson.id)).length;
            return <li key={mission.title}><article className="flex h-full flex-col rounded-2xl border border-border/70 bg-card p-5 transition-colors hover:border-accent/50"><div className="mb-5 flex items-center justify-between"><span className="font-display text-3xl font-semibold text-muted-foreground/40">0{index + 1}</span>{moduleLessons.length > 0 && finished === moduleLessons.length ? <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-label="Missão concluída" /> : <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />}</div><h3 className="font-display text-xl font-bold">{mission.title}</h3><p className="mb-5 mt-2 flex-1 text-sm leading-6 text-muted-foreground">{mission.outcome}</p>{module ? <Link className="flex min-h-11 items-center justify-between rounded-lg border px-3 text-sm font-semibold hover:bg-secondary focus-visible:outline focus-visible:outline-2" to={`/membros/modulos/${module.id}`}><span>{finished}/{moduleLessons.length} etapas</span><ArrowRight className="h-4 w-4" aria-hidden="true" /></Link> : <p className="text-xs text-muted-foreground">{isPending ? 'Carregando etapas…' : 'Confira no catálogo de cursos'}</p>}</article></li>;
          })}</ol>
          <div className="flex gap-3 rounded-2xl border bg-secondary/30 p-5"><ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" /><p className="text-sm leading-6 text-muted-foreground">O objetivo é construir algo verificável, não apenas gerar telas. O laboratório não altera os requisitos do certificado da formação principal. Vídeos externos são apoio; a entrega continua sendo sua.</p></div>
        </TabsContent>
        <TabsContent value="videos" className="space-y-5">
          <div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Curadoria complementar</p><h2 className="mt-2 font-display text-2xl font-bold">Assista. Entenda. Experimente.</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Referências em português e inglês, com autoria preservada e uma atividade própria em português para aplicar o aprendizado. Não são videoaulas produzidas pelo Método IA Real.</p></div>
          <div className="relative"><label htmlFor="lab-video-search" className="sr-only">Buscar vídeos por tema ou autor</label><Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-muted-foreground" aria-hidden="true" /><Input id="lab-video-search" type="search" value={search} onChange={e => setSearch(e.target.value)} className="h-12 rounded-xl pl-11 pr-12" placeholder="O que você quer colocar em prática?" />{search && <button className="absolute right-1 top-1 grid h-10 w-10 place-items-center rounded-lg hover:bg-secondary" aria-label="Limpar busca de vídeos" onClick={() => setSearch('')}><X className="h-4 w-4" /></button>}</div>
          <div className="flex items-center gap-3"><label htmlFor="lab-language" className="text-sm font-medium">Áudio</label><select id="lab-language" className="min-h-11 rounded-xl border bg-background px-3 text-sm" value={language} onChange={event => setLanguage(event.target.value as 'all' | 'pt' | 'en')}><option value="all">Todos os idiomas</option><option value="pt">Português</option><option value="en">Inglês</option></select></div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar vídeos por tema">{labTopics.map(item => <button key={item.value} aria-pressed={topic === item.value} onClick={() => setTopic(item.value)} className={`min-h-10 rounded-full border px-4 text-xs font-medium transition-colors ${topic === item.value ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:bg-secondary'}`}>{item.label}</button>)}</div>
          <p aria-live="polite" className="text-xs text-muted-foreground">{videos.length} {videos.length === 1 ? 'referência encontrada' : 'referências encontradas'}</p>
          {videos.length ? <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{videos.map(video => { const Icon = TOPIC_ICONS[video.topic]; return <li key={video.videoId}><article className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card"><div className="relative flex h-36 items-center justify-center overflow-hidden bg-[#101d32] text-amber-200"><div className="absolute inset-5 rounded-full border border-amber-200/10" aria-hidden="true" /><Icon className="h-10 w-10" strokeWidth={1.25} aria-hidden="true" /><span className="absolute bottom-3 left-4 text-[11px] font-semibold uppercase tracking-[.15em]">{video.author}</span><span className="absolute bottom-3 right-3 rounded bg-slate-950/70 px-2 py-1 text-xs text-white">{videoDuration(video.durationSeconds)}</span></div><div className="flex flex-1 flex-col p-5"><p className="mb-2 text-xs text-muted-foreground">{video.language === 'pt' ? 'Português · legenda automática' : video.captionsPt ? 'Inglês · legenda PT identificada' : 'Inglês · legenda EN'}</p><h3 className="font-display text-lg font-bold leading-6">{video.title}</h3><p className="mb-4 mt-2 flex-1 text-sm leading-6 text-muted-foreground">{video.takeaway}</p><button className="flex min-h-11 w-full items-center justify-between rounded-xl border px-4 text-sm font-semibold hover:bg-secondary focus-visible:outline focus-visible:outline-2" onClick={event => { videoTrigger.current = event.currentTarget; setSelectedVideo(video); }} aria-label={`Ver referência: ${video.title}`}>Ver referência<Play className="h-4 w-4" aria-hidden="true" /></button></div></article></li>; })}</ul> : <div className="rounded-2xl border border-dashed p-9 text-center"><Search className="mx-auto mb-3 h-7 w-7 text-muted-foreground" aria-hidden="true" /><h3 className="font-semibold">Nenhum vídeo com esses filtros.</h3><Button variant="link" onClick={() => { setSearch(''); setTopic('all'); setLanguage('all'); }}>Limpar filtros</Button></div>}
          <p className="text-xs leading-5 text-muted-foreground">Metadados e descrições consultados em 20/10/2026. Disponibilidade, legendas e interfaces podem mudar. Nenhum player ou thumbnail do YouTube é carregado antes de sua ativação.</p>
        </TabsContent>
        <TabsContent value="codigo" className="space-y-6">
          <div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fontes primárias</p><h2 className="mt-2 font-display text-2xl font-bold">Não comece do escuro.</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Consulte o código e a documentação de quem constrói as ferramentas. Referência não é recomendação de instalar tudo.</p></div>
          <div className="grid gap-4 lg:grid-cols-2">{labRepositories.map(repo => <article key={repo.repo} className="rounded-2xl border bg-card p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="font-display text-lg font-bold">{repo.title}</h3><p className="mt-1 break-all font-mono text-xs text-muted-foreground">{repo.repo}</p></div><Code2 className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" /></div><p className="mt-4 text-sm leading-6">{repo.purpose}</p><p className="mt-3 text-xs font-semibold">Licença identificada: {repo.license}</p><p className="mt-2 text-xs leading-5 text-muted-foreground">{repo.caution}</p><div className="mt-4 flex flex-wrap gap-4"><a className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline underline-offset-4" href={`https://github.com/${repo.repo}`} target="_blank" rel="noopener noreferrer">Repositório<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a><a className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground underline underline-offset-4" href={repo.docs} target="_blank" rel="noopener noreferrer">Documentação<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a></div></article>)}</div>
          <p className="flex gap-2 text-xs leading-5 text-muted-foreground"><LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />Licenças identificadas em 20/10/2026. Leia o arquivo de licença e as condições aplicáveis à versão que pretende usar. Não cole credenciais, dados de clientes ou conteúdo pago em repositórios públicos.</p>
        </TabsContent>
      </Tabs>
    </div>
    {selectedVideo && <LabVideoDialog key={selectedVideo.videoId} video={selectedVideo} onClose={closeVideo} />}
  </MembersLayout>;
}
