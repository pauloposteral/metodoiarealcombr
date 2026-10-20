import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Download, Search, X } from 'lucide-react';
import { MembersLayout } from '@/components/members/MembersLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuthUser } from '@/hooks/useAuthUser';
import { safeContentUrl } from '@/lib/safeUrl';

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const formatLabel: Record<string, string> = { pdf: 'PDF', markdown: 'Modelo em texto', template: 'Template', checklist: 'Checklist', document: 'Documento', guide: 'Guia' };

export default function MembersMaterials() {
  const [search, setSearch] = useState('');
  const user = useAuthUser();
  const materials = useQuery({
    queryKey: ['materials', user.data?.id],
    enabled: Boolean(user.data?.id),
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.from('materials').select('id,title,description,type,url,category').order('category').order('title');
      if (error) throw error;
      return data ?? [];
    },
  });
  const terms = normalize(search.trim());
  const rows = (materials.data ?? []).filter(item => normalize(`${item.title} ${item.description ?? ''} ${item.category ?? ''}`).includes(terms));
  return <MembersLayout>
    <section className="mx-auto max-w-5xl space-y-6" aria-labelledby="materials-title">
      <header><p className="text-sm text-muted-foreground">Sua biblioteca de apoio</p><h1 id="materials-title" className="text-3xl font-bold">Materiais para colocar em prática</h1><p className="mt-2 text-muted-foreground">Abra um modelo, adapte ao seu trabalho e guarde a versão que você conferiu.</p></header>
      <div className="relative"><label htmlFor="material-search" className="sr-only">Buscar materiais</label><Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-muted-foreground" aria-hidden="true" /><Input id="material-search" type="search" className="pl-10 pr-12" placeholder="Buscar por tema ou módulo" value={search} onChange={event => setSearch(event.target.value)} />{search && <Button type="button" size="icon" variant="ghost" className="absolute right-1 top-0" aria-label="Limpar busca" onClick={() => { setSearch(''); document.getElementById('material-search')?.focus(); }}><X size={18} /></Button>}</div>
      {(user.isPending || (user.data && materials.isPending)) ? <p role="status" className="py-12 text-center">Carregando materiais…</p> : materials.isError ? <div role="alert" className="rounded-xl border p-6"><h2 className="font-semibold">Não foi possível carregar a biblioteca.</h2><p className="mt-2 text-muted-foreground">Confira sua conexão. Seus materiais não foram alterados.</p><Button className="mt-4" onClick={() => void materials.refetch()}>Tentar novamente</Button></div> : <>
        <p className="text-sm text-muted-foreground" aria-live="polite">{rows.length} {rows.length === 1 ? 'material disponível' : 'materiais disponíveis'}</p>
        {rows.length ? <div className="grid gap-4 md:grid-cols-2">{rows.map(item => {
          const url = item.url ? safeContentUrl(item.url) : undefined;
          const downloadable = Boolean(url && (url.startsWith('/recursos/') || url.startsWith('https://metodoiareal.com.br/recursos/')));
          return <article key={item.id} className="flex flex-col rounded-2xl border bg-card p-6"><p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{item.category ?? 'Apoio ao estudo'} · {formatLabel[item.type] ?? 'Material'}</p><h2 className="mt-3 text-lg font-semibold">{item.title}</h2>{item.description && <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>}{url ? <Button asChild variant="outline" className="mt-5 justify-start"><a href={url} download={downloadable ? '' : undefined} target={downloadable ? undefined : '_blank'} rel="noopener noreferrer"><Download className="mr-2 h-4 w-4" />{downloadable ? 'Baixar modelo' : 'Abrir material'}</a></Button> : <p className="mt-5 text-sm text-muted-foreground">Arquivo ainda não disponível. Consulte o suporte.</p>}</article>;
        })}</div> : <div className="rounded-2xl border border-dashed p-8 text-center"><BookOpen className="mx-auto mb-3 h-8 w-8 text-muted-foreground" aria-hidden="true" /><h2 className="font-semibold">{search ? 'Nenhum material encontrado.' : 'Nenhum material liberado para esta conta neste momento.'}</h2><p className="mt-2 text-muted-foreground">{search ? 'Tente outro termo ou limpe a busca.' : 'Você pode começar pelos guias gratuitos enquanto consulta seu acesso.'}</p></div>}
      </>}
      <aside className="rounded-2xl border bg-muted/30 p-6"><h2 className="font-semibold">Guias gratuitos, sem cadastro</h2><p className="mt-2 text-sm text-muted-foreground">Roteiros originais com exemplos, checklists e modelos editáveis em texto. Materiais para aplicar no seu trabalho e acompanhar seu estudo.</p><Button asChild variant="link" className="mt-2 px-0"><a href="/aprender">Explorar os 13 guias →</a></Button></aside>
    </section>
  </MembersLayout>;
}
