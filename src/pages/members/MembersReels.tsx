import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Film, Lock } from 'lucide-react';
import { MembersLayout } from '@/components/members/MembersLayout';
import { PageError, PageLoading } from '@/components/members/PageStates';
import { ReelsWorkbook } from '@/components/practice/ReelsWorkbook';
import { MarkdownRenderer } from '@/components/course/MarkdownRenderer';
import { Button } from '@/components/ui/button';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useLesson } from '@/hooks/useLessonData';
import { REELS_LESSON_ID } from '@/lib/reelsWorkbook';

export default function MembersReels() {
  const user = useAuthUser(); const lesson = useLesson(REELS_LESSON_ID);
  return <MembersLayout><Helmet><title>Oficina de Reels | Método IA Real</title><meta name="robots" content="noindex,nofollow" /></Helmet>
    <div className="mx-auto max-w-6xl space-y-7">
      <header><Link to={`/membros/aula/${REELS_LESSON_ID}`} className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={16} />Voltar à aula de vídeo curto</Link><p className="mt-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold-dark dark:text-accent"><Film size={16} />Aprenda fazendo</p><h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Seu próximo Reel começa aqui.</h1><p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">Uma ideia, seis passos e um roteiro para gravar. Prática guiada, sem promessa de viralização.</p></header>
      {user.isPending || (user.data && lesson.isPending) ? <PageLoading label="Carregando a oficina…" /> : user.isError || lesson.isError ? <PageError title="Não foi possível carregar a oficina" onRetry={() => { void user.refetch(); void lesson.refetch(); }} /> : !lesson.data || !user.data ? <section className="rounded-2xl border bg-card p-7" aria-labelledby="reels-locked"><Lock className="h-6 w-6 text-muted-foreground" /><h2 id="reels-locked" className="mt-3 text-xl font-semibold">Esta oficina acompanha a aula de vídeo curto.</h2><p className="mt-2 text-sm text-muted-foreground">O conteúdo ainda não está liberado para esta conta. Você pode começar pelo guia gratuito ou conferir seu acesso.</p><div className="mt-5 flex flex-wrap gap-3"><Button asChild><Link to="/pricing">Ver opções de acesso</Link></Button><Button asChild variant="outline"><a href="/aprender/roteiro-video-ia">Abrir guia gratuito</a></Button></div></section> : <>
        <ReelsWorkbook key={user.data.id} userId={user.data.id} />
        <details className="rounded-2xl border bg-card p-5"><summary className="cursor-pointer font-semibold">Entender mais: conteúdo completo da aula</summary><div className="mt-5 max-w-3xl"><MarkdownRenderer content={lesson.data.content ?? ''} /></div></details>
        <p className="text-xs leading-relaxed text-muted-foreground">A oficina não conclui a aula automaticamente, não emite certificado e não publica na sua conta. Para guardar o resultado, baixe o roteiro e siga as orientações da aula.</p>
      </>}
    </div>
  </MembersLayout>;
}
