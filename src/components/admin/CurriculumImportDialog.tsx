import { useEffect, useId, useReducer, useRef, type ChangeEvent, type RefObject } from 'react';
import { AlertTriangle, CheckCircle2, Circle, Loader2, RotateCcw, Upload, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { databaseRpc } from '@/lib/databaseRpc';
import { formatMinutes, TRACKS } from '@/lib/curriculum';
import { parseCurriculumPack, summarizePack, type CurriculumPack, type PackSummary } from '@/lib/curriculumPack';
import {
  runCurriculumImport, validatePackFile,
  type FinalizeImportReport, type ImportEvent, type ModuleImportResult, type RpcCaller,
} from '@/lib/curriculumImport';

type ModuleStatus = 'pending' | 'running' | 'done' | 'error';

interface ImportState {
  fileName: string | null;
  reading: boolean;
  issues: string[];
  pack: CurriculumPack | null;
  summary: PackSummary | null;
  statuses: ModuleStatus[];
  results: Array<ModuleImportResult | null>;
  running: boolean;
  finalizing: boolean;
  /** `index` null means the finalize step failed. */
  failure: { index: number | null; message: string } | null;
  report: FinalizeImportReport | null;
}

type ImportAction =
  | { type: 'read-start'; fileName: string }
  | { type: 'read-failed'; issues: string[] }
  | { type: 'read-ok'; pack: CurriculumPack }
  | { type: 'run-start' }
  | { type: 'run-end' }
  | { type: 'progress'; event: ImportEvent };

const INITIAL_STATE: ImportState = {
  fileName: null, reading: false, issues: [], pack: null, summary: null, statuses: [], results: [],
  running: false, finalizing: false, failure: null, report: null,
};

function replaceAt<T>(items: T[], index: number, value: T): T[] {
  return items.map((item, i) => (i === index ? value : item));
}

function applyProgress(state: ImportState, event: ImportEvent): ImportState {
  switch (event.type) {
    case 'module-start': return { ...state, statuses: replaceAt(state.statuses, event.index, 'running') };
    case 'module-done': return { ...state, statuses: replaceAt(state.statuses, event.index, 'done'), results: replaceAt(state.results, event.index, event.result) };
    case 'module-error': return { ...state, statuses: replaceAt(state.statuses, event.index, 'error'), failure: { index: event.index, message: event.message } };
    case 'finalize-start': return { ...state, finalizing: true };
    case 'finalize-done': return { ...state, finalizing: false, report: event.report };
    case 'finalize-error': return { ...state, finalizing: false, failure: { index: null, message: event.message } };
  }
}

function reducer(state: ImportState, action: ImportAction): ImportState {
  switch (action.type) {
    case 'read-start': return { ...INITIAL_STATE, fileName: action.fileName, reading: true };
    case 'read-failed': return { ...state, reading: false, issues: action.issues };
    case 'read-ok': return {
      ...state,
      reading: false,
      pack: action.pack,
      summary: summarizePack(action.pack),
      statuses: action.pack.modules.map((): ModuleStatus => 'pending'),
      results: action.pack.modules.map(() => null),
    };
    case 'run-start': return { ...state, running: true, failure: null, report: null };
    case 'run-end': return { ...state, running: false, finalizing: false };
    case 'progress': return applyProgress(state, action.event);
  }
}

const callRpc: RpcCaller = (functionName, args) => databaseRpc<unknown>(functionName, args);

function plural(count: number, singular: string, pluralForm: string): string {
  return `${count.toLocaleString('pt-BR')} ${count === 1 ? singular : pluralForm}`;
}

function PaidContentWarning() {
  return (
    <Alert role="note" className="border-amber-500/50 bg-amber-500/10">
      <AlertTriangle className="h-4 w-4 !text-amber-600 dark:!text-amber-400" aria-hidden="true" />
      <AlertTitle>Conteúdo pago: nunca publique este arquivo</AlertTitle>
      <AlertDescription>
        O pacote traz o texto completo das aulas, que é o produto vendido. Nunca faça commit dele no repositório
        público (GitHub), não envie por e-mail nem deixe em pastas compartilhadas. Guarde-o fora da pasta do
        projeto e apague cópias temporárias depois de importar.
      </AlertDescription>
    </Alert>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-secondary/60 p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-semibold text-foreground [overflow-wrap:anywhere]">{typeof value === 'number' ? value.toLocaleString('pt-BR') : value}</dd>
    </div>
  );
}

const STATUS_LABELS: Record<ModuleStatus, string> = { pending: 'Pendente', running: 'Importando', done: 'Importado', error: 'Falhou' };

function StatusIcon({ status }: { status: ModuleStatus }) {
  const icon = {
    pending: <Circle className="h-4 w-4 text-muted-foreground" aria-hidden="true" />,
    running: <Loader2 className="h-4 w-4 animate-spin text-accent" aria-hidden="true" />,
    done: <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" aria-hidden="true" />,
    error: <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" aria-hidden="true" />,
  }[status];
  return (
    <span className="mt-0.5 shrink-0">
      {icon}
      <span className="sr-only">{STATUS_LABELS[status]}: </span>
    </span>
  );
}

interface ModuleListProps {
  pack: CurriculumPack;
  statuses: ModuleStatus[];
  results: Array<ModuleImportResult | null>;
  listRef: RefObject<HTMLOListElement>;
}

function ModuleList({ pack, statuses, results, listRef }: ModuleListProps) {
  return (
    // Scrollable region: focusable so keyboard users can scroll it too.
    <ol
      ref={listRef}
      tabIndex={0}
      aria-label="Módulos do pacote"
      className="relative max-h-72 divide-y divide-border/60 overflow-y-auto rounded-lg border border-border/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {pack.modules.map((module, index) => {
        const result = results[index];
        return (
          <li key={module.id} className="flex items-start gap-3 p-3">
            <StatusIcon status={statuses[index] ?? 'pending'} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground [overflow-wrap:anywhere]">
                <span className="font-mono text-xs text-muted-foreground">{module.code}</span>{' '}
                {module.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {plural(module.lessons.length, 'aula', 'aulas')} · {module.hours_label} · {module.trails.map((trail) => TRACKS[trail].shortLabel).join(', ')}
                {module.is_star && ' · módulo-estrela'}
              </p>
              {result && (result.lessons !== null || result.quizzes !== null) && (
                <p className="text-xs text-green-700 dark:text-green-400">
                  Gravado: {[result.lessons !== null ? plural(result.lessons, 'aula', 'aulas') : null, result.quizzes !== null ? plural(result.quizzes, 'quiz', 'quizzes') : null].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function ReportAlert({ report, summary }: { report: FinalizeImportReport; summary: PackSummary }) {
  return (
    <Alert role="note" className="border-green-600/40 bg-green-600/10">
      <CheckCircle2 className="h-4 w-4 !text-green-700 dark:!text-green-400" aria-hidden="true" />
      <AlertTitle>Importação concluída</AlertTitle>
      <AlertDescription className="space-y-1">
        <p>{plural(summary.modules, 'módulo', 'módulos')} e {plural(summary.lessons, 'aula', 'aulas')} gravados; o curso e os módulos do pacote estão publicados.</p>
        {report.archivedLessons !== null && (
          <p>
            {plural(report.archivedLessons, 'aula antiga foi movida', 'aulas antigas foram movidas')} para o módulo oculto
            “Arquivo — aulas da versão anterior” (o progresso dos alunos foi preservado).
          </p>
        )}
        {report.hiddenModules !== null && <p>{plural(report.hiddenModules, 'módulo antigo foi ocultado', 'módulos antigos foram ocultados')}.</p>}
      </AlertDescription>
    </Alert>
  );
}

interface CurriculumImportDialogProps {
  onClose: () => void;
  /** Called after a run that wrote to the database, with the imported course id. */
  onImported: (courseId: string) => void;
}

export function CurriculumImportDialog({ onClose, onImported }: CurriculumImportDialogProps) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const mounted = useRef(true);
  const inputId = useId();
  const { pack, summary, statuses, failure, report, running, finalizing } = state;

  const outcomeRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const runningIndex = statuses.indexOf('running');

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  // The Import button sits at the end of a long dialog: bring the outcome into view when it arrives.
  useEffect(() => {
    if (failure || report) outcomeRef.current?.scrollIntoView({ block: 'nearest' });
  }, [failure, report]);

  // Keep the module being imported centred inside the list without moving the dialog itself.
  useEffect(() => {
    const list = listRef.current;
    const item = runningIndex >= 0 ? list?.children[runningIndex] : null;
    if (list && item instanceof HTMLElement) list.scrollTop = item.offsetTop - (list.clientHeight - item.offsetHeight) / 2;
  }, [runningIndex]);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || running) return;
    dispatch({ type: 'read-start', fileName: file.name });
    const problem = validatePackFile(file);
    if (problem) {
      dispatch({ type: 'read-failed', issues: [problem] });
      return;
    }
    try {
      const parsed = parseCurriculumPack(await file.text());
      if (!mounted.current) return;
      dispatch('pack' in parsed ? { type: 'read-ok', pack: parsed.pack } : { type: 'read-failed', issues: parsed.issues });
    } catch (error) {
      console.error('[AdminCursos] could not read the curriculum pack', { fileName: file.name, error });
      if (mounted.current) dispatch({ type: 'read-failed', issues: ['Não foi possível ler o arquivo. Escolha-o de novo.'] });
    }
  };

  const handleImport = async () => {
    if (!pack || running) return;
    const startAt = failure ? (failure.index ?? pack.modules.length) : 0;
    dispatch({ type: 'run-start' });
    const outcome = await runCurriculumImport(pack, callRpc, {
      startAt,
      onEvent: (event) => { if (mounted.current) dispatch({ type: 'progress', event }); },
      shouldStop: () => !mounted.current,
    });
    if (!mounted.current) return;
    dispatch({ type: 'run-end' });
    if (outcome.status === 'done') {
      toast.success(`Currículo ${pack.version} importado`);
    } else if (outcome.status === 'failed') {
      const code = outcome.failedIndex !== null ? pack.modules[outcome.failedIndex].code : 'finalização';
      console.error('[AdminCursos] curriculum import stopped', { version: pack.version, step: code, message: outcome.message });
      toast.error(`A importação parou em ${code}. Veja o detalhe na janela.`);
    }
    const wroteSomething = outcome.status === 'done' || (outcome.status === 'failed' && (outcome.failedIndex === null || outcome.failedIndex > startAt));
    if (wroteSomething) onImported(pack.course.id);
  };

  const doneCount = statuses.filter((status) => status === 'done').length;
  const totalSteps = pack ? pack.modules.length + 1 : 1;
  const progress = Math.round(((doneCount + (report ? 1 : 0)) / totalSteps) * 100);
  const failedCode = failure && pack && failure.index !== null ? pack.modules[failure.index].code : null;
  const statusText = running && runningIndex >= 0 && pack
    ? `Importando ${pack.modules[runningIndex].code} (${runningIndex + 1} de ${pack.modules.length})…`
    : finalizing
      ? 'Finalizando: arquivando aulas antigas, ocultando módulos fora do pacote e publicando…'
      : '';
  // Failures are announced by their role="alert"; everything else goes through one persistent live region.
  const announcement = report ? 'Importação concluída.' : statusText;
  const started = doneCount > 0 || running || failure !== null || report !== null;

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !running) onClose(); }}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
        onEscapeKeyDown={(event) => { if (running) event.preventDefault(); }}
        onInteractOutside={(event) => { if (running) event.preventDefault(); }}
      >
        <DialogHeader>
          <DialogTitle>Importar currículo</DialogTitle>
          <DialogDescription>
            Envie o pacote .json gerado por <code className="text-xs">scripts/curriculum/build-pack.mjs</code>. Cada módulo vai em
            uma chamada; repetir a importação é seguro porque ela atualiza os mesmos registros.
          </DialogDescription>
        </DialogHeader>

        <p role="status" aria-live="polite" className="sr-only">{announcement}</p>
        <PaidContentWarning />

        <div className="space-y-2">
          <Label htmlFor={inputId}>Pacote do currículo (.json)</Label>
          <Input id={inputId} type="file" accept=".json,application/json" onChange={handleFile} disabled={running || state.reading} className="cursor-pointer" />
          {state.fileName && (
            <p className="text-xs text-muted-foreground [overflow-wrap:anywhere]">
              {state.reading ? <>Lendo <strong>{state.fileName}</strong>…</> : <>Arquivo: <strong>{state.fileName}</strong></>}
            </p>
          )}
        </div>

        {state.issues.length > 0 && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" aria-hidden="true" />
            <AlertTitle>O pacote não passou na validação</AlertTitle>
            <AlertDescription>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-xs [overflow-wrap:anywhere]">
                {state.issues.map((issue) => <li key={issue}>{issue}</li>)}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {pack && summary && (
          <section aria-label="Resumo do pacote" className="space-y-4">
            <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label="Versão" value={summary.version} />
              <Stat label="Módulos" value={summary.modules} />
              <Stat label="Aulas" value={summary.lessons} />
              <Stat label="Projetos" value={summary.projects} />
              <Stat label="Perguntas de quiz" value={summary.questions} />
              <Stat label="Prompts" value={summary.prompts} />
              <Stat label="Carga total" value={formatMinutes(summary.minutes)} />
            </dl>

            {started && (
              <div className="space-y-1.5">
                <Progress value={progress} aria-label="Progresso da importação" />
                <p className="text-xs text-muted-foreground">
                  {doneCount.toLocaleString('pt-BR')} de {plural(pack.modules.length, 'módulo importado', 'módulos importados')}
                  {report ? ' · finalizado' : ''}
                </p>
                {statusText && <p aria-hidden="true" className="text-sm text-foreground">{statusText}</p>}
                {running && <p className="text-xs text-muted-foreground">Não feche esta janela até a importação terminar.</p>}
              </div>
            )}

            <div ref={outcomeRef} className="scroll-my-4 empty:hidden">
              {failure && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" aria-hidden="true" />
                  <AlertTitle>{failedCode ? `A importação parou em ${failedCode}` : 'A finalização falhou'}</AlertTitle>
                  <AlertDescription className="space-y-1">
                    <p className="[overflow-wrap:anywhere]">{failure.message}</p>
                    <p>
                      {failedCode ? 'Os módulos anteriores já foram gravados. ' : 'Todos os módulos foram gravados, mas as aulas antigas ainda não foram arquivadas nem o curso publicado. '}
                      Tentar de novo é seguro: a importação continua de onde parou.
                    </p>
                  </AlertDescription>
                </Alert>
              )}
              {report && <ReportAlert report={report} summary={summary} />}
            </div>

            <ModuleList pack={pack} statuses={statuses} results={state.results} listRef={listRef} />
          </section>
        )}

        <DialogFooter className="sticky -bottom-6 -mx-6 -mb-6 gap-2 border-t border-border/60 bg-background px-6 py-4 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose} disabled={running}>
            {report ? 'Fechar' : 'Cancelar'}
          </Button>
          <Button type="button" onClick={handleImport} disabled={!pack || running || report !== null} className="bg-accent text-accent-foreground hover:bg-accent/90">
            {running ? <Loader2 className="animate-spin" aria-hidden="true" /> : failure ? <RotateCcw aria-hidden="true" /> : <Upload aria-hidden="true" />}
            {running ? 'Importando…' : failure ? (failedCode ? `Tentar de novo a partir de ${failedCode}` : 'Tentar finalizar de novo') : report ? 'Importado' : pack ? `Importar ${plural(pack.modules.length, 'módulo', 'módulos')}` : 'Importar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
