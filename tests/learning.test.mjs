import test from 'node:test';
import assert from 'node:assert/strict';
import { parseMarkdown, parseInline, slugify, splitTableRow, inlineText } from '../src/lib/markdown.ts';
import {
  CURRICULUM_COURSE_ID,
  buildCourseOutline,
  certificateRequirements,
  curriculumModules,
  findResumeLesson,
  hoursLabelToHours,
  lessonNavigation,
  lessonsForTrack,
  locateLesson,
  moduleProjectLesson,
  moduleTrails,
  pickMainCourse,
  summarizeProgress,
  trackDisplayName,
} from '../src/lib/curriculum.ts';
import { TRAIL_QUIZ, countAnswered, joinReasons, scoreTrailQuiz } from '../src/lib/trailQuiz.ts';
import { isHttpsUrl, videoEmbedUrl } from '../src/lib/httpsUrl.ts';
import { projectSubmissionSchema } from '../src/lib/projectSubmission.ts';

// ---------------------------------------------------------------------------
// Markdown
// ---------------------------------------------------------------------------

test('Markdown: GFM table with header, alignment, inline cells and ragged rows', () => {
  const [table, after] = parseMarkdown([
    '| Situação | O que não pode faltar | Exemplo |',
    '|:---|:---:|---:|',
    '| Tarefa **rápida** | Entrega e Acabamento | `a \\| b` |',
    '| Só uma célula |',
    '',
    'Depois da tabela.',
  ].join('\n'));
  assert.equal(table.type, 'table');
  assert.deepEqual(table.align, ['left', 'center', 'right']);
  assert.deepEqual(table.header.map(inlineText), ['Situação', 'O que não pode faltar', 'Exemplo']);
  assert.equal(table.rows.length, 2);
  assert.deepEqual(table.rows[0][0], [{ type: 'text', value: 'Tarefa ' }, { type: 'strong', children: [{ type: 'text', value: 'rápida' }] }]);
  assert.deepEqual(table.rows[0][2], [{ type: 'code', value: 'a | b' }]);
  assert.deepEqual(table.rows[1].map(inlineText), ['Só uma célula', '', '']);
  assert.equal(after.type, 'paragraph');
});

test('Markdown: a pipe line without a delimiter row stays a paragraph', () => {
  const blocks = parseMarkdown('Escolha A | B\n---');
  assert.deepEqual(blocks.map((block) => block.type), ['paragraph', 'thematicBreak']);
  assert.deepEqual(splitTableRow('| a | b \\| c |'), ['a', 'b | c']);
});

test('Markdown: :::blocks render their inner content as full Markdown', () => {
  const [warning, exercise] = parseMarkdown([
    ':::warning Os três **tropeços**',
    '- Despejar contexto e esquecer a [Entrega](/membros/aula/x).',
    '- Colar dados sensíveis: veja o [guia](https://example.com/guia).',
    ':::',
    ':::exercise Resultado da aula',
    'Tempo: cerca de 8 minutos.',
    '3. Escolha uma tarefa real.',
    '4. Reescreva com as quatro partes.',
    'Está pronto quando você tiver o antes e o depois.',
    ':::',
  ].join('\n'));
  assert.equal(warning.type, 'callout');
  assert.equal(warning.kind, 'warning');
  assert.equal(inlineText(warning.title), 'Os três tropeços');
  assert.equal(warning.children[0].type, 'bulletList');
  const [firstItem, secondItem] = warning.children[0].items;
  assert.deepEqual(firstItem.at(-2), { type: 'link', href: '/membros/aula/x', target: 'internal', children: [{ type: 'text', value: 'Entrega' }] });
  assert.equal(secondItem.find((node) => node.type === 'link').target, 'external');

  assert.equal(exercise.kind, 'exercise');
  assert.deepEqual(exercise.children.map((block) => block.type), ['paragraph', 'orderedList', 'paragraph']);
  assert.deepEqual(exercise.children[1].items.map((item) => item.number), [3, 4]);
});

