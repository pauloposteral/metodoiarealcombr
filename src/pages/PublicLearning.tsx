import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import guides from '@/data/publicGuides.json';

export default function PublicLearning() {
  const { slug } = useParams();
  const guide = guides.find(item => item.slug === slug);
  const missing = Boolean(slug && !guide);
  return <div className="min-h-screen bg-slate-950 text-slate-100">
    {missing && <Helmet><title>Guia não encontrado | Método IA Real</title><meta name="robots" content="noindex,follow" /></Helmet>}
    <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 border-b border-slate-700 px-5 py-6"><a href="/" className="flex items-center gap-3 font-semibold"><img src="/favicon.png" alt="" width={36} height={36} />Método IA Real</a><nav aria-label="Navegação principal" className="flex gap-5 text-sm"><a href="/aprender">Guias gratuitos</a><a href="/auth?redirect=/membros">Entrar</a></nav></header>
    <main className="mx-auto max-w-6xl px-5 py-10">
      {missing ? <><h1 className="text-3xl font-bold">Guia não encontrado</h1><a href="/aprender" className="mt-6 inline-block text-amber-200 underline">Voltar aos guias gratuitos</a></> : guide ? <article className="max-w-3xl space-y-7">
        <a href="/aprender" className="text-sm text-amber-200">← Guias gratuitos · {guide.module}</a>
        <h1 className="text-4xl font-bold leading-tight">{guide.title}</h1><p className="text-lg leading-relaxed text-slate-300">{guide.intro}</p>
        <a className="inline-flex min-h-12 items-center rounded-xl bg-amber-200 px-6 font-semibold text-slate-950" href={`/recursos/${guide.slug}.md`} download>Baixar modelo</a>
        <h2 className="text-2xl font-semibold">Faça em etapas</h2><ol className="list-decimal space-y-5 pl-6 text-lg leading-relaxed">{guide.steps.map(step => <li key={step}>{step}</li>)}</ol>
        <h2 className="text-2xl font-semibold">Um exemplo para adaptar</h2><p className="rounded-xl border-l-4 border-amber-200 bg-slate-900 p-6 leading-relaxed">{guide.example}</p>
        <h2 className="text-2xl font-semibold">Seu modelo de trabalho</h2><pre className="whitespace-pre-wrap break-words rounded-xl bg-slate-900 p-5 text-sm leading-7">{guide.template}</pre>
        <h2 className="text-2xl font-semibold">Antes de concluir</h2><ul className="list-disc space-y-4 pl-6">{guide.checks.map(check => <li key={check}>{check}</li>)}</ul>
        <h2 className="text-2xl font-semibold">Referências e ajuda oficial</h2><ul className="space-y-3">{guide.sources.map(source => <li key={source.url}><a className="text-amber-200 underline" href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a></li>)}</ul>
      </article> : <><p className="text-sm uppercase tracking-wider text-amber-200">Aprenda. Crie. Aplique.</p><h1 className="mt-4 max-w-3xl text-5xl font-bold leading-tight">Uma tarefa real.<br />Um próximo passo.</h1><p className="mt-6 max-w-2xl text-xl leading-relaxed text-slate-300">Guias gratuitos para sair da curiosidade e praticar. Escolha um tema, use o modelo e confira o resultado.</p><div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{guides.map(item => <article key={item.slug} className="rounded-2xl border border-slate-700 bg-slate-900 p-6"><p className="text-xs uppercase tracking-wider text-amber-200">{item.module} · Guia gratuito</p><h2 className="mt-4 text-xl font-semibold">{item.title}</h2><p className="mt-4 leading-relaxed text-slate-300">{item.description}</p><a className="mt-5 inline-flex min-h-11 items-center text-amber-200 underline" href={`/aprender/${item.slug}`}>Ler e praticar →</a></article>)}</div></>}
    </main>
    <footer className="mx-auto max-w-6xl space-y-3 border-t border-slate-700 px-5 py-8 text-sm text-slate-300"><p>Recursos gratuitos originais · Método IA Real · Edição 20/10/2026</p><p>Os guias são apoio de estudo. Não substituem revisão profissional nem garantem resultados.</p><p><a href="/completo">Conhecer a formação</a> · <a href="/termos">Termos</a> · <a href="/privacidade">Privacidade</a></p></footer>
  </div>;
}
