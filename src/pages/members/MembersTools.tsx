import { useCallback, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ExternalLink, Info, Wrench } from 'lucide-react';
import { MembersLayout } from '@/components/members/MembersLayout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AI_TOOLS, AI_TOOLS_UPDATED_AT, TOOL_CATEGORY_LABELS, USD_BRL_REFERENCE, type AiTool, type ToolCategory } from '@/data/aiTools';
import { isReviewOverdue } from '@/lib/curriculum';
import { formatDateOnly } from '@/lib/dateOnly';
import { safeContentUrl } from '@/lib/safeUrl';
import { anchorIdFromHash, countToolsByCategory, filterTools, TOOL_ANCHOR_PREFIX, toolAnchorId, toolModuleCodes } from '@/lib/resources';

const ALL = 'todas';
/** Wide enough for the five-column table next to the sidebar; below it the page shows cards. */
const TABLE_QUERY = '(min-width: 1280px)';
const CATEGORY_KEYS = Object.keys(TOOL_CATEGORY_LABELS).filter((key): key is ToolCategory => key in TOOL_CATEGORY_LABELS);
const MODULE_CODES = toolModuleCodes(AI_TOOLS);
const CATEGORY_COUNTS = countToolsByCategory(AI_TOOLS);
const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function useMediaQuery(query: string): boolean {
  const subscribe = useCallback((onChange: () => void) => {
    const media = window.matchMedia(query);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [query]);
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}

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

function ExternalAnchor({ href, label, children }: { href: string | undefined; label: string; children: ReactNode }) {
  const safe = href ? safeContentUrl(href) : undefined;
  if (!safe || !safe.startsWith('https://')) return null;
  return (
    <a
      href={safe}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (abre em nova aba)`}
      className="inline-flex items-center gap-1 rounded-sm font-medium text-foreground underline underline-offset-2 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
      <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
    </a>
  );
}

function ToolLinks({ tool }: { tool: AiTool }) {
  return (
    <>
      <ExternalAnchor href={tool.url} label={`Site oficial: ${tool.name}`}>Site oficial</ExternalAnchor>
      <ExternalAnchor href={tool.pricingUrl} label={`Preços: ${tool.name}`}>Preços</ExternalAnchor>
    </>
  );
}

/**
 * WHY: only entries with a pricing source had their prices checked on `lastVerified`;
 * the others were only reviewed on that date and must not look price-verified.
 */
function VerifiedLabel({ tool }: { tool: AiTool }) {
  const date = tool.lastVerified;
  const formatted = formatDateOnly(date, 'short');
  if (!formatted) return null;
  if (!tool.pricingUrl) {
    return (
      <p className="text-muted-foreground">
        Preço não conferido aqui: consulte o site oficial · ficha revisada em <time dateTime={date}>{formatted}</time>
      </p>
    );
  }
  const stale = isReviewOverdue(date);
  return (
    <p className={stale ? 'font-medium text-amber-700 dark:text-amber-400' : 'text-muted-foreground'}>
      Preço conferido em <time dateTime={date}>{formatted}</time>
      {stale && ' · conferência antiga, confirme no site'}
    </p>
  );
}

function PlanList({ plans }: { plans: AiTool['plans'] }) {
  if (plans.length === 0) return <span className="text-muted-foreground">Nenhum plano pago listado</span>;
  return (
    <ul className="space-y-1.5">
      {plans.map((plan, index) => (
        <li key={`${plan.name}-${index}`}>
          <span className="font-semibold text-foreground">{plan.name}:</span> {plan.price}
          {plan.note && <span className="block text-xs text-muted-foreground">{plan.note}</span>}
        </li>
      ))}
    </ul>
  );
}

function ModuleLinks({ codes }: { codes: string[] }) {
  return (
    <span className="flex flex-wrap gap-1">
      {codes.map((code) => (
        <Link
          key={code}
          to="/membros/modulos"
          className="rounded border border-border px-1.5 py-0.5 font-mono text-[11px] font-medium text-foreground transition-colors hover:border-accent hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="sr-only">Módulo </span>
          {code}
        </Link>
      ))}
    </span>
  );
}

function Detail({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{term}</dt>
      <dd className="mt-0.5 text-foreground [overflow-wrap:anywhere]">{children}</dd>
    </div>
  );
}

function ToolCard({ tool }: { tool: AiTool }) {
  const anchorId = toolAnchorId(tool.id);
  return (
    <article
      id={anchorId}
      tabIndex={-1}
      aria-labelledby={`${anchorId}-nome`}
      className="flex scroll-mt-24 flex-col rounded-2xl border border-border/50 bg-card p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 id={`${anchorId}-nome`} className="font-display text-lg font-bold text-foreground [overflow-wrap:anywhere]">{tool.name}</h2>
          <p className="text-xs text-muted-foreground">{tool.company}</p>
        </div>
        <Badge variant="secondary" className="shrink-0">{TOOL_CATEGORY_LABELS[tool.category]}</Badge>
      </div>
      <p className="mt-2 text-sm text-foreground">{tool.whatFor}</p>
      <dl className="mt-4 space-y-3 text-sm">
        <Detail term="Plano grátis">{tool.freeTier}</Detail>
        <Detail term="Planos pagos"><PlanList plans={tool.plans} /></Detail>
        {tool.freeAlternative && <Detail term="Alternativa grátis">{tool.freeAlternative}</Detail>}
        {tool.moduleCodes.length > 0 && <Detail term="Onde aparece no curso"><ModuleLinks codes={tool.moduleCodes} /></Detail>}
      </dl>
      <div className="mt-auto space-y-2 pt-4 text-xs">
        <VerifiedLabel tool={tool} />
        <div className="flex flex-wrap gap-x-4 gap-y-1"><ToolLinks tool={tool} /></div>
      </div>
    </article>
  );
}

function ToolsTable({ tools }: { tools: AiTool[] }) {
  return (
    // contain: inline-size keeps a wide table from stretching the page; it scrolls inside instead.
    <div className="overflow-x-auto rounded-2xl border border-border/50 bg-card [contain:inline-size]">
      <table className="w-full table-fixed text-left text-sm">
        <caption className="sr-only">Ferramentas de IA com plano grátis, planos pagos, alternativa gratuita e data da última conferência dos preços</caption>
        <colgroup>
          <col className="w-[24%]" />
          <col className="w-[19%]" />
          <col className="w-[24%]" />
          <col className="w-[16%]" />
          <col className="w-[17%]" />
        </colgroup>
        <thead className="border-b border-border/50 bg-secondary/40 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th scope="col" className="p-3 font-semibold">Ferramenta</th>
            <th scope="col" className="p-3 font-semibold">Plano grátis</th>
            <th scope="col" className="p-3 font-semibold">Planos pagos</th>
            <th scope="col" className="p-3 font-semibold">Alternativa grátis</th>
            <th scope="col" className="p-3 font-semibold">Conferência e links</th>
          </tr>
        </thead>
        <tbody>
          {tools.map((tool) => (
            <tr
              key={tool.id}
              id={toolAnchorId(tool.id)}
              tabIndex={-1}
              className="scroll-mt-24 border-b border-border/30 align-top last:border-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            >
              <th scope="row" className="p-3 font-normal [overflow-wrap:anywhere]">
                <span className="block font-display font-bold text-foreground">{tool.name}</span>
                <span className="block text-xs text-muted-foreground">{tool.company} · {TOOL_CATEGORY_LABELS[tool.category]}</span>
                <span className="mt-1 block text-xs text-foreground">{tool.whatFor}</span>
                {tool.moduleCodes.length > 0 && <span className="mt-2 block"><ModuleLinks codes={tool.moduleCodes} /></span>}
              </th>
              <td className="p-3 text-foreground [overflow-wrap:anywhere]">{tool.freeTier}</td>
              <td className="p-3 text-foreground [overflow-wrap:anywhere]"><PlanList plans={tool.plans} /></td>
              <td className="p-3 text-foreground [overflow-wrap:anywhere]">
                {tool.freeAlternative ?? (
                  <>
                    <span aria-hidden="true" className="text-muted-foreground">—</span>
                    <span className="sr-only">Não listada</span>
                  </>
                )}
              </td>
              <td className="space-y-2 p-3 text-xs [overflow-wrap:anywhere]">
                <VerifiedLabel tool={tool} />
                <div className="flex flex-col items-start gap-1"><ToolLinks tool={tool} /></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PriceDisclaimer({ updatedAt }: { updatedAt: string | null }) {
  return (
    <Alert role="note">
      <Info className="h-4 w-4" aria-hidden="true" />
      <AlertTitle>Preços de referência</AlertTitle>
      <AlertDescription>
        Valores em dólar convertidos a {BRL.format(USD_BRL_REFERENCE)} por US$ 1, sem IOF e sem o spread do cartão, que
        aumentam o valor cobrado na fatura. Os preços mudam com frequência: confira sempre no site oficial antes de assinar.
        {updatedAt && <> Planilha atualizada em <time dateTime={AI_TOOLS_UPDATED_AT}>{updatedAt}</time>.</>}
      </AlertDescription>
    </Alert>
  );
}

function isHiddenTool(hash: string, visible: AiTool[]): boolean {
  const id = anchorIdFromHash(hash);
  return id.startsWith(TOOL_ANCHOR_PREFIX) && !visible.some((tool) => toolAnchorId(tool.id) === id);
}

function ToolsContent() {
  const { hash } = useLocation();
  const [category, setCategory] = useState<ToolCategory | null>(null);
  const [moduleCode, setModuleCode] = useState<string | null>(null);
  const tools = useMemo(() => filterTools(AI_TOOLS, { category, moduleCode }), [category, moduleCode]);
  const filtersActive = category !== null || moduleCode !== null;
  const [lastHash, setLastHash] = useState(hash);
  // A link to a tool hidden by the filters (⌘K search) clears them so the target exists.
  if (hash !== lastHash) {
    setLastHash(hash);
    if (filtersActive && isHiddenTool(hash, tools)) {
      setCategory(null);
      setModuleCode(null);
    }
  }
  useScrollToHash(hash);
  const showTable = useMediaQuery(TABLE_QUERY);
  const updatedAt = formatDateOnly(AI_TOOLS_UPDATED_AT);

  const clearFilters = () => {
    setCategory(null);
    setModuleCode(null);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Wrench className="h-5 w-5 text-accent" aria-hidden="true" />
          Planilha viva
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">Ferramentas e custos</h1>
        <p className="mt-2 text-muted-foreground">
          O que cada ferramenta do curso oferece de graça, quanto custam os planos pagos e qual alternativa gratuita usar.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {AI_TOOLS.length} {AI_TOOLS.length === 1 ? 'ferramenta' : 'ferramentas'}
          {updatedAt && <> · Atualizado em <time dateTime={AI_TOOLS_UPDATED_AT}>{updatedAt}</time></>}
        </p>
      </header>

      <PriceDisclaimer updatedAt={updatedAt} />

      {AI_TOOLS.length === 0 ? (
        <p className="rounded-2xl border border-border/50 bg-card p-8 text-center text-muted-foreground">
          A planilha de ferramentas está sendo atualizada. Volte em breve.
        </p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="min-w-0 space-y-1.5">
              <Label htmlFor="tools-category">Categoria</Label>
              <Select value={category ?? ALL} onValueChange={(value) => setCategory(CATEGORY_KEYS.find((key) => key === value) ?? null)}>
                <SelectTrigger id="tools-category"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todas as categorias ({AI_TOOLS.length})</SelectItem>
                  {CATEGORY_KEYS.map((key) => (
                    <SelectItem key={key} value={key} disabled={!CATEGORY_COUNTS.get(key)}>
                      {TOOL_CATEGORY_LABELS[key]} ({CATEGORY_COUNTS.get(key) ?? 0})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-0 space-y-1.5">
              <Label htmlFor="tools-module">Módulo do curso</Label>
              <Select value={moduleCode ?? ALL} onValueChange={(value) => setModuleCode(MODULE_CODES.includes(value) ? value : null)}>
                <SelectTrigger id="tools-module"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos os módulos</SelectItem>
                  {MODULE_CODES.map((code) => <SelectItem key={code} value={code}>{code}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex min-h-9 flex-wrap items-center justify-between gap-2">
            <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
              Mostrando {tools.length} de {AI_TOOLS.length} {AI_TOOLS.length === 1 ? 'ferramenta' : 'ferramentas'}
            </p>
            {filtersActive && (
              <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
                Limpar filtros
              </Button>
            )}
          </div>

          {tools.length === 0 ? (
            <div className="rounded-2xl border border-border/50 bg-card p-8 text-center">
              <p className="font-medium text-foreground">Nenhuma ferramenta com esses filtros.</p>
              <Button type="button" variant="outline" className="mt-4" onClick={clearFilters}>Limpar filtros</Button>
            </div>
          ) : showTable ? (
            <ToolsTable tools={tools} />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {tools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function MembersTools() {
  return (
    <MembersLayout>
      <Helmet>
        <title>Ferramentas e custos | Método IA Real</title>
      </Helmet>
      <ToolsContent />
    </MembersLayout>
  );
}
