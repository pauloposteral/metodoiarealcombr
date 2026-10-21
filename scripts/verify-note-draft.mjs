// UI integration checks only. All auth, database, AI, billing and email traffic is mocked/blocked.
import { chromium } from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const origin = process.env.STUDY_ORIGIN || 'http://127.0.0.1:4195';
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
  const writes = []; let noteRow = mode === 'existing' ? {id:'00000000-0000-4000-8000-000000009090',user_id:uid,lesson_id:lid,content:'Versão inicial na nuvem',updated_at:'2026-10-20T10:00:00.000Z'} : null; let failNextWrite = false; let saveDelay = 0;
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
    if (name === 'lesson_notes') {
      const single = (req.headers().accept || '').includes('application/vnd.pgrst.object+json');
      if (req.method() === 'GET') return route.fulfill({json:single ? noteRow : noteRow ? [noteRow] : []});
      const body = req.postDataJSON(); writes.push({name,method:req.method(),body,expected:u.searchParams.get('updated_at')});
      if (failNextWrite) { failNextWrite=false; return route.fulfill({status:503,json:{message:'Fixture save unavailable'}}); }
      if (saveDelay) await new Promise(resolve => setTimeout(resolve,saveDelay));
      if (req.method()==='PATCH') {
        if (!noteRow || u.searchParams.get('updated_at') !== 'eq.'+noteRow.updated_at) return route.fulfill({json:single?null:[]});
        noteRow={...noteRow,...body};
      } else if (req.method()==='POST') {
        if(noteRow)return route.fulfill({status:409,json:{code:'23505',message:'Fixture note already exists'}});
        noteRow={id:'00000000-0000-4000-8000-000000009090',...body};
      } else throw Error('Unexpected notes method '+req.method());
      return route.fulfill({json:single?noteRow:[noteRow]});
    }
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
  const page = await context.newPage(); page.on('dialog',dialog=>dialog.accept()); const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(`${origin}/membros/aula/${lid}`, { waitUntil: 'networkidle' });
  return { page, context, errors, writes, note:()=>noteRow, failSave:()=>{failNextWrite=true;}, delaySave:ms=>{saveDelay=ms;} };
}

async function editor(page) { const notes=page.locator('[data-study-notes]'); if(await notes.locator('textarea').count()===0)await notes.getByRole('button').first().click();await notes.locator('textarea').waitFor();return notes; }
async function waitFor(check,label){for(let i=0;i<70;i++){if(check())return;await new Promise(r=>setTimeout(r,100));}throw Error('Timed out: '+label);}
const verified=[];
try {
 {
  const state=await setup(390);const {page,context}=state;let notes=await editor(page);
  await notes.locator('textarea').fill('Rascunho que não pode sumir numa recarga rápida.');await page.evaluate(()=>window.__noteDocument='before-reload');
  await page.reload({waitUntil:'networkidle'});await page.locator('[data-study-navigation]').waitFor();assert.equal(await page.evaluate(()=>window.__noteDocument),undefined);
  notes=await editor(page);assert.equal(await notes.locator('textarea').inputValue(),'Rascunho que não pode sumir numa recarga rápida.');
  await waitFor(()=>state.note()?.content==='Rascunho que não pode sumir numa recarga rápida.','restored draft cloud save');await notes.getByText('Salvo na nuvem',{exact:true}).waitFor();
  verified.push({scenario:'quick-reload',newDocument:true,draftRecovered:true,eventualCloudSave:true});await context.close();
 }
 {
  const state=await setup(390);const {page,context}=state;state.failSave();const notes=await editor(page);
  await notes.locator('textarea').fill('Meu texto deve sobreviver à falha.');await notes.getByRole('button',{name:'Salvar agora'}).click();
  await notes.getByRole('alert').filter({hasText:'Não foi possível salvar na nuvem'}).waitFor();assert.equal(await notes.locator('textarea').inputValue(),'Meu texto deve sobreviver à falha.');assert.equal(state.note(),null);
  await notes.getByRole('button',{name:'Salvar agora'}).click();await notes.getByText('Salvo na nuvem',{exact:true}).waitFor();assert.equal(state.note()?.content,'Meu texto deve sobreviver à falha.');
  verified.push({scenario:'failed-save-retry',noFalseSuccess:true,textPreserved:true,retryConfirmed:true});await context.close();
 }
 {
  const state=await setup(1440,'existing');const {page,context}=state;const notesA=await editor(page);const second=await context.newPage();second.on('dialog',d=>d.accept());await second.goto(origin+'/membros/aula/'+lid,{waitUntil:'networkidle'});const notesB=await editor(second);
  await notesA.locator('textarea').fill('Edição salva na primeira aba');await notesA.getByRole('button',{name:'Salvar agora'}).click();await notesA.getByText('Salvo na nuvem',{exact:true}).waitFor();
  await notesB.locator('textarea').fill('Minha edição da segunda aba');await notesB.getByRole('button',{name:'Salvar agora'}).click();await notesB.getByText('Há uma versão mais recente na nuvem.',{exact:true}).waitFor();
  assert.equal(state.note()?.content,'Edição salva na primeira aba');assert.equal(await notesB.locator('textarea').inputValue(),'Minha edição da segunda aba');
  await notesB.getByRole('button',{name:'Salvar meu rascunho',exact:true}).click();await notesB.getByText('Salvo na nuvem',{exact:true}).waitFor();assert.equal(state.note()?.content,'Minha edição da segunda aba');
  assert.ok(state.writes.filter(w=>w.method==='PATCH').every(w=>w.expected?.startsWith('eq.')));verified.push({scenario:'two-tabs',conflictDetected:true,noSilentOverwrite:true,explicitResolution:true});await context.close();
 }
 {
  const state=await setup(390,'existing');state.delaySave(850);const {page,context}=state;const notes=await editor(page);
  await notes.locator('textarea').fill('Texto enviado primeiro');const started=page.waitForRequest(r=>r.method()==='PATCH'&&r.url().includes('/lesson_notes'));await notes.getByRole('button',{name:'Salvar agora'}).click();await started;
  await notes.locator('textarea').fill('Texto digitado durante a resposta');await waitFor(()=>state.note()?.content==='Texto digitado durante a resposta','second revision persisted');
  await notes.getByText('Salvo na nuvem',{exact:true}).waitFor();assert.equal(await notes.locator('textarea').inputValue(),'Texto digitado durante a resposta');assert.ok(state.writes.length>=2);verified.push({scenario:'late-response',latestTypingPreserved:true,secondSaveConfirmed:true});await context.close();
 }
 fs.mkdirSync('test-results/notes',{recursive:true});fs.writeFileSync('test-results/notes/results.json',JSON.stringify({scope:'Simulated storage/network and auth; no production note writes',results:verified},null,2));console.log(JSON.stringify(verified));
}finally{await browser.close();}