test('Markdown: nested and unclosed blocks do not swallow the rest of the lesson', () => {
  const blocks = parseMarkdown([
    ':::tip',
    '```text',
    ':::',
    '```',
    ':::success Dentro',
    'Ok',
    ':::',
    ':::',
    'Fora do bloco.',
  ].join('\n'));
  assert.deepEqual(blocks.map((block) => block.type), ['callout', 'paragraph']);
  assert.deepEqual(blocks[0].children.map((block) => block.type), ['code', 'callout']);
  assert.equal(blocks[0].children[0].value, ':::');
  const unclosed = parseMarkdown(':::tip Sem fim\nTexto');
  assert.equal(unclosed[0].type, 'callout');
  assert.equal(unclosed[0].children.length, 1);
});

test('Markdown: links open internally, externally or not at all', () => {
  const nodes = parseInline('[trilha](/membros/trilha) [guia](https://ai.google.dev/x_(y)) [mail](mailto:a@b.co) [xss](javascript:alert(1)) [rel](//evil.test)');
  const links = nodes.filter((node) => node.type === 'link');
  assert.deepEqual(links.map((link) => [link.target, link.href]), [
    ['internal', '/membros/trilha'],
    ['external', 'https://ai.google.dev/x_(y)'],
    ['mailto', 'mailto:a@b.co'],
  ]);
  const text = inlineText(nodes);
  assert.ok(text.includes('xss') && !text.includes('javascript'), 'unsafe link keeps its label only');
  assert.ok(text.includes('rel') && !text.includes('evil'), 'protocol-relative link is dropped');
  assert.deepEqual(parseInline('![logo](javascript:x)'), [{ type: 'text', value: 'logo' }]);
});

test('Markdown: fenced code keeps its text verbatim and the language', () => {
  const [code, paragraph] = parseMarkdown('```text\nFaz um **post** sobre [x](y).\n\n  indentado\n```\nDepois');
  assert.deepEqual(code, { type: 'code', language: 'text', value: 'Faz um **post** sobre [x](y).\n\n  indentado' });
  assert.equal(paragraph.type, 'paragraph');
  const [unclosed] = parseMarkdown('```\nsem fechamento');
  assert.deepEqual(unclosed, { type: 'code', language: null, value: 'sem fechamento' });
});

test('Markdown: lists keep source numbers and one line is one paragraph', () => {
  const blocks = parseMarkdown('1. Um\n2. Dois\n\n5. Cinco\n- a\n* b\nLinha solta\nOutra linha');
  assert.deepEqual(blocks.map((block) => block.type), ['orderedList', 'bulletList', 'paragraph', 'paragraph']);
  assert.deepEqual(blocks[0].items.map((item) => item.number), [1, 2, 5]);
  assert.equal(blocks[1].items.length, 2);
  const [continued] = parseMarkdown('- Item\n  continua aqui');
  assert.equal(inlineText(continued.items[0]), 'Item continua aqui');
});

test('Markdown: headings get stable, unique slug ids; quotes and inline marks nest', () => {
  const blocks = parseMarkdown('## Por que é útil?\n### R — Realidade\n## Resumo\n## Resumo\n> **Nota:** use *com* `cuidado`\n---');
  assert.deepEqual(blocks.filter((b) => b.type === 'heading').map((b) => [b.level, b.id]), [
    [2, 'por-que-e-util'],
    [3, 'r-realidade'],
    [2, 'resumo'],
    [2, 'resumo-2'],
  ]);
  const quote = blocks.find((block) => block.type === 'blockquote');
  assert.deepEqual(quote.children[0].children.map((node) => node.type), ['strong', 'text', 'emphasis', 'text', 'code']);
  assert.equal(blocks.at(-1).type, 'thematicBreak');
  assert.equal(slugify('!!!'), 'secao');
});

