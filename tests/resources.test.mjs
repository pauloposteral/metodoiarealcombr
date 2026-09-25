import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCurriculumPack, CURRICULUM_PACK_FORMAT } from '../src/lib/curriculumPack.ts';
import {
  buildFinalizeImportPayload, buildModuleImportPayload, describeImportError, FINALIZE_IMPORT_RPC, IMPORT_MODULE_RPC,
  parseFinalizeImportReport, parseModuleImportResult, runCurriculumImport, validatePackFile,
} from '../src/lib/curriculumImport.ts';
import { buildHaystack, indexLetter, matchesSearch, normalizeText, rankMatch, searchTokens, slugify, toIlikePattern } from '../src/lib/textSearch.ts';
import { formatDateOnly, parseDateOnly } from '../src/lib/dateOnly.ts';
import { buildPromptLibrary, filterPromptEntries, groupPromptsByModule } from '../src/lib/promptLibrary.ts';
import {
  anchorIdFromHash, countToolsByCategory, filterGlossary, filterTools, findGlossaryTerm, glossaryAnchorId, groupGlossaryByLetter,
  letterAnchorId, searchGlossaryTerms, searchResources, searchTools, toolAnchorId, toolModuleCodes,
} from '../src/lib/resources.ts';
import {
  buildCoursePayload, buildLessonPayload, buildModulePayload, describeDeleteError, describeSaveError, nextOrderIndex,
  toCourseItemForm, validateCourseItemForm,
} from '../src/lib/adminCourseForm.ts';
import { GLOSSARY, GLOSSARY_UPDATED_AT } from '../src/data/glossary.ts';
import { AI_TOOLS, AI_TOOLS_UPDATED_AT, TOOL_CATEGORY_LABELS, USD_BRL_REFERENCE } from '../src/data/aiTools.ts';

// ---------------------------------------------------------------- fixtures

const uuid = (group, n) => `00000000-0000-4000-8${String(group).padStart(3, '0')}-${String(n).padStart(12, '0')}`;
const text = (label, length) => `${label} `.padEnd(length, 'x');

function makeLesson(moduleNumber, lessonNumber, overrides = {}) {
  const nn = String(moduleNumber).padStart(2, '0');
  const ll = String(lessonNumber).padStart(2, '0');
  return {
    id: uuid(100 + moduleNumber, lessonNumber),
    slug: `mod-${nn}-${ll}-aula-teste`,
    order_index: lessonNumber - 1,
    title: `Aula ${ll} do módulo ${nn}`,
    description: text('Descrição da aula de teste', 40),
    content: text('Conteúdo da aula de teste', 240),
    prompts: [text('Prompt de teste da aula', 40)],
    type: 'text',
    estimated_minutes: 10,
    is_free: false,
    reviewed_at: '2026-09-24',
    quiz: {
      id: uuid(200 + moduleNumber, lessonNumber),
      title: 'Fixação',
      questions: [{ question: 'Qual é a resposta?', options: ['A', 'B', 'C'], correct: 1, explanation: text('Explicação da resposta', 30) }],
      passing_score: 70,
      max_attempts: 3,
    },
    ...overrides,
  };
}

function makeModule(moduleNumber, lessonCount = 2) {
  const nn = String(moduleNumber).padStart(2, '0');
  const lessons = Array.from({ length: lessonCount }, (_, i) => makeLesson(moduleNumber, i + 1));
  lessons[lessons.length - 1] = { ...lessons[lessons.length - 1], type: 'project', estimated_minutes: 40, quiz: null, prompts: [] };
  return {
    id: uuid(0, moduleNumber + 1),
    code: `MOD-${nn}`,
    order_index: moduleNumber,
    slug: `mod-${nn}-modulo-teste`,
    title: `Módulo de teste ${nn}`,
    description: text('Descrição do módulo de teste', 40),
    intro: 'Introdução',
    hours_label: '~1h',
    trails: ['carreira'],
    project_title: 'Projeto do módulo de teste',
    is_star: false,
    lessons,
  };
}

