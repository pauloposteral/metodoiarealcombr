// UI integration checks only. All auth, database, AI, billing and email traffic is mocked/blocked.
import { chromium } from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const origin = process.env.STUDY_ORIGIN || 'http://127.0.0.1:4191';
const env = fs.readFileSync('.env', 'utf8');
const api = (env.match(/^VITE_SUPABASE_URL\s*=\s*["']?([^\s"']+)/m) || [])[1];
if (!api) throw Error('Public Supabase URL is needed for local fixtures; no credential is requested.');
const apiHost = new URL(api).hostname;
const storageKey = `sb-${apiHost.split('.')[0]}-auth-token`;
const uid = '00000000-0000-4000-8000-000000009001';
const lid = '00000000-0000-4000-8000-000000009002';
const mid = '00000000-0000-4000-8000-000000009003';
const cid = '0ddb2e14-13b7-4341-9fbb-27c2c73b6cc7';
const user = { id: uid, email: 'study-fixture@example.invalid', aud: 'authenticated', role: 'authenticated', created_at: '2026-10-20T00:00:00Z', app_metadata: { provider: 'email', providers: ['email'] }, user_metadata: { full_name: 'Aluno de teste' } };
const expires = Math.floor(Date.now() / 1000) + 3600;
const token = [Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'), Buffer.from(JSON.stringify({ sub: uid, aud: 'authenticated', role: 'authenticated', exp: expires, iss: api + '/auth/v1' })).toString('base64url'), 'local-fixture-not-a-real-token'].join('.');
const session = { access_token: token, refresh_token: 'local-fixture-only', expires_in: 3600, expires_at: expires, token_type: 'bearer', user };
const content = 'Esta é uma aula fictícia usada somente nos testes.\n\n## Entenda o contexto\n' + 'Uma explicação para conferir no seu ritmo. '.repeat(25) + '\n\n## Exemplo prático\nUm exemplo real do documento de teste.\n\n```text\nContexto: uma tarefa fictícia.\nFormato: três frases.\n```\n\n:::exercise Resultado da aula\nEscreva sua versão sem dados pessoais.\n:::\n\n## Resumo\nConfira o resultado e explique o que você aprendeu.';
const browser = await chromium.launch({ headless: true, ...(process.platform === 'win32' ? { channel: 'msedge' } : {}) });
const results = [];
fs.mkdirSync('test-results/study', { recursive: true });

async function setup(width, mode = 'full') {
  const context = await browser.newContext({ viewport: { width, height: 844 }, reducedMotion: 'reduce' });
  await context.addInitScript(({ key, session }) => { localStorage.setItem(key, JSON.stringify(session)); }, { key: storageKey, session });
  const writes = [];
  const lesson = { id: lid, module_id: mid, title: 'Uma aula para praticar com clareza', description: 'Conteúdo fictício de verificação de interface.', type: mode === 'project' ? 'project' : 'text', content: mode === 'minimal' ? 'Somente uma explicação, sem demonstração separada.' : content, prompts: mode === 'minimal' ? [] : ['Adapte este pedido ao seu contexto.'], video_url: null, estimated_minutes: 15, duration_minutes: 15, order_index: 0, reviewed_at: '2026-10-20' };
  const outline = [{ course_id: cid, module_id: mid, module_code: 'MOD-02', module_title: 'Prompts', module_description: 'Módulo fictício', module_order: 2, module_hours_label: '~1h', module_trails: ['carreira'], module_project_title: 'Meu projeto', module_is_star: false, lesson_id: lid, lesson_title: lesson.title, lesson_description: lesson.description, lesson_order: 0, lesson_type: lesson.type, estimated_minutes: 15, is_free: false, accessible: mode !== 'locked' }];
  const courses = [{ id: cid, slug: 'fixture-course', title: 'Formação de teste', description: '', thumbnail_url: null, estimated_hours: 1, difficulty: 'beginner', is_free: false }];
  const profile = { id: uid, access_status: 'active', onboarding_done: true, selected_trail: 'completa', full_name: 'Aluno de teste', points: 0 };
  await context.route('**/*', async route => {
    const req = route.request(); const u = new URL(req.url());
    if (u.origin === origin) return route.continue();
    if (u.hostname !== apiHost) return route.fulfill({ status: 200, body: '', contentType: 'text/plain' });
    if (u.pathname === '/auth/v1/user') return route.fulfill({ json: user });
    if (!u.pathname.startsWith('/rest/v1/')) return route.fulfill({ status: 200, json: {} });
    const name = u.pathname.split('/').pop();
    if (req.method() !== 'GET' && !u.pathname.includes('/rpc/')) writes.push({ name, body: req.postDataJSON() });
    if (u.pathname.includes('/rpc/')) {
      if (name === 'get_course_outline') return route.fulfill({ json: outline });
      if (name === 'has_role') return route.fulfill({ json: false });
      if (name === 'ai_sandbox_daily_limit') return route.fulfill({ json: 0 });
      if (/submit|issue|complete/i.test(name)) writes.push({ name, body: req.postDataJSON() });
      return route.fulfill({ json: [] });
    }
    let rows = [];
    if (name === 'profiles') rows = [profile];
    if (name === 'courses') rows = courses;
    if (name === 'lessons') rows = mode === 'locked' ? [] : [lesson];
    if (name === 'quizzes' && mode === 'full') rows = [{ id: '00000000-0000-4000-8000-000000009004', lesson_id: lid, title: 'Confira seu entendimento', questions: [{ question: 'O que precisa ser conferido?', options: ['O resultado', 'Nada'], correct: 0, explanation: 'Revise o resultado.' }], passing_score: 70, max_attempts: 3 }];
    const single = (req.headers().accept || '').includes('application/vnd.pgrst.object+json');
    return route.fulfill({ json: single ? rows[0] ?? null : rows, headers: { 'content-range': rows.length ? `0-${rows.length - 1}/${rows.length}` : '*/0' } });
  });
  const page = await context.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(`${origin}/membros/aula/${lid}`, { waitUntil: 'networkidle' });
  return { page, context, errors, writes };
}

try {
  for (const width of [360, 390, 768, 1440]) {
    const { page, context, errors, writes } = await setup(width);
    const nav = page.getByRole('navigation', { name: 'Etapas de estudo' });
    await nav.waitFor({ timeout: 15000 });
    assert.equal(await nav.getByRole('button').count(), 4);
    assert.equal(await page.locator('iframe,video').count(), 0, 'Never invent a video');
    for (const [name, target] of [['Ver:', '#exemplo-pratico'], ['Fazer:', '[data-callout-kind="exercise"]'], ['Revisar:', '#resumo'], ['Entender:', '[data-study-content]']]) {
      const button = nav.getByRole('button', { name: new RegExp('^' + name) });
      await button.focus(); await page.keyboard.press('Enter');
      assert.equal(await page.locator(target).evaluate(node => document.activeElement === node), true, 'Keyboard focus reaches the real section');
    }
    const notes = page.locator('[data-study-notes]');
    await notes.getByRole('button').click();
    await notes.locator('textarea').fill('Meu rascunho deve permanecer ao navegar.');
    await nav.getByRole('button', { name: /^Fazer:/ }).click();
    await nav.getByRole('button', { name: /^Revisar:/ }).click();
    assert.equal(await notes.locator('textarea').inputValue(), 'Meu rascunho deve permanecer ao navegar.');
    assert.equal(writes.some(w => /quiz_attempt|submit_quiz|issue_certificate|project_submissions/.test(w.name) || (w.name === 'lesson_progress' && JSON.stringify(w.body).includes('"completed":true'))), false, 'Navigation cannot complete, submit or grade');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    if (overflow) {
      console.log('OVERFLOW', width, await page.evaluate(() => Array.from(document.querySelectorAll('body *')).map(node => ({ tag: node.tagName, className: String(node.className).slice(0,140), width: Math.round(node.getBoundingClientRect().width), right: Math.round(node.getBoundingClientRect().right), text: node.textContent?.slice(0,70) })).filter(x => x.right > innerWidth + 1 && x.width > 0).slice(0,22)));
      await page.screenshot({ path: `test-results/study/overflow-${width}.png`, fullPage: true });
    }
    assert.equal(overflow, false, 'No horizontal overflow');
    assert.deepEqual(errors, []);
    await nav.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/study/lesson-${width}.png` });
    results.push({ width, mode: 'full', steps: 4, keyboard: true, draftPreserved: true, noCompletion: true, noOverflow: true, errors });
    await context.close();
  }
  for (const mode of ['minimal', 'project', 'locked']) {
    const { page, context, errors } = await setup(390, mode);
    const nav = page.getByRole('navigation', { name: 'Etapas de estudo' });
    if (mode === 'locked') {
      await page.getByText(/Seu plano|acesso completo|bloqueada|desbloquear/i).first().waitFor({ timeout: 15000 });
      assert.equal(await nav.count(), 0); assert.equal(await page.locator('[data-study-content]').count(), 0);
    } else {
      await nav.waitFor({ timeout: 15000 });
      if (mode === 'minimal') assert.equal(await nav.getByRole('button').count(), 2);
      else { await nav.getByRole('button', { name: /^Fazer:/ }).click(); assert.equal(await page.locator('[data-study-project]').evaluate(node => document.activeElement === node), true); }
    }
    assert.deepEqual(errors, []); results.push({ width: 390, mode, passed: true }); await context.close();
  }
  fs.writeFileSync('test-results/study/results.json', JSON.stringify({ externalServices: 'mocked, no production identity', results }, null, 2));
  console.log(JSON.stringify(results));
} finally { await browser.close(); }