test('Markdown: emphasis edge cases stay literal', () => {
  assert.deepEqual(parseInline('2 * 3 * 4'), [{ type: 'text', value: '2 * 3 * 4' }]);
  assert.deepEqual(parseInline('snake_case_name'), [{ type: 'text', value: 'snake_case_name' }]);
  assert.deepEqual(parseInline('\\*literal\\* [PREENCHA]'), [{ type: 'text', value: '*literal* [PREENCHA]' }]);
  const nested = parseInline('*a **b** c*');
  assert.equal(nested[0].type, 'emphasis');
  assert.equal(nested[0].children[1].type, 'strong');
});

// ---------------------------------------------------------------------------
// Curriculum outline, tracks and navigation
// ---------------------------------------------------------------------------

function row(module, lesson) {
  return {
    course_id: 'course-1',
    module_id: module.id,
    module_code: module.code ?? null,
    module_title: module.title ?? module.id,
    module_description: null,
    module_order: module.order,
    module_hours_label: '~1h',
    module_trails: module.trails ?? [],
    module_project_title: module.project ?? null,
    module_is_star: module.star ?? false,
    lesson_id: lesson?.id ?? null,
    lesson_title: lesson?.id ?? null,
    lesson_description: null,
    lesson_order: lesson?.order ?? null,
    lesson_type: lesson?.type ?? (lesson ? 'text' : null),
    estimated_minutes: lesson ? 10 : null,
    is_free: false,
    accessible: lesson ? lesson.accessible ?? true : null,
  };
}

const MOD00 = { id: 'm0', code: 'MOD-00', order: 0 };
const MOD02 = { id: 'm2', code: 'MOD-02', order: 2, project: 'Seus 10 prompts' };
const MOD03 = { id: 'm3', code: 'MOD-03', order: 3 };
const MOD04 = { id: 'm4', code: 'MOD-04', order: 4 };
const outline = buildCourseOutline([
  row(MOD03, { id: 'c1', order: 0, accessible: false }),
  row(MOD02, { id: 'b2', order: 1, type: 'project' }),
  row(MOD00, { id: 'a1', order: 0 }),
  row(MOD02, { id: 'b1', order: 0 }),
  row(MOD00, { id: 'a2', order: 1 }),
  row(MOD00, { id: 'a2', order: 1 }),
  row(MOD04, null),
  row(MOD04, null),
  row(MOD03, { id: 'c2', order: 1, accessible: false }),
]);

test('Outline: modules and lessons follow course order without duplicates', () => {
  assert.equal(outline.courseId, 'course-1');
  assert.deepEqual(outline.modules.map((module) => module.code), ['MOD-00', 'MOD-02', 'MOD-03', 'MOD-04']);
  assert.deepEqual(outline.lessons.map((lesson) => lesson.id), ['a1', 'a2', 'b1', 'b2', 'c1', 'c2']);
  assert.equal(outline.modules[3].lessons.length, 0);
  assert.equal(moduleProjectLesson(outline.modules[1]).id, 'b2');
  assert.deepEqual(locateLesson(outline, 'b2'), { module: outline.modules[1], lesson: outline.modules[1].lessons[1], position: 2, moduleLessonCount: 2 });
  assert.equal(locateLesson(outline, 'zz'), null);
});

test('Outline: modules with equal order_index do not interleave their lessons', () => {
  const tied = buildCourseOutline([
    row({ id: 'x', title: 'MOD-05 X', order: 5 }, { id: 'x1', order: 0 }),
    row({ id: 'y', title: 'MOD-06 Y', order: 5 }, { id: 'y1', order: 0 }),
    row({ id: 'x', title: 'MOD-05 X', order: 5 }, { id: 'x2', order: 1 }),
  ]);
  assert.deepEqual(tied.lessons.map((lesson) => lesson.id), ['x1', 'x2', 'y1']);
  assert.deepEqual(tied.modules.map((module) => [module.code, module.displayTitle]), [['MOD-05', 'X'], ['MOD-06', 'Y']]);
});

