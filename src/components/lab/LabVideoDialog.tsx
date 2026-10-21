import { useState } from 'react';
import { ExternalLink, Play, ShieldCheck, ClipboardCheck, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { videoDuration, youtubeEmbedUrl, youtubeWatchUrl, type LabVideo } from '@/lib/labResources';

export function LabVideoDialog({ video, onClose }: { video: LabVideo; onClose: () => void }) {
  const [activated, setActivated] = useState(false);
  const embed = youtubeEmbedUrl(video.videoId);
  const watch = youtubeWatchUrl(video.videoId);
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent onKeyDownCapture={event => { if (event.key === 'Escape' && !event.defaultPrevented) { event.preventDefault(); event.stopPropagation(); onClose(); } }} className="max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-3xl overflow-y-auto rounded-2xl p-5 sm:p-7">
      <div className="pr-7"><p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Referência externa · {video.author}</p><DialogTitle className="font-display text-2xl leading-tight">{video.title}</DialogTitle><DialogDescription className="mt-2">{video.originalTitle}</DialogDescription></div>
      <p className="text-sm text-muted-foreground">{videoDuration(video.durationSeconds)} · {video.language === 'pt' ? 'Português · legenda automática' : video.captionsPt ? 'Inglês · legenda em português identificada' : 'Inglês · tradução depende do player'}</p>
      <div className="overflow-hidden rounded-xl border bg-slate-950 text-slate-100">
        {activated && embed ? <iframe title={`${video.originalTitle} — canal ${video.author}`} src={embed} className="aspect-video w-full border-0" allow="encrypted-media; fullscreen; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /> : <div className="flex min-h-[230px] flex-col items-center justify-center px-5 py-8 text-center">
          <ShieldCheck className="mb-3 h-7 w-7 text-amber-200" aria-hidden="true" />
          <p className="max-w-md text-sm leading-relaxed text-slate-200">O vídeo só conecta ao YouTube quando você ativa o player. O serviço externo poderá receber dados de navegação e aplicar suas próprias políticas.</p>
          <Button className="mt-5 min-h-12 bg-amber-200 text-slate-950 hover:bg-amber-100" onClick={() => setActivated(true)} disabled={!embed}><Play className="mr-2 h-4 w-4" />Carregar vídeo do YouTube</Button>
          <p className="mt-3 text-xs text-slate-300">Sem reprodução automática. A autoria permanece com {video.author}.</p>
        </div>}
      </div>
      {watch && <a href={watch} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium underline underline-offset-4"><ExternalLink className="h-4 w-4" aria-hidden="true" />Abrir no YouTube — alternativa ao player</a>}
      <section className="rounded-xl border border-accent/30 bg-accent/5 p-4" aria-labelledby="video-exercise-title"><h3 id="video-exercise-title" className="flex items-center gap-2 font-semibold"><ClipboardCheck className="h-4 w-4" aria-hidden="true" />Depois de assistir, faça</h3><p className="mt-2 text-sm leading-7">{video.exercise}</p></section>
      <div className="flex gap-2 text-sm leading-6 text-muted-foreground"><AlertCircle className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" /><p>{video.caution}</p></div>
      <p className="text-xs leading-5 text-muted-foreground">Publicação do autor: {new Date(video.publishedAt).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}. Metadados e descrição conferidos em 20/10/2026; não representa revisão integral do vídeo. Assistir não marca uma aula como concluída.</p>
    </DialogContent>
  </Dialog>;
}
