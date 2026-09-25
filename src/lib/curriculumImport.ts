import type { CurriculumPack, PackModule } from './curriculumPack';

/**
 * Admin curriculum import (/admin/cursos → "Importar currículo").
 * One module per RPC call keeps each request small and lets the admin resume after a failure:
 * the server upserts by deterministic ids, so repeating a module is safe.
 */

export const IMPORT_MODULE_RPC = 'admin_import_curriculum_module';
export const FINALIZE_IMPORT_RPC = 'admin_finalize_curriculum_import';
/** Largest file accepted by the picker (the complete 13-module pack is a few MB). */
export const MAX_PACK_BYTES = 20 * 1024 * 1024;

export interface ModuleImportPayload {
  format: CurriculumPack['format'];
  version: string;
  course: CurriculumPack['course'];
  module: PackModule;
}

export interface FinalizeImportPayload {
  format: CurriculumPack['format'];
  course_id: string;
  module_codes: string[];
  lesson_ids: string[];
}

export function buildModuleImportPayload(pack: CurriculumPack, module: PackModule): ModuleImportPayload {
  return { format: pack.format, version: pack.version, course: pack.course, module };
}

export function buildFinalizeImportPayload(pack: CurriculumPack): FinalizeImportPayload {
  return {
    format: pack.format,
    course_id: pack.course.id,
    module_codes: pack.modules.map((module) => module.code),
    lesson_ids: pack.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id)),
  };
}

/** Checks the picked file before reading it; returns a pt-BR message or null when acceptable. */
export function validatePackFile(file: { name: string; size: number }): string | null {
  if (!/\.json$/i.test(file.name)) return 'Escolha o arquivo .json gerado por scripts/curriculum/build-pack.mjs.';
  if (file.size === 0) return 'O arquivo está vazio.';
  if (file.size > MAX_PACK_BYTES) {
    const megabytes = (file.size / 1024 / 1024).toLocaleString('pt-BR', { maximumFractionDigits: 1 });
    return `O arquivo tem ${megabytes} MB e o limite é ${MAX_PACK_BYTES / 1024 / 1024} MB.`;
  }
  return null;
}

export interface ModuleImportResult {
  moduleId: string | null;
  code: string | null;
  lessons: number | null;
  quizzes: number | null;
}

export interface FinalizeImportReport {
  archivedLessons: number | null;
  hiddenModules: number | null;
  archiveModuleId: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Functions may answer with a json object or with a one-row set; both are accepted. */
function firstRecord(data: unknown): Record<string, unknown> | null {
  const value = Array.isArray(data) ? data[0] : data;
  return isRecord(value) ? value : null;
}

/** Counts arrive as numbers, bigint strings or the affected rows themselves. */
function asCount(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && /^\d+$/.test(value)) return Number(value);
  if (Array.isArray(value)) return value.length;
  return null;
}

function asText(value: unknown): string | null {
  return typeof value === 'string' && value !== '' ? value : null;
}

export function parseModuleImportResult(data: unknown): ModuleImportResult {
  const row = firstRecord(data);
  return {
    moduleId: asText(row?.module_id),
    code: asText(row?.code),
    lessons: asCount(row?.lessons),
    quizzes: asCount(row?.quizzes),
  };
}

export function parseFinalizeImportReport(data: unknown): FinalizeImportReport {
  const row = firstRecord(data);
  return {
    archivedLessons: asCount(row?.archived_lessons),
    hiddenModules: asCount(row?.hidden_modules),
    archiveModuleId: asText(row?.archive_module_id),
  };
}

const MAX_ERROR_LENGTH = 400;