function makePack(moduleCount = 3) {
  const raw = {
    format: CURRICULUM_PACK_FORMAT,
    version: '2026.09.24',
    generated_at: '2026-09-24T12:00:00.000Z',
    course: {
      id: '0ddb2e14-13b7-4341-9fbb-27c2c73b6cc7',
      slug: 'metodo-ia-real',
      title: 'Método IA Real',
      description: 'Curso de teste',
      difficulty: 'beginner',
      estimated_hours: 36,
      tags: ['IA'],
    },
    modules: Array.from({ length: moduleCount }, (_, i) => makeModule(i)),
  };
  const parsed = parseCurriculumPack(JSON.stringify(raw));
  assert.ok('pack' in parsed, `fixture must be a valid pack: ${JSON.stringify(parsed)}`);
  return parsed.pack;
}

/** Fake RPC transport that records calls and can fail on demand. */
function fakeRpc(fail = () => null) {
  const calls = [];
  const rpc = async (functionName, args) => {
    calls.push({ functionName, args });
    const error = fail(functionName, args, calls.length);
    if (error) return { data: null, error };
    if (functionName === IMPORT_MODULE_RPC) {
      const module = args.payload.module;
      return { data: { module_id: module.id, code: module.code, lessons: module.lessons.length, quizzes: 1 }, error: null };
    }
    return { data: { archived_lessons: 4, hidden_modules: 2, archive_module_id: uuid(9, 9) }, error: null };
  };
  return { rpc, calls };
}

// ---------------------------------------------------------------- text search

test('normalizeText folds accents, case and whitespace', () => {
  assert.equal(normalizeText('  Ação   RÁPIDA\nçã '), 'acao rapida ca');
  assert.deepEqual(searchTokens('Janela  de CONTEXTO de'), ['janela', 'de', 'contexto']);
  assert.deepEqual(searchTokens('   '), []);
});

test('matchesSearch is accent-insensitive and requires every token', () => {
  assert.equal(matchesSearch(['Alucinação', 'Quando a IA inventa fatos'], 'alucinacao fatos'), true);
  assert.equal(matchesSearch(['Alucinação'], 'ALUCINAÇÃO'), true);
  assert.equal(matchesSearch(['Alucinação', null, undefined], 'alucinacao token'), false);
  assert.equal(matchesSearch(['Qualquer coisa'], ''), true);
  assert.equal(buildHaystack(['Á', null, 'B']), 'a b');
});

test('rankMatch prefers titles that start with or contain the query', () => {
  assert.equal(rankMatch('Token', 'token', 'tok'), 3);
  assert.equal(rankMatch('Janela de contexto', '', 'contexto'), 2);
  assert.equal(rankMatch('LLM', 'modelo de linguagem grande', 'linguagem modelo'), 1);
  assert.equal(rankMatch('LLM', 'modelo', 'imagem'), 0);
  assert.equal(rankMatch('LLM', 'modelo', '  '), 0);
});

test('slugify and indexLetter build stable anchors', () => {
  assert.equal(slugify('Prompt R.E.A.L.'), 'prompt-r-e-a-l');
  assert.equal(slugify('  Ética & Vieses  '), 'etica-vieses');
  assert.equal(indexLetter('Ética'), 'E');
  assert.equal(indexLetter('3D'), '#');
  assert.equal(indexLetter('"Aspas"'), '#');
});

