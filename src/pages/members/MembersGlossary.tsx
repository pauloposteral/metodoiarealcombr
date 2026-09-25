import { useEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BookA, Search, X } from 'lucide-react';
import { MembersLayout } from '@/components/members/MembersLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GLOSSARY, GLOSSARY_UPDATED_AT, type GlossaryTerm } from '@/data/glossary';
import { formatDateOnly } from '@/lib/dateOnly';
import {
  anchorIdFromHash, filterGlossary, findGlossaryTerm, GLOSSARY_ANCHOR_PREFIX, glossaryAnchorId, groupGlossaryByLetter, INDEX_LETTERS,
  letterAnchorId, type GlossaryLetterGroup,
} from '@/lib/resources';

const INDEX_ID = 'indice-alfabetico';

/** Scrolls to and focuses the element named by the URL fragment (links from ⌘K and related terms). */
function useScrollToHash(hash: string) {
  useEffect(() => {
    const id = anchorIdFromHash(hash);
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    // The global `scroll-behavior: smooth` would animate even for people who asked for less motion.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'instant' : 'smooth' });
    target.focus({ preventScroll: true });
  }, [hash]);
}

function RelatedTerms({ names, onBeforeJump }: { names: string[]; onBeforeJump: (anchorId: string) => void }) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
      <span className="text-muted-foreground">Veja também:</span>
      {names.map((name) => {
        const related = findGlossaryTerm(GLOSSARY, name);
        if (!related) return <span key={name} className="rounded-full bg-secondary px-2.5 py-1 text-muted-foreground">{name}</span>;
        const anchorId = glossaryAnchorId(related.term);
        return (
          <a
            key={name}
            href={`#${anchorId}`}
            onClick={() => onBeforeJump(anchorId)}
            className="rounded-full border border-border px-2.5 py-1 font-medium text-foreground transition-colors hover:border-accent hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {related.term}
          </a>
        );
      })}
    </div>
  );
}

function TermCard({ term, onBeforeJump }: { term: GlossaryTerm; onBeforeJump: (anchorId: string) => void }) {
  const anchorId = glossaryAnchorId(term.term);
  return (
    <article
      id={anchorId}
      tabIndex={-1}
      aria-labelledby={`${anchorId}-titulo`}
      className="scroll-mt-24 rounded-2xl border border-border/50 bg-card p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 id={`${anchorId}-titulo`} className="font-display text-lg font-bold text-foreground [overflow-wrap:anywhere]">{term.term}</h3>
          {term.english && (
            <p className="text-xs text-muted-foreground">
              Em inglês: <span lang="en" className="font-medium text-foreground">{term.english}</span>
            </p>
          )}
        </div>
        {term.moduleCode && (
          <Link
            to="/membros/modulos"
            className="shrink-0 rounded-md border border-border px-2 py-0.5 font-mono text-xs font-medium text-foreground transition-colors hover:border-accent hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="sr-only">Ensinado no módulo </span>
            {term.moduleCode}
          </Link>
        )}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-foreground">{term.definition}</p>
      {term.example && (
        <p className="mt-3 rounded-lg bg-secondary/60 p-3 text-sm leading-relaxed text-foreground [overflow-wrap:anywhere]">
          <span className="font-semibold">Exemplo: </span>
          {term.example}
        </p>
      )}
      {term.related && term.related.length > 0 && <RelatedTerms names={term.related} onBeforeJump={onBeforeJump} />}
    </article>
  );
}