/** Maps Supabase/PostgREST/network failures to an actionable pt-BR message. */
export function describeImportError(error: unknown, functionName?: string): string {
  const fields = isRecord(error) ? error : {};
  const message = typeof fields.message === 'string' ? fields.message : typeof error === 'string' ? error : '';
  const code = typeof fields.code === 'string' ? fields.code : '';
  const target = functionName ? ` ${functionName}` : '';

  if (code === 'PGRST202' || code === '42883' || /could not find the function/i.test(message)) {
    return `A função${target} não existe neste banco. Aplique a migração do currículo (20260925000000_curriculum_platform.sql) e tente de novo.`;
  }
  if (code === '42501' || /permission denied|forbidden/i.test(message)) {
    return 'Sem permissão para importar. Entre com uma conta de administrador e tente de novo.';
  }
  if (code === 'PGRST301' || code === 'PGRST303' || /jwt/i.test(message)) {
    return 'Sua sessão expirou. Entre de novo e repita a importação; os módulos já gravados podem ser reenviados com segurança.';
  }
  if (code === '57014' || /timeout|timed out/i.test(message)) {
    return 'O servidor demorou demais para responder. Tente de novo: repetir a importação é seguro.';
  }
  if (/failed to fetch|networkerror|network request failed|load failed/i.test(message)) {
    return 'Falha de conexão com o servidor. Verifique a internet e tente de novo.';
  }
  const extras = [fields.details, fields.hint].filter((value): value is string => typeof value === 'string' && value !== '');
  const text = [message || 'Erro desconhecido.', ...extras].join(' — ');
  return text.length > MAX_ERROR_LENGTH ? `${text.slice(0, MAX_ERROR_LENGTH - 1)}…` : text;
}

export type RpcCaller = (functionName: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;

export type ImportEvent =
  | { type: 'module-start'; index: number }
  | { type: 'module-done'; index: number; result: ModuleImportResult }
  | { type: 'module-error'; index: number; message: string }
  | { type: 'finalize-start' }
  | { type: 'finalize-done'; report: FinalizeImportReport }
  | { type: 'finalize-error'; message: string };

export type ImportOutcome =
  | { status: 'done'; report: FinalizeImportReport }
  /** `failedIndex` is null when the finalize step failed after every module was written. */
  | { status: 'failed'; failedIndex: number | null; message: string }
  | { status: 'stopped'; nextIndex: number };

export interface RunImportOptions {
  /** Module index to resume from; `pack.modules.length` re-runs only the finalize step. */
  startAt?: number;
  onEvent?: (event: ImportEvent) => void;
  /** Checked before each call, e.g. to stop when the dialog unmounts. */
  shouldStop?: () => boolean;
}

/** `failure` is null on success; the app compiles without strictNullChecks, so no boolean discriminant. */
interface CallResult {
  data: unknown;
  failure: string | null;
}

async function call(rpc: RpcCaller, functionName: string, payload: object): Promise<CallResult> {
  try {
    const { data, error } = await rpc(functionName, { payload });
    return error ? { data: null, failure: describeImportError(error, functionName) } : { data, failure: null };
  } catch (caught) {
    return { data: null, failure: describeImportError(caught, functionName) };
  }
}

/**
 * Imports the pack sequentially (one module per call), stops at the first failure and only
 * finalizes (archive old lessons, hide old modules, publish) after every module was written.
 */
export async function runCurriculumImport(pack: CurriculumPack, rpc: RpcCaller, options: RunImportOptions = {}): Promise<ImportOutcome> {
  const { startAt = 0, onEvent, shouldStop } = options;
  for (let index = Math.max(0, startAt); index < pack.modules.length; index += 1) {
    if (shouldStop?.()) return { status: 'stopped', nextIndex: index };
    onEvent?.({ type: 'module-start', index });
    const response = await call(rpc, IMPORT_MODULE_RPC, buildModuleImportPayload(pack, pack.modules[index]));
    if (response.failure !== null) {
      onEvent?.({ type: 'module-error', index, message: response.failure });
      return { status: 'failed', failedIndex: index, message: response.failure };
    }
    onEvent?.({ type: 'module-done', index, result: parseModuleImportResult(response.data) });
  }
  if (shouldStop?.()) return { status: 'stopped', nextIndex: pack.modules.length };
  onEvent?.({ type: 'finalize-start' });
  const response = await call(rpc, FINALIZE_IMPORT_RPC, buildFinalizeImportPayload(pack));
  if (response.failure !== null) {
    onEvent?.({ type: 'finalize-error', message: response.failure });
    return { status: 'failed', failedIndex: null, message: response.failure };
  }
  const report = parseFinalizeImportReport(response.data);
  onEvent?.({ type: 'finalize-done', report });
  return { status: 'done', report };
}