test('toIlikePattern neutralises PostgREST and LIKE syntax', () => {
  assert.equal(toIlikePattern('chat gpt'), '%chat gpt%');
  assert.equal(toIlikePattern('a,b(c)'), '%a_b_c_%');
  assert.equal(toIlikePattern('R.E.A.L.'), '%R_E_A_L_%');
  assert.equal(toIlikePattern('100% "grátis"\\*'), '%100_ _grátis___%');
  assert.equal(toIlikePattern(' ,.() '), null);
  assert.equal(toIlikePattern('x'.repeat(200)).length, 82);
  for (const pattern of [toIlikePattern('a,b'), toIlikePattern('title.ilike.x),(y')]) assert.doesNotMatch(pattern, /[,()".\\*]/);
});

// ---------------------------------------------------------------- dates

test('formatDateOnly never shifts the day in Brazilian time zones', () => {
  const previous = process.env.TZ;
  process.env.TZ = 'America/Sao_Paulo';
  try {
    assert.equal(formatDateOnly('2026-09-24'), '24 de setembro de 2026');
    assert.equal(formatDateOnly('2026-09-24', 'short'), '24/09/2026');
    assert.equal(formatDateOnly('2026-01-01', 'short'), '01/01/2026');
  } finally {
    process.env.TZ = previous;
  }
});

test('parseDateOnly rejects malformed and impossible dates', () => {
  assert.equal(parseDateOnly('2026-02-31'), null);
  assert.equal(parseDateOnly('24/09/2026'), null);
  assert.equal(parseDateOnly(''), null);
  assert.equal(parseDateOnly(null), null);
  assert.equal(formatDateOnly('Em breve'), null);
});

// ---------------------------------------------------------------- curriculum import

test('module payload carries format, version, course and exactly one module', () => {
  const pack = makePack(3);
  const payload = buildModuleImportPayload(pack, pack.modules[1]);
  assert.deepEqual(Object.keys(payload).sort(), ['course', 'format', 'module', 'version']);
  assert.equal(payload.format, CURRICULUM_PACK_FORMAT);
  assert.equal(payload.version, '2026.09.24');
  assert.deepEqual(payload.course, pack.course);
  assert.equal(payload.module.code, 'MOD-01');
  assert.equal(payload.module.lessons.length, 2);
  assert.equal('modules' in payload, false);
});

test('finalize payload lists every module code and lesson id in pack order', () => {
  const pack = makePack(3);
  const payload = buildFinalizeImportPayload(pack);
  assert.deepEqual(Object.keys(payload).sort(), ['course_id', 'format', 'lesson_ids', 'module_codes']);
  assert.equal(payload.course_id, pack.course.id);
  assert.deepEqual(payload.module_codes, ['MOD-00', 'MOD-01', 'MOD-02']);
  assert.equal(payload.lesson_ids.length, 6);
  assert.equal(new Set(payload.lesson_ids).size, 6);
  assert.equal(payload.lesson_ids[0], pack.modules[0].lessons[0].id);
});

test('import runs one module per call, in order, then finalizes', async () => {
  const pack = makePack(3);
  const { rpc, calls } = fakeRpc();
  const events = [];
  const outcome = await runCurriculumImport(pack, rpc, { onEvent: (event) => events.push(event.type) });
  assert.equal(outcome.status, 'done');
  assert.deepEqual(outcome.report, { archivedLessons: 4, hiddenModules: 2, archiveModuleId: uuid(9, 9) });
  assert.deepEqual(calls.map((c) => c.functionName), [IMPORT_MODULE_RPC, IMPORT_MODULE_RPC, IMPORT_MODULE_RPC, FINALIZE_IMPORT_RPC]);
  assert.deepEqual(calls.slice(0, 3).map((c) => c.args.payload.module.code), ['MOD-00', 'MOD-01', 'MOD-02']);
  assert.deepEqual(Object.keys(calls[0].args), ['payload']);
  assert.deepEqual(calls[3].args.payload, buildFinalizeImportPayload(pack));
  assert.deepEqual(events, ['module-start', 'module-done', 'module-start', 'module-done', 'module-start', 'module-done', 'finalize-start', 'finalize-done']);
});

test('import stops at the first failing module and never finalizes', async () => {
  const pack = makePack(4);
  const { rpc, calls } = fakeRpc((name, args) => (args.payload.module?.code === 'MOD-01' ? { code: 'P0001', message: 'Aula duplicada' } : null));
  const events = [];
  const outcome = await runCurriculumImport(pack, rpc, { onEvent: (event) => events.push(event) });
  assert.deepEqual(outcome, { status: 'failed', failedIndex: 1, message: 'Aula duplicada' });
  assert.equal(calls.length, 2);
  assert.equal(calls.some((c) => c.functionName === FINALIZE_IMPORT_RPC), false);
  assert.deepEqual(events.at(-1), { type: 'module-error', index: 1, message: 'Aula duplicada' });
});

test('import can resume from the failed module and retry only the finalize step', async () => {
  const pack = makePack(3);
  const resumed = fakeRpc();
  const outcome = await runCurriculumImport(pack, resumed.rpc, { startAt: 1 });
  assert.equal(outcome.status, 'done');
  assert.deepEqual(resumed.calls.map((c) => c.args.payload.module?.code ?? 'finalize'), ['MOD-01', 'MOD-02', 'finalize']);

  const finalizeOnly = fakeRpc();
  await runCurriculumImport(pack, finalizeOnly.rpc, { startAt: pack.modules.length });
  assert.deepEqual(finalizeOnly.calls.map((c) => c.functionName), [FINALIZE_IMPORT_RPC]);
});

test('import reports finalize failures and thrown transport errors', async () => {
  const pack = makePack(2);
  const finalizeFails = fakeRpc((name) => (name === FINALIZE_IMPORT_RPC ? { code: '42501', message: 'permission denied' } : null));
  const outcome = await runCurriculumImport(pack, finalizeFails.rpc);
  assert.equal(outcome.status, 'failed');
  assert.equal(outcome.failedIndex, null);
  assert.match(outcome.message, /administrador/);

  const throwing = async () => { throw new TypeError('Failed to fetch'); };
  const network = await runCurriculumImport(pack, throwing);
  assert.equal(network.status, 'failed');
  assert.equal(network.failedIndex, 0);
  assert.match(network.message, /conexão/);
});

test('import stops between calls when asked to', async () => {
  const pack = makePack(3);
  const { rpc, calls } = fakeRpc();
  const outcome = await runCurriculumImport(pack, rpc, { shouldStop: () => calls.length >= 1 });
  assert.deepEqual(outcome, { status: 'stopped', nextIndex: 1 });
  assert.equal(calls.length, 1);
});

test('import results accept objects, one-row sets, bigint strings and arrays', () => {
  assert.deepEqual(parseModuleImportResult({ module_id: 'm1', code: 'MOD-01', lessons: 9, quizzes: '8' }), { moduleId: 'm1', code: 'MOD-01', lessons: 9, quizzes: 8 });
  assert.deepEqual(parseModuleImportResult([{ module_id: 'm1', code: 'MOD-01', lessons: ['a', 'b'], quizzes: [] }]), { moduleId: 'm1', code: 'MOD-01', lessons: 2, quizzes: 0 });
  assert.deepEqual(parseModuleImportResult(null), { moduleId: null, code: null, lessons: null, quizzes: null });
  assert.deepEqual(parseFinalizeImportReport({ archived_lessons: 12, hidden_modules: ['a', 'b', 'c'], archive_module_id: 'x' }), { archivedLessons: 12, hiddenModules: 3, archiveModuleId: 'x' });
  assert.deepEqual(parseFinalizeImportReport('ok'), { archivedLessons: null, hiddenModules: null, archiveModuleId: null });
});

test('import errors become actionable messages', () => {
  assert.match(describeImportError({ code: 'PGRST202', message: 'Could not find the function' }, IMPORT_MODULE_RPC), /admin_import_curriculum_module não existe.*migração/);
  assert.match(describeImportError({ code: '42501', message: 'Admin only' }), /administrador/);
  assert.match(describeImportError({ code: 'PGRST301', message: 'JWT expired' }), /sessão expirou/);
  assert.match(describeImportError({ code: '57014', message: 'canceling statement due to statement timeout' }), /demorou/);
  assert.equal(describeImportError({ code: 'P0001', message: 'Módulo MOD-03 inválido', details: 'aula sem título', hint: 'confira o pacote' }), 'Módulo MOD-03 inválido — aula sem título — confira o pacote');
  assert.equal(describeImportError('texto simples'), 'texto simples');
  assert.equal(describeImportError(undefined), 'Erro desconhecido.');
  assert.equal(describeImportError({ message: 'x'.repeat(1000) }).length, 400);
});

test('pack file validation checks extension and size before reading', () => {
  assert.equal(validatePackFile({ name: 'curriculo-2026.09.24.json', size: 2_000_000 }), null);
  assert.match(validatePackFile({ name: 'curriculo.zip', size: 10 }), /\.json/);
  assert.match(validatePackFile({ name: 'vazio.json', size: 0 }), /vazio/);
  assert.match(validatePackFile({ name: 'grande.JSON', size: 30 * 1024 * 1024 }), /limite/);
});

// ---------------------------------------------------------------- admin course form

test('admin lesson form keeps video and content and saves the review date', () => {
  const form = toCourseItemForm({ title: 'Aula', type: 'project', estimated_minutes: 40, video_url: 'https://www.youtube.com/embed/x', content: '## Oi', reviewed_at: '2026-09-24' });
  assert.equal(form.type, 'project');
  assert.equal(form.reviewedAt, '2026-09-24');
  assert.deepEqual(buildLessonPayload(form, { moduleId: 'm1', orderIndex: 3 }), {
    title: 'Aula', description: null, module_id: 'm1', estimated_minutes: 40, is_free: false, type: 'project',
    content: '## Oi', video_url: 'https://www.youtube.com/embed/x', reviewed_at: '2026-09-24', order_index: 3,
  });
  assert.equal(buildLessonPayload({ ...form, reviewedAt: '', videoUrl: ' ' }, { moduleId: 'm1', orderIndex: 0 }).reviewed_at, null);
  assert.equal(toCourseItemForm({ title: 'Legada', type: 'desconhecido' }).type, 'text');
  assert.equal(toCourseItemForm(null).minutes, '10');
});

test('admin form rejects non-https links, bad dates and missing titles', () => {
  const lesson = toCourseItemForm({ title: 'Aula' });
  assert.equal(validateCourseItemForm('lesson', lesson), null);
  assert.match(validateCourseItemForm('lesson', { ...lesson, videoUrl: 'javascript:alert(1)' }), /https/);
  assert.match(validateCourseItemForm('lesson', { ...lesson, videoUrl: 'http://youtube.com' }), /https/);
  assert.match(validateCourseItemForm('lesson', { ...lesson, reviewedAt: '2026-02-31' }), /revisão/);
  assert.match(validateCourseItemForm('lesson', { ...lesson, minutes: '1.5' }), /minutos/);
  assert.match(validateCourseItemForm('module', { ...lesson, title: '  ' }), /título/);
  assert.match(validateCourseItemForm('course', { ...lesson, slug: 'Com Espaço' }), /slug/);
  assert.equal(validateCourseItemForm('course', { ...lesson, title: 'Método IA Real', slug: '' }), null);
});

test('admin module edits keep the imported slug; new items go to the end', () => {
  const form = toCourseItemForm({ title: 'ChatGPT do zero ao avançado', is_published: false });
  assert.equal(buildModulePayload(form, { courseId: 'c1', orderIndex: 3, existingSlug: 'mod-03-chatgpt' }).slug, 'mod-03-chatgpt');
  assert.equal(buildModulePayload(form, { courseId: 'c1', orderIndex: 3 }).slug, 'chatgpt-do-zero-ao-avancado');
  assert.equal(buildModulePayload(form, { courseId: 'c1', orderIndex: 3 }).is_published, false);
  assert.equal(buildCoursePayload({ ...form, slug: '', hours: '36' }).estimated_hours, 36);
  assert.equal(nextOrderIndex([{ order_index: 0 }, { order_index: 7 }, { order_index: 2 }]), 8);
  assert.equal(nextOrderIndex([]), 0);
  assert.match(describeSaveError({ code: '23505', message: 'duplicate key' }), /slug/);
  assert.equal(describeSaveError({ message: 'Falhou' }), 'Falhou');
  assert.match(describeDeleteError({ code: '23503' }), /ligados/);
});

// ---------------------------------------------------------------- prompt library

const promptModules = [
  { id: 'm2', code: 'MOD-02', title: 'MOD-02 — Engenharia de Prompt', order_index: 2, trails: ['carreira'] },
  { id: 'm0', code: null, title: 'MOD-00 Comece por aqui', order_index: 0, trails: [] },
  { id: 'm4', code: 'MOD-04', title: 'Claude do zero ao avançado', order_index: 4, trails: ['construtor'] },
  { id: 'm7', code: 'MOD-07', title: 'Vídeo, voz e música', order_index: 7, trails: ['criador'] },
];
const promptLessons = [
  { id: 'l4', title: 'Projects no Claude', prompts: ['Organize meus arquivos'], module_id: 'm4', order_index: 0 },
  { id: 'l2b', title: 'Few-shot', prompts: ['Use estes exemplos de estilo', '   '], module_id: 'm2', order_index: 4 },
  { id: 'l2a', title: 'Prompt R.E.A.L.', prompts: ['Aja como analista de negócios', 'Revise a redação'], module_id: 'm2', order_index: 1 },
  { id: 'l0', title: 'Boas-vindas', prompts: null, module_id: 'm0', order_index: 0 },
  { id: 'orphan', title: 'Aula de módulo oculto', prompts: ['Não deve aparecer'], module_id: 'hidden', order_index: 0 },
];

test('prompt library orders prompts by module and lesson and skips blanks and orphans', () => {
  const library = buildPromptLibrary(promptModules, promptLessons);
  assert.deepEqual(library.entries.map((e) => e.key), ['l2a:0', 'l2a:1', 'l2b:0', 'l4:0']);
  assert.deepEqual(library.entries.map((e) => e.position), [1, 2, 1, 1]);
  assert.deepEqual(library.modules.map((m) => m.code), ['MOD-02', 'MOD-04']);
  assert.equal(library.modules[0].title, 'Engenharia de Prompt');
  assert.equal(library.lessonCount, 3);
  assert.equal(library.lockedModuleCount, 1, 'MOD-07 has no visible lesson');
  assert.deepEqual(groupPromptsByModule(library.entries).map((g) => [g.module.code, g.entries.length]), [['MOD-02', 3], ['MOD-04', 1]]);
});

test('prompt filters combine accent-insensitive search, module and learner track', () => {
  const { entries } = buildPromptLibrary(promptModules, promptLessons);
  const keys = (filters) => filterPromptEntries(entries, { query: '', moduleId: null, track: null, ...filters }).map((e) => e.key);
  assert.deepEqual(keys({ query: 'NEGÓCIOS analista' }), ['l2a:0']);
  assert.deepEqual(keys({ query: 'few shot' }), ['l2b:0'], 'tokens match inside hyphenated words');
  assert.deepEqual(keys({ query: 'few-shot' }), ['l2b:0']);
  assert.deepEqual(keys({ query: 'revise redacao' }), ['l2a:1']);
  assert.deepEqual(keys({ query: 'mod-04' }), ['l4:0']);
  assert.deepEqual(keys({ moduleId: 'm4' }), ['l4:0']);
  assert.deepEqual(keys({ track: 'carreira' }), ['l2a:0', 'l2a:1', 'l2b:0'], 'MOD-04 is not in the Carreira track');
  assert.deepEqual(keys({ track: 'construtor' }), ['l2a:0', 'l2a:1', 'l2b:0', 'l4:0']);
  assert.deepEqual(keys({ track: 'completa' }).length, 4);
  assert.deepEqual(keys({ track: 'carreira', moduleId: 'm4' }), []);
});

test('prompt library handles accounts without visible lessons', () => {
  const library = buildPromptLibrary(promptModules, []);
  assert.equal(library.entries.length, 0);
  assert.equal(library.lessonCount, 0);
  assert.equal(library.lockedModuleCount, 4);
});

// ---------------------------------------------------------------- glossary and tools helpers

const glossaryFixture = [
  { term: 'Token', definition: 'Pedaço de texto lido pelo modelo.', moduleCode: 'MOD-01', related: ['Janela de contexto', 'Inexistente'] },
  { term: 'Janela de contexto', definition: 'Quanto texto o modelo considera de uma vez.', english: 'Context window', related: ['token'] },
  { term: 'Ética', definition: 'Uso responsável da IA.', example: 'Avisar quando usou IA.' },
  { term: '3D', definition: 'Imagens tridimensionais.' },
  { term: 'Alucinação', definition: 'Quando a IA inventa fatos.', english: 'Hallucination' },
];

test('glossary groups by accent-folded letter with pt-BR ordering', () => {
  const groups = groupGlossaryByLetter(glossaryFixture);
  assert.deepEqual(groups.map((g) => g.letter), ['#', 'A', 'E', 'J', 'T']);
  assert.deepEqual(groups.find((g) => g.letter === 'E').terms.map((t) => t.term), ['Ética']);
  assert.equal(letterAnchorId('#'), 'letra-outros');
  assert.equal(letterAnchorId('E'), 'letra-e');
});

test('glossary search covers English terms, examples and is accent-insensitive', () => {
  assert.deepEqual(filterGlossary(glossaryFixture, 'hallucination').map((t) => t.term), ['Alucinação']);
  assert.deepEqual(filterGlossary(glossaryFixture, 'etica').map((t) => t.term), ['Ética']);
  assert.deepEqual(filterGlossary(glossaryFixture, 'avisar').map((t) => t.term), ['Ética']);
  assert.equal(filterGlossary(glossaryFixture, '').length, glossaryFixture.length);
  assert.deepEqual(searchGlossaryTerms(glossaryFixture, 'contexto').map((t) => t.term), ['Janela de contexto', 'Token']);
});

test('URL fragments decode safely into element ids', () => {
  assert.equal(anchorIdFromHash('#termo-token'), 'termo-token');
  assert.equal(anchorIdFromHash('#ferramenta-chatgpt%20x'), 'ferramenta-chatgpt x');
  assert.equal(anchorIdFromHash('#%E0%A4%A'), '%E0%A4%A', 'malformed escapes must not throw');
  assert.equal(anchorIdFromHash(''), '');
});

test('glossary related terms resolve case- and accent-insensitively', () => {
  assert.equal(findGlossaryTerm(glossaryFixture, 'token')?.term, 'Token');
  assert.equal(findGlossaryTerm(glossaryFixture, 'JANELA DE CONTEXTO')?.term, 'Janela de contexto');
  assert.equal(findGlossaryTerm(glossaryFixture, 'Inexistente'), undefined);
  assert.equal(glossaryAnchorId('Janela de contexto'), 'termo-janela-de-contexto');
});

const toolFixture = [
  { id: 'chatgpt', name: 'ChatGPT', company: 'OpenAI', category: 'assistente', whatFor: 'Assistente geral', freeTier: 'Plano grátis com limites', plans: [{ name: 'Plus', price: 'US$ 20/mês' }], moduleCodes: ['MOD-03', 'MOD-00'], url: 'https://chatgpt.com', lastVerified: '2026-09-24' },
  { id: 'midjourney', name: 'Midjourney', company: 'Midjourney', category: 'imagem', whatFor: 'Imagens', freeTier: 'Sem plano gratuito', plans: [{ name: 'Basic', price: 'US$ 10/mês' }], freeAlternative: 'Ideogram', moduleCodes: ['MOD-06'], url: 'https://midjourney.com', lastVerified: '2026-09-24' },
  { id: 'gemini', name: 'Gemini', company: 'Google', category: 'assistente', whatFor: 'Assistente do Google', freeTier: 'Grátis', plans: [], moduleCodes: ['MOD-05', 'MOD-10'], url: 'https://gemini.google.com', lastVerified: '2026-09-20' },
];

test('tools filter by category and module and list module codes in order', () => {
  assert.deepEqual(filterTools(toolFixture, { category: 'assistente', moduleCode: null }).map((t) => t.id), ['chatgpt', 'gemini']);
  assert.deepEqual(filterTools(toolFixture, { category: null, moduleCode: 'MOD-06' }).map((t) => t.id), ['midjourney']);
  assert.deepEqual(filterTools(toolFixture, { category: 'imagem', moduleCode: 'MOD-03' }), []);
  assert.equal(filterTools(toolFixture, { category: null, moduleCode: null }).length, 3);
  assert.deepEqual(toolModuleCodes(toolFixture), ['MOD-00', 'MOD-03', 'MOD-05', 'MOD-06', 'MOD-10']);
  assert.deepEqual([...countToolsByCategory(toolFixture)], [['assistente', 2], ['imagem', 1]]);
  assert.equal(toolAnchorId('chatgpt'), 'ferramenta-chatgpt');
});

test('⌘K resources merge glossary and tools by relevance', () => {
  const terms = [{ term: 'LLM', definition: 'Modelo por trás do ChatGPT.' }, ...glossaryFixture];
  const hits = searchResources(terms, toolFixture, 'chatgpt');
  assert.deepEqual(hits.map((hit) => (hit.kind === 'tool' ? hit.tool.id : hit.term.term)), ['chatgpt', 'LLM']);
  assert.deepEqual(searchResources(terms, toolFixture, 'token').map((hit) => hit.kind), ['glossary', 'glossary']);
  assert.equal(searchResources(terms, toolFixture, 'assistente', 1).length, 1);
  assert.deepEqual(searchResources(terms, toolFixture, '   '), []);
});

test('tool search ranks names before other fields', () => {
  assert.deepEqual(searchTools(toolFixture, 'gemini').map((t) => t.id), ['gemini']);
  assert.deepEqual(searchTools(toolFixture, 'assistente').map((t) => t.id), ['chatgpt', 'gemini']);
  assert.deepEqual(searchTools(toolFixture, 'ideogram').map((t) => t.id), ['midjourney']);
  assert.deepEqual(searchTools(toolFixture, 'google', 1).map((t) => t.id), ['gemini']);
});

// ---------------------------------------------------------------- shipped data integrity

const MODULE_CODE = /^MOD-(0\d|1[0-2])$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

test('glossary data: unique anchors, valid module codes and dates', (t) => {
  assert.match(GLOSSARY_UPDATED_AT, DATE);
  assert.ok(formatDateOnly(GLOSSARY_UPDATED_AT));
  const anchors = GLOSSARY.map((term) => glossaryAnchorId(term.term));
  assert.equal(new Set(anchors).size, anchors.length, 'two terms produce the same anchor');
  for (const term of GLOSSARY) {
    assert.ok(term.term.trim() && term.definition.trim(), `term without text: ${JSON.stringify(term)}`);
    if (term.moduleCode) assert.match(term.moduleCode, MODULE_CODE, term.term);
  }
  // The page shows unresolved related terms as plain text (no broken anchor); report them for content review.
  const unresolved = GLOSSARY.flatMap((term) => (term.related ?? [])
    .filter((name) => !findGlossaryTerm(GLOSSARY, name))
    .map((name) => `${term.term} → ${name}`));
  if (unresolved.length > 0) t.diagnostic(`related terms without their own entry (rendered as plain text): ${unresolved.join('; ')}`);
});

test('tools data: unique ids, known categories, https links, verified dates and free alternatives', () => {
  assert.match(AI_TOOLS_UPDATED_AT, DATE);
  assert.ok(USD_BRL_REFERENCE > 0);
  const ids = AI_TOOLS.map((tool) => toolAnchorId(tool.id));
  assert.equal(new Set(ids).size, ids.length, 'duplicate tool id');
  for (const tool of AI_TOOLS) {
    assert.ok(tool.category in TOOL_CATEGORY_LABELS, `${tool.id}: unknown category ${tool.category}`);
    assert.match(tool.url, /^https:\/\//, `${tool.id}: url`);
    if (tool.pricingUrl) assert.match(tool.pricingUrl, /^https:\/\//, `${tool.id}: pricingUrl`);
    assert.ok(formatDateOnly(tool.lastVerified), `${tool.id}: lastVerified ${tool.lastVerified}`);
    for (const code of tool.moduleCodes) assert.match(code, MODULE_CODE, `${tool.id}: module ${code}`);
    if (/^sem plano gratuito/.test(normalizeText(tool.freeTier))) assert.ok(tool.freeAlternative, `${tool.id}: no free tier requires freeAlternative`);
  }
});