test('Navigation crosses module boundaries and only the last lesson leads to the certificate', () => {
  assert.deepEqual(
    Object.fromEntries(Object.entries(lessonNavigation(outline, 'a2')).map(([key, value]) => [key, value?.id ?? value])),
    { previous: 'a1', next: 'b1', nextModule: 'm2', isLastLesson: false },
  );
  const inside = lessonNavigation(outline, 'b1');
  assert.equal(inside.next.id, 'b2');
  assert.equal(inside.nextModule, null);
  const last = lessonNavigation(outline, 'c2');
  assert.equal(last.next, null);
  assert.equal(last.isLastLesson, true);
  assert.equal(lessonNavigation(outline, 'a1').previous, null);
  assert.equal(lessonNavigation(outline, 'missing').isLastLesson, false);
});

test('Tracks: resume lesson follows track order, skips locked lessons and falls back to the course', () => {
  // Carreira = 00, 01, 02, 03, 05, 10, 12 → MOD-04 is outside the track.
  assert.deepEqual(lessonsForTrack(outline, 'carreira').map((lesson) => lesson.id), ['a1', 'a2', 'b1', 'b2', 'c1', 'c2']);
  assert.deepEqual(lessonsForTrack(outline, 'criador').map((lesson) => lesson.id), ['a1', 'a2', 'b1', 'b2']);
  assert.equal(findResumeLesson(outline, 'carreira', new Set(['a1'])).id, 'a2');
  assert.equal(findResumeLesson(outline, 'carreira', new Set(['a1', 'a2', 'b1', 'b2'])), null, 'locked lessons are never the resume target');
  const legacy = buildCourseOutline([row({ id: 'l', title: 'Bônus', order: 1 }, { id: 'l1', order: 0 })]);
  assert.equal(findResumeLesson(legacy, 'construtor', new Set()).id, 'l1', 'a track that matches nothing uses the whole course');
  assert.deepEqual(summarizeProgress(lessonsForTrack(outline, 'criador'), new Set(['a1', 'b2', 'zz'])), { total: 4, completed: 2, percent: 50, minutes: 40 });
  assert.equal(summarizeProgress([], new Set()).percent, 0);
});

test('Tracks: module trails and curriculum module filter', () => {
  assert.deepEqual(moduleTrails({ code: 'MOD-08' }), ['construtor']);
  assert.deepEqual(moduleTrails({ code: 'MOD-02' }), ['carreira', 'empreendedor', 'criador', 'construtor']);
  assert.deepEqual(moduleTrails({ code: null, title: 'Bônus', trails: ['criador', 'x'] }), ['criador']);
  assert.deepEqual(curriculumModules([{ code: null }, { code: 'MOD-01' }]), [{ code: 'MOD-01' }]);
  assert.deepEqual(curriculumModules([{ code: null, id: 1 }]), [{ code: null, id: 1 }]);
  assert.equal(hoursLabelToHours('~2h30'), 2.5);
  assert.equal(hoursLabelToHours('2 horas'), null);
});

test('Courses and certificate requirements', () => {
  assert.equal(pickMainCourse([{ id: 'other' }, { id: CURRICULUM_COURSE_ID }]).id, CURRICULUM_COURSE_ID);
  assert.equal(pickMainCourse([{ id: 'other' }]).id, 'other');
  assert.equal(pickMainCourse([]), null);
  const base = { track: 'carreira', required_lessons: 58, completed_lessons: 40, threshold_percent: 75, final_project_lesson_id: 'p', final_project_done: false, eligible: false, total_minutes: 900 };
  assert.deepEqual(certificateRequirements(base), {
    track: 'carreira', totalLessons: 58, completedLessons: 40, neededLessons: 44, thresholdPercent: 75,
    lessonsMet: false, finalProjectLessonId: 'p', projectMet: false, percentOfGoal: 90, eligible: false,
  });
  const done = certificateRequirements({ ...base, track: null, completed_lessons: 44, final_project_done: true, eligible: true });
  assert.equal(done.track, 'completa');
  assert.equal(done.lessonsMet && done.projectMet && done.eligible, true);
  assert.equal(certificateRequirements({ ...base, threshold_percent: 100, required_lessons: 10, completed_lessons: 9 }).neededLessons, 10);
  assert.equal(trackDisplayName('criador'), 'Trilha Criador de conteúdo');
  assert.equal(trackDisplayName(null), 'Formação completa');
});

