import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const moduleUrl = new URL('../src/lib/studyOutline.ts', import.meta.url);
// A missing feature must fail assertions instead of preventing the remaining tests from running.
const { buildStudyOutline } = fs.existsSync(moduleUrl) ? await import(moduleUrl.href) : { buildStudyOutline: () => [] };
const lesson = 'Introdução.\n\n## Ideia central\nExplicação.\n\n## Exemplo prático\nUm caso para observar.\n\n:::exercise Agora você\nFaça sua versão.\n:::\n\n## Resumo\nConfira o que aprendeu.';
const steps = (content, options = {}) => buildStudyOutline(content, options);

test('Study shortcuts map to four real parts, without marking a lesson complete', () => {
  const result = steps(lesson);
  assert.deepEqual(result.map(x => x.key), ['understand', 'see', 'practice', 'review']);
  assert.deepEqual(result[1].target, { kind: 'heading', id: 'exemplo-pratico' });
  assert.deepEqual(result[2].target, { kind: 'exercise' });
  assert.deepEqual(result[3].target, { kind: 'heading', id: 'resumo' });
  assert.ok(result.every(x => !Object.hasOwn(x, 'completed')));
});
test('A text-only lesson does not invent a video, example or exercise', () => {
  assert.deepEqual(steps('Uma explicação curta.').map(x => x.key), ['understand', 'review']);
});
test('An exercise containing code is not mistaken for a separate demonstration', () => {
  const result = steps('Ideia.\n\n:::exercise Exercite\n```text\nSeu rascunho\n```\n:::');
  assert.deepEqual(result.map(x => x.key), ['understand', 'practice', 'review']);
});
test('A real top-level code example is a usable demonstration', () => {
  assert.deepEqual(steps('Ideia.\n\n```text\nPedido de exemplo\n```')[1].target, { kind: 'code' });
});
test('A real comparison table is a usable demonstration', () => {
  const result = steps('Ideia.\n\n| Antes | Depois |\n|---|---|\n| A | B |');
  assert.deepEqual(result.find(x => x.key === 'see').target, { kind: 'table' });
});
test('Supported video is preferred and an unsafe URL never invents a player', () => {
  assert.deepEqual(steps(lesson, { videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' })[1].target, { kind: 'video' });
  assert.equal(steps('Texto.', { videoUrl: 'javascript:alert(1)' }).some(x => x.key === 'see'), false);
});
test('Project practice points to the existing delivery form, not to an automatic submission', () => {
  assert.deepEqual(steps(lesson, { isProject: true }).find(x => x.key === 'practice').target, { kind: 'project' });
});
test('Prompts are offered when no structured exercise exists', () => {
  assert.deepEqual(steps('Texto.', { promptsCount: 2 }).find(x => x.key === 'practice').target, { kind: 'prompts' });
});
test('Summary fallback points to the real quiz/completion area', () => {
  assert.deepEqual(steps('Texto.').find(x => x.key === 'review').target, { kind: 'review' });
});
test('Heading anchors come from the existing parser and keep duplicate suffixes', () => {
  const result = steps('## Resumo\nA.\n\n## Resumo\nB.\n\n## Antes e depois: café\nC.');
  assert.equal(result.find(x => x.key === 'see').target.id, 'antes-e-depois-cafe');
  assert.equal(result.find(x => x.key === 'review').target.id, 'resumo-2');
});
test('No shortcut is produced for a blank lesson with no real interactive section', () => {
  assert.deepEqual(steps(null), []);
});
test('Generating shortcuts never rewrites the source', () => {
  const source = lesson + '\n\n[Referência](https://example.com)';
  const before = JSON.stringify(source);
  const result = steps(source);
  assert.equal(JSON.stringify(source), before);
  assert.equal(result[0].label, 'Entender');
});