function LetterIndex({ groups }: { groups: GlossaryLetterGroup[] }) {
  const counts = new Map(groups.map((group) => [group.letter, group.terms.length]));
  return (
    <nav id={INDEX_ID} tabIndex={-1} aria-label="Índice alfabético" className="scroll-mt-24 focus:outline-none">
      <ul className="flex flex-wrap gap-1">
        {INDEX_LETTERS.map((letter) => {
          const count = counts.get(letter);
          const name = letter === '#' ? 'números e símbolos' : `letra ${letter}`;
          return (
            <li key={letter}>
              {count ? (
                <a
                  href={`#${letterAnchorId(letter)}`}
                  aria-label={`${name}: ${count} ${count === 1 ? 'termo' : 'termos'}`}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-sm font-semibold text-foreground transition-colors hover:border-accent hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {letter}
                </a>
              ) : (
                <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-md text-sm text-muted-foreground/50">
                  {letter}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function isHiddenTerm(hash: string, visible: GlossaryTerm[]): boolean {
  const id = anchorIdFromHash(hash);
  return id.startsWith(GLOSSARY_ANCHOR_PREFIX) && !visible.some((term) => glossaryAnchorId(term.term) === id);
}

function GlossaryContent() {
  const { hash } = useLocation();
  const [query, setQuery] = useState('');
  const terms = useMemo(() => filterGlossary(GLOSSARY, query), [query]);
  const [lastHash, setLastHash] = useState(hash);
  // A new link to a term hidden by the search (⌘K, shared URL) clears the search so the target exists.
  if (hash !== lastHash) {
    setLastHash(hash);
    if (query && isHiddenTerm(hash, terms)) setQuery('');
  }
  useScrollToHash(hash);

  const groups = useMemo(() => groupGlossaryByLetter(terms), [terms]);
  const updatedAt = formatDateOnly(GLOSSARY_UPDATED_AT);
  const searching = query.trim() !== '';

  // Related links point at terms that the current search may hide: clear it before the jump.
  const showAllBeforeJump = (anchorId: string) => {
    if (!document.getElementById(anchorId)) flushSync(() => setQuery(''));
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <BookA className="h-5 w-5 text-accent" aria-hidden="true" />
          Material de apoio
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">Glossário de IA</h1>
        <p className="mt-2 text-muted-foreground">
          Todo jargão do curso explicado em linguagem simples, com exemplo, termo em inglês e o módulo onde ele é ensinado.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {GLOSSARY.length} {GLOSSARY.length === 1 ? 'termo' : 'termos'}
          {updatedAt && <> · Atualizado em <time dateTime={GLOSSARY_UPDATED_AT}>{updatedAt}</time></>}
        </p>
      </header>

      <div className="relative">
        <label htmlFor="glossary-search" className="sr-only">Buscar no glossário</label>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          id="glossary-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar termo ou definição…"
          className="pl-9 pr-10 [&::-webkit-search-cancel-button]:appearance-none"
          autoComplete="off"
        />
        {searching && (
          <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2" onClick={() => setQuery('')} aria-label="Limpar busca">
            <X aria-hidden="true" />
          </Button>
        )}
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        {searching ? `${terms.length} ${terms.length === 1 ? 'termo encontrado' : 'termos encontrados'}` : ''}
      </p>

      {GLOSSARY.length === 0 ? (
        <p className="rounded-2xl border border-border/50 bg-card p-8 text-center text-muted-foreground">
          O glossário está sendo preparado. Volte em breve.
        </p>
      ) : (
        <>
          <LetterIndex groups={groups} />
          {groups.length === 0 ? (
            <div className="rounded-2xl border border-border/50 bg-card p-8 text-center">
              <p className="font-medium text-foreground">Nenhum termo encontrado para “{query.trim()}”.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tente outra palavra ou o nome em inglês. Sentiu falta de um termo? Conte para a gente no{' '}
                <Link to="/membros/suporte" className="font-medium text-foreground underline underline-offset-2">suporte</Link>.
              </p>
              <Button type="button" variant="outline" className="mt-4" onClick={() => setQuery('')}>Limpar busca</Button>
            </div>
          ) : (
            groups.map((group) => (
              <section key={group.letter} aria-labelledby={letterAnchorId(group.letter)} className="space-y-3">
                <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-1">
                  <h2 id={letterAnchorId(group.letter)} tabIndex={-1} className="scroll-mt-24 font-display text-xl font-bold text-foreground focus:outline-none">
                    <span className="sr-only">{group.letter === '#' ? 'Números e símbolos' : `Letra ${group.letter}`}</span>
                    <span aria-hidden="true">{group.letter}</span>
                  </h2>
                  <a href={`#${INDEX_ID}`} className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline">
                    Voltar ao índice
                  </a>
                </div>
                {group.terms.map((term) => <TermCard key={term.term} term={term} onBeforeJump={showAllBeforeJump} />)}
              </section>
            ))
          )}
        </>
      )}
    </div>
  );
}

export default function MembersGlossary() {
  return (
    <MembersLayout>
      <Helmet>
        <title>Glossário de IA | Método IA Real</title>
      </Helmet>
      <GlossaryContent />
    </MembersLayout>
  );
}