// ---------------------------------------------------------------------------
// Trail quiz
// ---------------------------------------------------------------------------

test('Trail quiz: five questions, each option weighting at least one track', () => {
  assert.deepEqual(TRAIL_QUIZ.map((question) => question.id), ['goal', 'context', 'build', 'time', 'tech']);
  for (const question of TRAIL_QUIZ) {
    for (const option of question.options) {
      if (question.id !== 'time') assert.ok(Object.values(option.weights).some((weight) => weight > 0), option.id);
    }
  }
});

test('Trail quiz: recommendation, reasons, pace and incomplete answers', () => {
  assert.equal(scoreTrailQuiz({ goal: 'work', context: 'employee' }), null);
  assert.equal(countAnswered({ goal: 'work', context: 'nope' }), 1);
  const career = scoreTrailQuiz({ goal: 'work', context: 'employee', build: 'office', time: 'short', tech: 'basic' });
  assert.equal(career.track, 'carreira');
  assert.ok(career.reasons.includes('você quer ganhar tempo e se destacar no trabalho'));
  assert.equal(career.estimatedWeeks, 13, '~18h30 at 1.5h per week, rounded up');
  const builder = scoreTrailQuiz({ goal: 'build', context: 'transition', build: 'app', time: 'medium', tech: 'tinkerer' });
  assert.equal(builder.track, 'construtor');
  const full = scoreTrailQuiz({ goal: 'all', context: 'transition', build: 'portfolio', time: 'long', tech: 'tinkerer' });
  assert.equal(full.track, 'completa');
  const busy = scoreTrailQuiz({ goal: 'all', context: 'employee', build: 'office', time: 'short', tech: 'basic' });
  assert.equal(busy.track, 'carreira', 'little weekly time favours a focused track');
  const tie = scoreTrailQuiz({ goal: 'work', context: 'transition', build: 'app', time: 'medium', tech: 'comfortable' });
  assert.equal(tie.scores.carreira, tie.scores.construtor);
  assert.equal(tie.track, 'carreira', 'ties go to the main goal');
  assert.equal(joinReasons(['a', 'b', 'c']), 'a, b e c');
  assert.equal(joinReasons(['a']), 'a');
});

// ---------------------------------------------------------------------------
// URLs and project submissions
// ---------------------------------------------------------------------------

test('Video and project URLs must be https', () => {
  assert.equal(isHttpsUrl('https://docs.google.com/document/d/1'), true);
  assert.equal(isHttpsUrl('http://example.com'), false);
  assert.equal(isHttpsUrl('https://user:pass@example.com'), false);
  assert.equal(isHttpsUrl('javascript:alert(1)'), false);
  assert.equal(isHttpsUrl('https://localhost'), false);
  assert.equal(videoEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=1'), 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
  assert.equal(videoEmbedUrl('https://youtu.be/dQw4w9WgXcQ'), 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
  assert.equal(videoEmbedUrl('https://vimeo.com/123456'), 'https://player.vimeo.com/video/123456');
  assert.equal(videoEmbedUrl('https://player.vimeo.com/video/1?h=2'), 'https://player.vimeo.com/video/1?h=2');
  assert.equal(videoEmbedUrl('http://example.com/video'), null);
  assert.equal(videoEmbedUrl(null), null);
});

test('Project submission schema trims, validates and normalises notes', () => {
  assert.deepEqual(projectSubmissionSchema.parse({ url: ' https://meu.app/demo ', notes: '  ' }), { url: 'https://meu.app/demo', notes: null });
  const invalid = projectSubmissionSchema.safeParse({ url: 'meu-projeto.com', notes: 'x'.repeat(2001) });
  assert.equal(invalid.success, false);
  assert.deepEqual(invalid.error.issues.map((issue) => issue.path[0]).sort(), ['notes', 'url']);
  assert.equal(projectSubmissionSchema.safeParse({ url: `https://a.co/${'x'.repeat(500)}`, notes: '' }).success, false);
});
