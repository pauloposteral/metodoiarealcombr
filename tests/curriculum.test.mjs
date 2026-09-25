import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { PACK_FORMAT, buildPack, loadCurriculum, summarize, uuidv5 } from '../scripts/curriculum/lib.mjs';
import { CURRICULUM_PACK_FORMAT, CurriculumPackSchema, parseCurriculumPack, summarizePack } from '../src/lib/curriculumPack.ts';
import { CERTIFICATE_TRACK_THRESHOLD, TRACKS } from '../src/lib/curriculum.ts';
import { testDatabase } from './helpers/db.mjs';

// ---------------------------------------------------------------------------------------
// Synthetic curriculum: 13 modules x (5 text lessons + 1 project) that satisfy the content
// validator. Generated in a temp dir because real course content must never be in the repo.
// ---------------------------------------------------------------------------------------
const COURSE_ID = '0ddb2e14-13b7-4341-9fbb-27c2c73b6cc7';
const REVIEWED = '2026-09-24';
const TRAIL_KEYS = ['carreira', 'empreendedor', 'criador', 'construtor'];
const MODULES = [
  ['comece-por-aqui', 'Comece por aqui'],
  ['fundamentos', 'Fundamentos: como a IA pensa'],
  ['engenharia-de-prompt', 'Engenharia de prompt'],
  ['chatgpt', 'ChatGPT do zero ao avançado'],
  ['claude', 'Claude do zero ao avançado'],
  ['gemini', 'Gemini e o ecossistema Google'],
  ['imagem', 'Imagem: do prompt à arte profissional'],
  ['video-voz-musica', 'Vídeo, voz e música'],
  ['lovable', 'Lovable: seu primeiro app sem código'],
  ['automacoes', 'Automações e agentes'],
  ['produtividade', 'IA no trabalho: produtividade'],
  ['negocios-e-conteudo', 'IA para negócios e conteúdo'],
  ['monetizacao', 'Monetização: os caminhos do dinheiro com IA'],
].map(([words, title], number) => {
  const code = `MOD-${String(number).padStart(2, '0')}`;
  // Trails follow the track definitions used by the members area.
  return { number, code, words, title, dir: `mod-${code.slice(4)}-${words}`,
    trails: TRAIL_KEYS.filter((key) => TRACKS[key].moduleCodes.includes(code)) };
});
const FREE_LESSON = { code: 'MOD-05', position: 2 };

const WORDS = `assistente contexto resultado cliente rotina modelo exemplo planilha relatório pesquisa
estratégia processo revisão objetivo critério tarefa equipe conteúdo resposta pergunta decisão hipótese
métrica semana prazo orçamento projeto ferramenta fluxo automação documento roteiro proposta mercado
público mensagem campanha protótipo aplicativo agente reunião apresentação análise hábito prioridade
entrega checklist formato tom voz marca imagem vídeo legenda fonte dado evidência teste versão ajuste
comparação erro limite risco privacidade custo plano meta indicador claro simples prático rápido útil
concreto específico real seguro completo curto detalhado novo próximo com para sem sobre entre depois
antes quando porque como cada toda mais menos melhor sempre ainda também apenas`.split(/\s+/);

/** Deterministic PRNG (FNV-1a seed + mulberry32) so the fixture is identical on every run. */
function random(seed) {
  let state = 2166136261;
  for (const char of seed) state = Math.imul(state ^ char.charCodeAt(0), 16777619);
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function sentence(rng, min = 9, max = 13) {
  const words = Array.from({ length: min + Math.floor(rng() * (max - min + 1))}, () => WORDS[Math.floor(rng() * WORDS.length)]);
  return `${words[0][0].toUpperCase()}${words[0].slice(1)} ${words.slice(1).join(' ')}.`;
}
const paragraph = (rng, sentences = 6) => Array.from({ length: sentences }, () => sentence(rng)).join(' ');
const bullets = (rng, marker = () => '-') => [1, 2, 3].map((n) => `${marker(n)} ${sentence(rng, 6, 9)}`).join('\n');
const fence = (lang, text) => `\`\`\`${lang}\n${text}\n\`\`\``;

function moduleFile(mod) {
  const rng = random(`${mod.code}/intro`);
  return ['---', `code: ${mod.code}`, `order: ${mod.number}`, `slug: ${mod.dir}`, `title: ${mod.title}`,
    `description: Módulo sintético ${mod.code} com cinco aulas de conteúdo e um projeto, usado para testar a importação.`,
    'hours_label: ~1h30', `trails: [${mod.trails.join(', ')}]`,
    `project_title: Projeto prático do ${mod.code} entregue por link público`,
    `star: ${mod.code === 'MOD-08'}`, '---', paragraph(rng), '', paragraph(rng), ''].join('\n');
}

function textLessonFile(mod, position) {
  const rng = random(`${mod.code}/${position}`);
  const subject = mod.title.split(':')[0];
  const slug = `mod-${mod.code.slice(4)}-0${position}-${mod.words}-parte-${position}`;
  const free = mod.code === FREE_LESSON.code && position === FREE_LESSON.position;
  const quiz = [0, 1, 2].map((q) => {
    const answer = (position - 1 + q) % 3;
    const options = [`Pedir a tarefa ${q + 1} em uma frase curta, sem contexto`, `Trocar de ferramenta a cada tentativa da tarefa ${q + 1}`];
    options.splice(answer, 0, `Dar contexto real e um critério de qualidade para a tarefa ${q + 1}`);
    return [`P: Qual atitude melhora o resultado com ${subject} na situação ${q + 1} da parte ${position}?`,
      ...options.map((option, i) => `${'ABC'[i]}) ${option}`), `Correta: ${'ABC'[answer]}`,
      'Explicação: Contexto real e critério claro reduzem respostas genéricas e retrabalho.'].join('\n');
  }).join('\n\n');
  const prompts = [1, 2, 3].map((n) => `Você é especialista em ${subject}. Eu trabalho como [SEU CARGO] e quero aplicar a parte ${position} desta aula. Proponha ${n + 2} passos práticos para [SEU OBJETIVO], com um exemplo curto em cada passo.`);
  const body = [paragraph(rng),
    `## Conceito central de ${subject}`, paragraph(rng), paragraph(rng), bullets(rng), paragraph(rng),
    '## Como aplicar na rotina', paragraph(rng), paragraph(rng), `:::warning\n${paragraph(rng, 3)}\n:::`, paragraph(rng),
    '## Exemplo guiado', paragraph(rng), paragraph(rng), `:::exercise Resultado da aula\n${paragraph(rng, 3)}\n:::`, paragraph(rng),
    '## Resumo', bullets(rng),
    '## Fontes e leitura', `Consulte o [guia de referência](https://example.com/guias/${slug}) e compare com o que você praticou.`,
    ...prompts.map((prompt) => fence('prompt', prompt)), fence('quiz', quiz)].join('\n\n');
  return ['---', `slug: ${slug}`, `title: ${mod.title} — parte ${position}`,
    `description: Aula sintética ${position} do ${mod.code} para testar importação, acesso e certificado.`,
    'minutes: 10', 'type: text', `updated: ${REVIEWED}`, ...(free ? ['free: true'] : []), '---', body, ''].join('\n');
}

function projectLessonFile(mod) {
  const rng = random(`${mod.code}/projeto`);
  const done = sentence(rng, 8, 11);
  const prompts = [1, 2].map((n) => `Revise a entrega ${n} do projeto de ${mod.title.split(':')[0]}. Aponte o que falta para [SEU PÚBLICO] entender o resultado e sugira melhorias em tópicos curtos.`);
  const body = [paragraph(rng), '## Objetivo do projeto', paragraph(rng), paragraph(rng),
    '## Passo a passo', bullets(rng, (n) => `${n}.`), paragraph(rng), paragraph(rng),
    '## Como entregar', paragraph(rng), `Está pronto quando ${done[0].toLowerCase()}${done.slice(1)}`, paragraph(rng), paragraph(rng),
    '## Resumo', bullets(rng), ...prompts.map((prompt) => fence('prompt', prompt))].join('\n\n');
  return ['---', `slug: mod-${mod.code.slice(4)}-06-${mod.words}-projeto`, `title: Projeto: ${mod.title}`,
    `description: Projeto sintético do ${mod.code}, entregue por link, para testar entregas e certificado.`,
    'minutes: 45', 'type: project', `updated: ${REVIEWED}`, '---', body, ''].join('\n');
}

function writeSyntheticCurriculum(dir) {
  fs.writeFileSync(path.join(dir, 'curso.json'), JSON.stringify({
    id: COURSE_ID, slug: 'metodo-ia-real', title: 'Método IA Real',
    description: 'Currículo sintético de teste: 13 módulos, 4 trilhas e um projeto por módulo.',
    difficulty: 'beginner', estimated_hours: 36, tags: ['ChatGPT', 'Claude', 'Lovable'], version: '2026.09.24',
  }, null, 2));
  for (const mod of MODULES) {
    const moduleDir = path.join(dir, mod.dir);
    fs.mkdirSync(moduleDir);
    fs.writeFileSync(path.join(moduleDir, '_modulo.md'), moduleFile(mod));
    for (let position = 1; position <= 5; position++) {
      fs.writeFileSync(path.join(moduleDir, `0${position}-parte-${position}.md`), textLessonFile(mod, position));
    }
    fs.writeFileSync(path.join(moduleDir, '06-projeto.md'), projectLessonFile(mod));
  }
}

const workdir = fs.mkdtempSync(path.join(os.tmpdir(), 'metodo-curriculo-'));
after(() => fs.rmSync(workdir, { recursive: true, force: true }));
writeSyntheticCurriculum(workdir);
const curriculum = loadCurriculum(workdir);
const pack = buildPack(curriculum, '2026-09-24T12:00:00.000Z');

test('Synthetic curriculum passes the content validator and the pack schema', () => {
  const problems = [
    ...curriculum.errors,
    ...curriculum.modules.flatMap((mod) => [
      ...mod.errors.map((error) => `${mod.dirName}: ${error}`),
      ...mod.lessons.flatMap((lesson) => lesson.errors.map((error) => `${mod.dirName}/${path.basename(lesson.file)}: ${error}`)),
    ]),
  ];
  assert.deepEqual(problems, []);
  const summary = summarize(curriculum);
  assert.equal(summary.errors, 0);
  assert.equal(summary.modules, 13);
  assert.equal(summary.lessons, 78);
  const lessons = curriculum.modules.flatMap((mod) => mod.lessons);
  assert.ok(Math.min(...lessons.filter((l) => l.type === 'text').map((l) => l.words)) >= 650);
  assert.ok(Math.min(...lessons.filter((l) => l.type === 'project').map((l) => l.words)) >= 520);

  assert.equal(PACK_FORMAT, CURRICULUM_PACK_FORMAT);
  const parsed = CurriculumPackSchema.safeParse(pack);
  assert.ok(parsed.success, JSON.stringify(parsed.error?.issues.slice(0, 5)));
  assert.ok('pack' in parseCurriculumPack(JSON.stringify(pack)));
  assert.deepEqual(summarizePack(pack), { version: '2026.09.24', modules: 13, lessons: 78, projects: 13, questions: 195, prompts: 221, minutes: 1235 });
  assert.equal(pack.modules[1].id, uuidv5('module/MOD-01'));
  assert.deepEqual(pack.modules[3].trails, ['carreira', 'empreendedor']);
  assert.equal(pack.modules[8].is_star, true);
});

// ---------------------------------------------------------------------------------------
// Database: production-like legacy state -> admin import -> access, submissions, certificate.
// ---------------------------------------------------------------------------------------
const OUTLINE_COLUMNS = ['course_id', 'module_id', 'module_code', 'module_title', 'module_description', 'module_order',
  'module_hours_label', 'module_trails', 'module_project_title', 'module_is_star', 'lesson_id', 'lesson_title',
  'lesson_description', 'lesson_order', 'lesson_type', 'estimated_minutes', 'is_free', 'accessible'];
const users = {
  admin: 'a0000000-0000-4000-8000-000000000001',
  free: 'a0000000-0000-4000-8000-000000000002',
  paid: 'a0000000-0000-4000-8000-000000000003',
  other: 'a0000000-0000-4000-8000-000000000004',
};
const legacy = {
  mod01: 'b0000000-0000-4000-8000-000000000001',
  mod01Copy: 'b0000000-0000-4000-8000-000000000011',
  mod03: 'b0000000-0000-4000-8000-000000000003',
  mod08: 'b0000000-0000-4000-8000-000000000008',
  stray: 'b0000000-0000-4000-8000-000000000099',
  lessonA: 'c0000000-0000-4000-8000-000000000001',
  lessonB: 'c0000000-0000-4000-8000-000000000002',
  strayLesson: 'c0000000-0000-4000-8000-000000000003',
  otherCourse: 'd0000000-0000-4000-8000-000000000001',
  emptyModule: 'd0000000-0000-4000-8000-000000000002',
};
const moduleByCode = (code) => pack.modules.find((mod) => mod.code === code);
const projectOf = (code) => moduleByCode(code).lessons.at(-1).id;
const carreira = pack.modules.filter((m) => m.trails.includes('carreira'));
const finalProject = projectOf('MOD-12');
const carreiraOrdinary = carreira.flatMap((m) => m.lessons.map((l) => l.id)).filter((id) => id !== finalProject);
const carreiraRequired = carreiraOrdinary.length + 1;
const carreiraNeeded = Math.ceil(carreiraRequired * CERTIFICATE_TRACK_THRESHOLD);
const carreiraMinutes = carreira.flatMap((m) => m.lessons).reduce((sum, l) => sum + l.estimated_minutes, 0);

test('Curriculum import, access, project submissions and track certificates on production-like data', async (t) => {
  const db = await testDatabase();
  t.after(() => db.close());
  const as = (user) => db.exec(`RESET ROLE; SET ROLE authenticated; SET request.jwt.claim.sub = '${user}';`);
  const asAnon = () => db.exec(`RESET ROLE; SET ROLE anon; SET request.jwt.claim.sub = '';`);
  const asOwner = () => db.exec(`RESET ROLE; SET request.jwt.claim.sub = '';`);
  const rows = async (sql, params) => (await db.query(sql, params)).rows;
  const one = async (sql, params) => (await rows(sql, params))[0];
  const importModule = async (module, course = pack.course) => (await one('SELECT admin_import_curriculum_module($1::jsonb) AS r',
    [JSON.stringify({ format: pack.format, version: pack.version, course, module })])).r;
  const finalPayload = { format: pack.format, course_id: COURSE_ID, module_codes: pack.modules.map((m) => m.code),
    lesson_ids: pack.modules.flatMap((m) => m.lessons.map((l) => l.id)) };
  const finalize = async (payload = finalPayload) => (await one('SELECT admin_finalize_curriculum_import($1::jsonb) AS r', [JSON.stringify(payload)])).r;
  const courseCounts = () => one(`SELECT
    (SELECT count(*)::int FROM modules WHERE course_id = $1) AS modules,
    (SELECT count(*)::int FROM lessons l JOIN modules m ON m.id = l.module_id WHERE m.course_id = $1) AS lessons,
    (SELECT count(*)::int FROM quizzes q JOIN lessons l ON l.id = q.lesson_id JOIN modules m ON m.id = l.module_id
      WHERE m.course_id = $1) AS quizzes`, [COURSE_ID]);
  const tableCounts = () => one(`SELECT (SELECT count(*)::int FROM modules) AS modules, (SELECT count(*)::int FROM lessons) AS lessons,
    (SELECT count(*)::int FROM quizzes) AS quizzes, (SELECT count(*)::int FROM lesson_progress) AS progress`);
  const complete = (user, ids) => db.query(`INSERT INTO lesson_progress(user_id, lesson_id, completed, completed_at)
    SELECT $1, id, true, now() FROM unnest($2::uuid[]) AS id`, [user, ids]);
  const deliver = (user, lesson, url = 'https://example.com/entrega') =>
    db.query('INSERT INTO project_submissions(user_id, lesson_id, url, notes) VALUES ($1, $2, $3, $4)', [user, lesson, url, 'Notas']);
  const certificateStatus = () => one('SELECT * FROM get_certificate_status()');
  const issueCertificate = () => one('SELECT * FROM issue_certificate()');

  // State left by migration 20260718162552 in production: renamed legacy modules, empty
  // unpublished placeholders, a module without code and a duplicate created later.
  await db.exec(`
    INSERT INTO auth.users(id, email, raw_user_meta_data) VALUES
      ('${users.admin}', 'admin@example.test', '{"full_name":"Admin"}'),
      ('${users.free}', 'free@example.test', '{"full_name":"Aluna Gratuita"}'),
      ('${users.paid}', 'paid@example.test', '{"full_name":"Paula Pagante"}'),
      ('${users.other}', 'other@example.test', '{"full_name":"Outro Aluno"}');
    INSERT INTO user_roles(user_id, role) VALUES ('${users.admin}', 'admin');
    INSERT INTO courses(id, title, slug, description, is_published, is_free) VALUES
      ('${COURSE_ID}', 'Método IA Real — Fundamentos', 'metodo-ia-real', 'Curso legado', true, false),
      ('${legacy.otherCourse}', 'Outro curso', 'curso-concorrente', NULL, true, false);
    INSERT INTO modules(id, course_id, title, description, order_index, is_published, created_at) VALUES
      ('${legacy.mod01}', '${COURSE_ID}', 'MOD-01 Fundamentos: como a IA pensa', 'Legado', 1, true, now() - interval '30 days'),
      ('${legacy.mod01Copy}', '${COURSE_ID}', 'MOD-01 Fundamentos (cópia)', 'Duplicado mais novo', 1, false, now() - interval '1 day'),
      ('${legacy.mod03}', '${COURSE_ID}', 'MOD-03 ChatGPT do zero ao avançado', 'Vazio', 3, false, now() - interval '20 days'),
      ('${legacy.mod08}', '${COURSE_ID}', 'MOD-08 ⭐ Lovable: seu primeiro app sem código', 'Vazio', 8, false, now() - interval '20 days'),
      ('${legacy.stray}', '${COURSE_ID}', 'Bônus: encontro gravado', 'Módulo avulso sem código', 20, true, now() - interval '25 days');
    INSERT INTO lessons(id, module_id, title, content, order_index, duration_minutes, video_url) VALUES
      ('${legacy.lessonA}', '${legacy.mod01}', 'O que é um LLM', 'Conteúdo legado A', 0, 12, 'https://video.example.test/a'),
      ('${legacy.lessonB}', '${legacy.mod01}', 'Tokens e contexto', 'Conteúdo legado B', 1, 15, NULL),
      ('${legacy.strayLesson}', '${legacy.stray}', 'Encontro gravado', 'Conteúdo legado C', 0, 30, NULL);
    INSERT INTO lesson_progress(user_id, lesson_id, completed, completed_at) VALUES ('${users.free}', '${legacy.lessonA}', true, now());`);

  let firstImport;
  let finalized;

  await t.test('Before the import, certificates keep the legacy rule and the outline shows legacy modules', async () => {
    await as(users.free);
    assert.deepEqual(await certificateStatus(), {
      track: 'completa', required_lessons: 3, completed_lessons: 1, threshold_percent: 100,
      final_project_lesson_id: null, final_project_done: true, eligible: false, total_minutes: 57,
    });
    const outline = await rows(`SELECT * FROM get_course_outline('metodo-ia-real')`);
    assert.deepEqual(outline.map((r) => [r.module_id, r.lesson_title, r.accessible]), [
      [legacy.mod01, 'O que é um LLM', true], [legacy.mod01, 'Tokens e contexto', true], [legacy.stray, 'Encontro gravado', false]]);
  });

  await t.test('Only administrators can import or finalise; anonymous callers cannot reach the RPCs', async () => {
    await as(users.free);
    await assert.rejects(importModule(pack.modules[0]), { code: '42501', message: /Administrator required/ });
    await assert.rejects(finalize(), { code: '42501', message: /Administrator required/ });
    await asAnon();
    for (const call of [() => importModule(pack.modules[0]), () => finalize(), () => rows(`SELECT * FROM get_course_outline('metodo-ia-real')`),
      certificateStatus, issueCertificate]) {
      await assert.rejects(call, { code: '42501', message: /permission denied/ });
    }
    await as(users.free);
    await assert.rejects(rows(`SELECT * FROM private.certificate_status('${users.paid}')`), /permission denied/);
    await asOwner();
    assert.equal((await one('SELECT count(*)::int AS n FROM modules WHERE code IS NOT NULL')).n, 0);
  });

  await t.test('The import rejects malformed packs and course slug conflicts without writing', async () => {
    await as(users.admin);
    const invalid = async (mutate, message) => {
      const payload = { format: pack.format, version: pack.version, course: structuredClone(pack.course), module: structuredClone(pack.modules[0]) };
      mutate(payload);
      await assert.rejects(one('SELECT admin_import_curriculum_module($1::jsonb)', [JSON.stringify(payload)]), message);
    };
    await invalid((p) => { p.format = 'outro/formato@2'; }, /format must be/);
    await invalid((p) => { p.module.lessons[0].type = 'video'; }, /MOD-00 lesson 1 type must be text or project/);
    await invalid((p) => { p.module.lessons[2].estimated_minutes = 12.5; }, /MOD-00 lesson 3 estimated_minutes must be an integer/);
    await invalid((p) => { p.module.lessons[1].estimated_minutes = '10'; }, /estimated_minutes must be an integer/);
    await invalid((p) => { p.module.title = '   '; }, /module\.title must not be empty/);
    await invalid((p) => { p.module.lessons[1].title = ''; }, /MOD-00 lesson 2 title must not be empty/);
    await invalid((p) => { p.module.lessons = {}; }, /module\.lessons must be a list/);
    await invalid((p) => { p.module.lessons[0].prompts = 'texto'; }, /prompts must be a list/);
    await invalid((p) => { p.module.trails = ['carreira', 'astronauta']; }, /module\.trails/);
    await invalid((p) => { p.module.code = 'MOD-1'; }, /module\.code/);
    await invalid((p) => { p.module.lessons[0].quiz.questions[0].correct = 7; }, /correct must be between 0 and 2/);
    await invalid((p) => { p.course.id = 'e0000000-0000-4000-8000-000000000001'; p.course.slug = 'curso-concorrente'; }, /already belongs to another course/);
    await invalid((p) => { p.course.slug = 'curso-concorrente'; }, /already belongs to another course/);
    await asOwner();
    assert.equal((await one('SELECT count(*)::int AS n FROM modules WHERE code IS NOT NULL')).n, 0);
    assert.equal((await one(`SELECT count(*)::int AS n FROM courses WHERE id = 'e0000000-0000-4000-8000-000000000001'`)).n, 0);
  });

  await t.test('The admin imports 13 modules, reuses legacy rows and archives legacy lessons', async () => {
    await as(users.admin);
    // A different slug in the pack never renames an existing course.
    const renamed = await importModule(pack.modules[0], { ...pack.course, slug: 'metodo-ia-real-v2' });
    assert.deepEqual(renamed, { module_id: pack.modules[0].id, code: 'MOD-00', lessons: 6, quizzes: 5 });
    await asOwner();
    assert.equal((await one('SELECT slug FROM courses WHERE id = $1', [COURSE_ID])).slug, 'metodo-ia-real');
    await as(users.admin);
    firstImport = [];
    for (const module of pack.modules.slice(0, 12)) firstImport.push(await importModule(module));
    await assert.rejects(finalize(), { code: '55000', message: /Import incomplete: modules MOD-12/ });
    await asOwner();
    // Each import publishes its module right away; finalisation only archives and hides.
    assert.deepEqual(await one('SELECT code, is_published FROM modules WHERE id = $1', [legacy.mod03]), { code: 'MOD-03', is_published: true });
    await as(users.admin);
    firstImport.push(await importModule(pack.modules[12]));
    await assert.rejects(finalize({ ...finalPayload, lesson_ids: [...finalPayload.lesson_ids, '99999999-9999-4999-8999-999999999999'] }),
      /Import incomplete: 1 lesson/);
    finalized = await finalize();

    assert.deepEqual(firstImport.map((r) => [r.code, r.lessons, r.quizzes]), pack.modules.map((m) => [m.code, 6, 5]));
    assert.equal(firstImport[1].module_id, legacy.mod01, 'oldest legacy MOD-01 row is reused, not the newer copy');
    assert.equal(firstImport[3].module_id, legacy.mod03);
    assert.equal(firstImport[8].module_id, legacy.mod08, 'title with ⭐ after the code still matches');
    assert.equal(firstImport[0].module_id, pack.modules[0].id);
    assert.equal(finalized.archived_lessons, 3);
    assert.equal(finalized.hidden_modules, 1);

    await asOwner();
    assert.deepEqual(await one('SELECT slug, title, is_published FROM courses WHERE id = $1', [COURSE_ID]),
      { slug: 'metodo-ia-real', title: 'Método IA Real', is_published: true });
    const modules = new Map((await rows('SELECT * FROM modules WHERE course_id = $1', [COURSE_ID])).map((m) => [m.id, m]));
    assert.deepEqual([...modules.values()].filter((m) => m.code).map((m) => m.code).sort(), pack.modules.map((m) => m.code));
    const mod01 = modules.get(legacy.mod01);
    assert.deepEqual([mod01.code, mod01.title, mod01.is_published, mod01.order_index, mod01.slug],
      ['MOD-01', pack.modules[1].title, true, 1, pack.modules[1].slug]);
    assert.deepEqual(mod01.trails, TRAIL_KEYS);
    assert.equal(mod01.intro, pack.modules[1].intro);
    assert.deepEqual([modules.get(legacy.mod03).code, modules.get(legacy.mod03).is_published], ['MOD-03', true]);
    assert.deepEqual([modules.get(legacy.mod08).is_star, modules.get(legacy.mod08).hours_label], [true, '~1h30']);
    assert.deepEqual([modules.get(legacy.mod01Copy).code, modules.get(legacy.mod01Copy).is_published], [null, false]);
    assert.equal(modules.get(legacy.stray).is_published, false);
    const archive = modules.get(finalized.archive_module_id);
    assert.deepEqual([archive.slug, archive.title, archive.order_index, archive.is_published, archive.code],
      ['arquivo-versao-anterior', 'Arquivo — aulas da versão anterior', 999, false, null]);

    const archived = await rows('SELECT id, video_url FROM lessons WHERE module_id = $1 ORDER BY id', [archive.id]);
    assert.deepEqual(archived.map((l) => l.id), [legacy.lessonA, legacy.lessonB, legacy.strayLesson]);
    assert.equal(archived[0].video_url, 'https://video.example.test/a');
    assert.deepEqual(await one('SELECT completed FROM lesson_progress WHERE user_id = $1 AND lesson_id = $2', [users.free, legacy.lessonA]),
      { completed: true });

    const lesson = pack.modules[3].lessons[0];
    assert.deepEqual(await one(`SELECT module_id, slug, title, type, estimated_minutes, duration_minutes, is_free,
        reviewed_at::text AS reviewed_at, prompts, content = $2 AS same_content FROM lessons WHERE id = $1`, [lesson.id, lesson.content]),
      { module_id: legacy.mod03, slug: lesson.slug, title: lesson.title, type: 'text', estimated_minutes: 10, duration_minutes: 10,
        is_free: false, reviewed_at: REVIEWED, prompts: lesson.prompts, same_content: true });
    const quiz = await one('SELECT lesson_id, questions, max_attempts, order_index FROM quizzes WHERE id = $1', [lesson.quiz.id]);
    assert.deepEqual(quiz, { lesson_id: lesson.id, questions: lesson.quiz.questions, max_attempts: 3, order_index: 0 });
    assert.equal((await one('SELECT type FROM lessons WHERE id = $1', [projectOf('MOD-03')])).type, 'project');
    assert.deepEqual(await courseCounts(), { modules: 16, lessons: 81, quizzes: 65 });
  });

  await t.test('Running the import and the finalisation again is idempotent and keeps video URLs', async () => {
    await asOwner();
    const recorded = pack.modules[2].lessons[0].id;
    await db.query(`UPDATE lessons SET video_url = 'https://video.example.test/gravada' WHERE id = $1`, [recorded]);
    const before = await tableCounts();
    await as(users.admin);
    const again = [];
    for (const module of pack.modules) again.push(await importModule(module));
    assert.deepEqual(again, firstImport);
    assert.deepEqual(await finalize(), { archived_lessons: 0, hidden_modules: 0, archive_module_id: finalized.archive_module_id });
    await asOwner();
    assert.deepEqual(await tableCounts(), before);
    assert.deepEqual(await courseCounts(), { modules: 16, lessons: 81, quizzes: 65 });
    assert.deepEqual(await one(`SELECT count(DISTINCT code)::int AS codes, count(code)::int AS coded,
      count(*) FILTER (WHERE slug = 'arquivo-versao-anterior')::int AS archives FROM modules WHERE course_id = $1`, [COURSE_ID]),
    { codes: 13, coded: 13, archives: 1 });
    assert.equal((await one('SELECT video_url FROM lessons WHERE id = $1', [recorded])).video_url, 'https://video.example.test/gravada');
  });

  await t.test('Schema constraints reject malformed codes, unknown trails and duplicate codes per course', async () => {
    await asOwner();
    await assert.rejects(db.query(`UPDATE modules SET code = 'MOD-1' WHERE id = $1`, [legacy.stray]), /modules_code_format/);
    await assert.rejects(db.query(`UPDATE modules SET trails = '{carreira,astronauta}' WHERE id = $1`, [legacy.stray]), /modules_trails_known/);
    await assert.rejects(db.query(`UPDATE modules SET code = 'MOD-03' WHERE id = $1`, [legacy.stray]), /modules_course_code_key/);
    await db.query(`INSERT INTO modules(course_id, title, code) VALUES ($1, 'Outro curso, mesmo código', 'MOD-03')`, [legacy.otherCourse]);
    await db.query(`DELETE FROM modules WHERE course_id = $1 AND code = 'MOD-03'`, [legacy.otherCourse]);
  });

  await t.test('Free accounts open MOD-00, MOD-01 and free lessons only; the outline lists every title', async () => {
    await as(users.free);
    const visible = async (code) => (await one(`SELECT count(*)::int AS n FROM lessons l JOIN modules m ON m.id = l.module_id
      WHERE m.course_id = $1 AND m.code = $2`, [COURSE_ID, code])).n;
    assert.equal(await visible('MOD-00'), 6);
    assert.equal(await visible('MOD-01'), 6);
    assert.equal(await visible('MOD-03'), 0);
    assert.equal(await visible('MOD-05'), 1, 'lesson marked free: true opens in a paid module');
    const sample = pack.modules[1].lessons[0];
    assert.equal((await one('SELECT content FROM lessons WHERE id = $1', [sample.id])).content, sample.content);
    assert.equal((await rows('SELECT id FROM lessons WHERE id = $1', [legacy.lessonA])).length, 0, 'archived lessons are hidden');

    const outline = await rows(`SELECT * FROM get_course_outline('metodo-ia-real')`);
    assert.deepEqual(Object.keys(outline[0]), OUTLINE_COLUMNS);
    assert.deepEqual(outline.map((r) => r.lesson_title), pack.modules.flatMap((m) => m.lessons.map((l) => l.title)));
    assert.deepEqual(outline.map((r) => r.accessible), pack.modules.flatMap((m) => m.lessons.map((l) => m.order_index <= 1 || l.is_free)));
    assert.equal(outline.filter((r) => r.accessible).length, 13);
    const mod03 = outline.find((r) => r.module_code === 'MOD-03');
    assert.deepEqual([mod03.course_id, mod03.module_id, mod03.module_trails, mod03.module_order, mod03.module_hours_label, mod03.lesson_type],
      [COURSE_ID, legacy.mod03, ['carreira', 'empreendedor'], 3, '~1h30', 'text']);
    assert.deepEqual([...new Set(outline.map((r) => r.module_code))], pack.modules.map((m) => m.code));
    assert.equal(outline.find((r) => r.module_code === 'MOD-08').module_is_star, true);
  });

  await t.test('The outline returns empty lesson columns for modules without lessons', async () => {
    await asOwner();
    await db.query(`INSERT INTO modules(id, course_id, title, order_index, is_published) VALUES ($1, $2, 'Módulo em preparação', 0, true)`,
      [legacy.emptyModule, legacy.otherCourse]);
    await as(users.free);
    const [row, ...rest] = await rows(`SELECT * FROM get_course_outline('curso-concorrente')`);
    assert.equal(rest.length, 0);
    assert.equal(row.module_id, legacy.emptyModule);
    for (const column of OUTLINE_COLUMNS.slice(10)) assert.equal(row[column], null, column);
    assert.deepEqual(await rows(`SELECT * FROM get_course_outline('curso-inexistente')`), []);
    await asOwner();
    await db.query(`UPDATE courses SET is_published = false WHERE id = $1`, [legacy.otherCourse]);
    await as(users.free);
    assert.deepEqual(await rows(`SELECT * FROM get_course_outline('curso-concorrente')`), [], 'unpublished courses have no outline');
  });

  await t.test('Paid access granted by an administrator opens every lesson and quiz', async () => {
    await as(users.admin);
    assert.equal((await rows(`UPDATE profiles SET access_status = 'active' WHERE id = $1 RETURNING id`, [users.paid])).length, 1);
    await as(users.paid);
    assert.equal((await one(`SELECT count(*)::int AS n FROM lessons l JOIN modules m ON m.id = l.module_id WHERE m.course_id = $1`,
      [COURSE_ID])).n, 78);
    assert.equal((await one('SELECT count(*)::int AS n FROM quizzes')).n, 65);
    const outline = await rows(`SELECT accessible FROM get_course_outline('metodo-ia-real')`);
    assert.equal(outline.length, 78);
    assert.ok(outline.every((r) => r.accessible === true));
  });

  await t.test('Project submissions: own https link for a project lesson the student can open', async () => {
    const textLesson = pack.modules[3].lessons[0].id;
    await as(users.paid);
    await deliver(users.paid, projectOf('MOD-03'));
    await assert.rejects(deliver(users.paid, textLesson), /row-level security/);
    await assert.rejects(deliver(users.other, projectOf('MOD-04')), /row-level security/);
    await assert.rejects(deliver(users.paid, projectOf('MOD-04'), 'http://example.com/entrega'), /project_submissions_url_https/);
    await assert.rejects(deliver(users.paid, projectOf('MOD-04'), 'https://example.com/com espaço'), /project_submissions_url_https/);
    await assert.rejects(deliver(users.paid, projectOf('MOD-04'), `https://example.com/${'x'.repeat(481)}`), /project_submissions_url_https/);
    await assert.rejects(db.query('INSERT INTO project_submissions(user_id, lesson_id, url, notes) VALUES ($1, $2, $3, $4)',
      [users.paid, projectOf('MOD-04'), 'https://example.com/ok', 'x'.repeat(2001)]), /project_submissions_notes_length/);
    await assert.rejects(deliver(users.paid, projectOf('MOD-03')), /duplicate key/);
    await assert.rejects(db.query('UPDATE project_submissions SET lesson_id = $1', [textLesson]), /row-level security/);
    await assert.rejects(db.query('UPDATE project_submissions SET user_id = $1', [users.other]), /row-level security/);
    const updated = await one(`UPDATE project_submissions SET notes = 'Versão 2', updated_at = '2020-01-01'
      RETURNING notes, updated_at > created_at AS touched`);
    assert.deepEqual(updated, { notes: 'Versão 2', touched: true });
    // Statement shape of supabase-js upsert({...}, { onConflict: 'user_id,lesson_id' }).select() used by the lesson page.
    const upserted = await one(`INSERT INTO project_submissions(user_id, lesson_id, url, notes, updated_at) VALUES ($1, $2, $3, NULL, now())
      ON CONFLICT (user_id, lesson_id) DO UPDATE SET user_id = EXCLUDED.user_id, lesson_id = EXCLUDED.lesson_id, url = EXCLUDED.url,
        notes = EXCLUDED.notes, updated_at = EXCLUDED.updated_at RETURNING url, notes`, [users.paid, projectOf('MOD-03'), 'https://example.com/v3']);
    assert.deepEqual(upserted, { url: 'https://example.com/v3', notes: null });

    await as(users.free);
    await deliver(users.free, projectOf('MOD-00'));
    await assert.rejects(deliver(users.free, projectOf('MOD-03')), /row-level security/, 'locked project lessons cannot be submitted');
    assert.equal((await rows('SELECT id FROM project_submissions')).length, 1);

    await as(users.other);
    assert.equal((await rows('SELECT id FROM project_submissions')).length, 0);
    assert.equal((await rows(`UPDATE project_submissions SET notes = 'x' RETURNING id`)).length, 0);
    assert.equal((await rows('DELETE FROM project_submissions RETURNING id')).length, 0);
    await as(users.admin);
    assert.equal((await rows('SELECT id FROM project_submissions')).length, 2);
    await as(users.free);
    assert.equal((await rows('DELETE FROM project_submissions RETURNING id')).length, 1);
    await asAnon();
    await assert.rejects(rows('SELECT id FROM project_submissions'), /permission denied/);
  });

  await t.test('Students choose their own learning track; invalid values and other profiles are rejected', async () => {
    await as(users.free);
    for (const track of ['carreira', 'empreendedor', 'criador', 'construtor', 'completa', null]) {
      const [row] = await rows('UPDATE profiles SET learning_track = $2 WHERE id = $1 RETURNING learning_track', [users.free, track]);
      assert.equal(row.learning_track, track);
    }
    await assert.rejects(db.query(`UPDATE profiles SET learning_track = 'astronauta' WHERE id = $1`, [users.free]), /profiles_learning_track_known/);
    assert.equal((await rows(`UPDATE profiles SET learning_track = 'carreira' WHERE id = $1 RETURNING id`, [users.paid])).length, 0);
    await assert.rejects(db.query(`UPDATE profiles SET access_status = 'active' WHERE id = $1`, [users.free]), /administrator/);
    await db.query(`UPDATE profiles SET learning_track = 'criador' WHERE id = $1`, [users.free]);
  });

  await t.test('Certificate for track carreira: 75% of its lessons plus the MOD-12 project completed and submitted', async () => {
    assert.deepEqual(carreira.map((m) => m.code), TRACKS.carreira.moduleCodes);
    assert.deepEqual([carreiraRequired, carreiraNeeded], [42, 32]);
    await as(users.paid);
    await db.query(`UPDATE profiles SET learning_track = 'carreira' WHERE id = $1`, [users.paid]);
    await complete(users.paid, [moduleByCode('MOD-04').lessons[0].id]);
    assert.deepEqual(await certificateStatus(), { track: 'carreira', required_lessons: 42, completed_lessons: 0, threshold_percent: 75,
      final_project_lesson_id: finalProject, final_project_done: false, eligible: false, total_minutes: carreiraMinutes });

    await complete(users.paid, carreiraOrdinary.slice(0, carreiraNeeded - 1));
    assert.deepEqual(await certificateStatus().then((s) => [s.completed_lessons, s.eligible]), [carreiraNeeded - 1, false]);
    await assert.rejects(issueCertificate(), { code: '42501', message: /^Course incomplete$/ });

    await complete(users.paid, carreiraOrdinary.slice(carreiraNeeded - 1, carreiraNeeded));
    assert.deepEqual(await certificateStatus().then((s) => [s.completed_lessons, s.final_project_done, s.eligible]), [carreiraNeeded, false, false]);
    await assert.rejects(issueCertificate(), { code: '42501', message: /Course incomplete: final project/ });

    await complete(users.paid, [finalProject]);
    assert.deepEqual(await certificateStatus().then((s) => [s.final_project_done, s.eligible]), [false, false], 'completion alone is not a delivery');
    await deliver(users.paid, finalProject, 'https://example.com/portfolio');
    assert.deepEqual(await certificateStatus().then((s) => [s.completed_lessons, s.final_project_done, s.eligible]), [carreiraNeeded + 1, true, true]);

    const certificate = await issueCertificate();
    assert.equal(certificate.course_name, `Método IA Real — Trilha ${TRACKS.carreira.label}`);
    assert.match(certificate.course_name, /Trilha Carreira \/ CLT/);
    assert.equal(certificate.total_hours, Math.max(1, Math.round(carreiraMinutes / 60)));
    assert.equal(certificate.student_name, 'Paula Pagante');
    assert.match(certificate.certificate_code, /^IAR-[0-9A-F]{32}$/);
    assert.equal((await issueCertificate()).id, certificate.id);
    assert.equal((await one('SELECT count(*)::int AS n FROM certificates WHERE user_id = $1', [users.paid])).n, 1);
  });

  await t.test('The 75% threshold rounds up: 31 of 42 lessons is not enough even with the final project delivered', async () => {
    await as(users.admin);
    await db.query(`UPDATE profiles SET access_status = 'active' WHERE id = $1`, [users.other]);
    await as(users.other);
    await db.query(`UPDATE profiles SET learning_track = 'carreira' WHERE id = $1`, [users.other]);
    await complete(users.other, [finalProject, ...carreiraOrdinary.slice(0, carreiraNeeded - 2)]);
    await deliver(users.other, finalProject);
    assert.deepEqual(await certificateStatus().then((s) => [s.completed_lessons, s.final_project_done, s.eligible]), [carreiraNeeded - 1, true, false]);
    await assert.rejects(issueCertificate(), { code: '42501', message: /^Course incomplete$/ });
    await complete(users.other, [carreiraOrdinary[carreiraNeeded - 2]]);
    assert.deepEqual(await certificateStatus().then((s) => [s.completed_lessons, s.eligible]), [carreiraNeeded, true]);
  });

  await t.test('Free accounts can follow their progress but cannot issue a certificate', async () => {
    await as(users.free);
    const status = await certificateStatus();
    assert.deepEqual([status.track, status.required_lessons, status.completed_lessons, status.threshold_percent, status.eligible],
      ['criador', 42, 0, 75, false], 'archived legacy progress does not count toward the new curriculum');
    await assert.rejects(issueCertificate(), { code: '42501', message: /Paid access required/ });
  });
});
