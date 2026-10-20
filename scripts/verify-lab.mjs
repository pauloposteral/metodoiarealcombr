// The app is real; identities, progress and backend responses are fixtures. No billing/email/AI calls are made.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const origin = process.env.LAB_ORIGIN || 'http://127.0.0.1:4193';
const api = fs.readFileSync('.env','utf8').match(/^VITE_SUPABASE_URL\s*=\s*["']?([^\s"']+)/m)?.[1];
if (!api) throw Error('Public project URL needed for fixtures.');
const host = new URL(api).hostname;
const uid='00000000-0000-4000-8000-000000009101';
const cid='e20b4e91-fe38-b030-b292-6bd0094846fe';
const user={id:uid,email:'lab-fixture@example.invalid',aud:'authenticated',role:'authenticated',created_at:'2026-10-20T00:00:00Z',app_metadata:{provider:'email',providers:['email']},user_metadata:{full_name:'Pessoa de teste'}};
const exp=Math.floor(Date.now()/1000)+3600;
const token=[Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url'),Buffer.from(JSON.stringify({sub:uid,aud:'authenticated',role:'authenticated',exp,iss:api+'/auth/v1'})).toString('base64url'),'fixture-not-valid-on-server'].join('.');
const session={access_token:token,refresh_token:'fixture-only',expires_in:3600,expires_at:exp,token_type:'bearer',user};
const lid=n=>`00000000-0000-4000-8000-${String(9200+n).padStart(12,'0')}`;
const mid=n=>`00000000-0000-4000-8000-${String(9300+n).padStart(12,'0')}`;
const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{channel:'msedge'}:{})});
const results=[];fs.mkdirSync('test-results/lab',{recursive:true});
async function setup(width,mode='available') {
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
  if(mode!=='anonymous')await context.addInitScript(({session,key})=>localStorage.setItem(key,JSON.stringify(session)),{session,key:`sb-${host.split('.')[0]}-auth-token`});
  const requests=[];const writes=[];
  await context.route('**/*',async route=>{
    const req=route.request(),u=new URL(req.url());
    if(u.origin===origin)return route.continue();
    if(/(^|\.)(youtube\.com|youtube-nocookie\.com|ytimg\.com)$/.test(u.hostname)){
      requests.push(req.url());return route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><html><body>Player externo simulado.</body></html>'});
    }
    if(u.hostname!==host)return route.fulfill({status:200,body:'',contentType:'text/plain'});
    if(u.pathname==='/auth/v1/user')return route.fulfill({json:user});
    const name=u.pathname.split('/').pop();
    if(!u.pathname.startsWith('/rest/v1/'))return route.fulfill({json:{}});
    if(req.method()!=='GET'&&!u.pathname.includes('/rpc/'))writes.push({name,body:req.postDataJSON()});
    const outline=Array.from({length:12},(_,i)=>({course_id:cid,module_id:mid(Math.floor(i/2)),module_code:null,module_title:['Descobrir','Desenhar','Construir','Integrar','Publicar','Operar'][Math.floor(i/2)],module_description:'Missão de teste',module_order:Math.floor(i/2),module_hours_label:null,module_trails:['construtor'],module_project_title:null,module_is_star:false,lesson_id:lid(i),lesson_title:`Etapa de teste ${i+1}`,lesson_description:'Descrição fictícia',lesson_order:i%2,lesson_type:i===11?'project':'text',estimated_minutes:30,is_free:false,accessible:mode!=='locked'}));
    if(u.pathname.includes('/rpc/'))return route.fulfill({json:name==='get_course_outline'?outline:name==='has_role'?false:[]});
    if(name==='courses'&&mode==='error')return route.fulfill({status:503,json:{message:'Simulated unavailable catalog'}});
    let rows=[];
    if(name==='profiles')rows=[{id:uid,access_status:'active',onboarding_done:true,points:0,full_name:'Pessoa de teste'}];
    if(name==='courses'&&mode!=='empty')rows=[{id:cid,slug:'laboratorio-apps-ia',title:'Laboratório: do briefing ao aplicativo publicado',description:'Curso fictício para teste de UI',thumbnail_url:null,estimated_hours:7.8,difficulty:'intermediate',is_free:false}];
    if(name==='lesson_progress')rows=[{lesson_id:lid(0),completed:true},{lesson_id:lid(1),completed:true}];
    const single=(req.headers().accept||'').includes('application/vnd.pgrst.object+json');
    return route.fulfill({json:single?rows[0]??null:rows,headers:{'content-range':rows.length?`0-${rows.length-1}/${rows.length}`:'*/0'}});
  });
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin+'/membros/laboratorio',{waitUntil:'networkidle'});
  const essentials=page.getByRole('button',{name:'Apenas essenciais',exact:true});
  if(await essentials.count())await essentials.click();
  return{page,context,requests,writes,errors};
}
try {
 for(const width of [360,390,768,1440]){
  const{page,context,requests,writes,errors}=await setup(width);
  await page.getByRole('heading',{name:/Menos tentativa/}).waitFor({timeout:20000});
  await page.getByRole('link',{name:'Continuar meu projeto'}).waitFor();
  assert.ok((await page.getByRole('link',{name:'Continuar meu projeto'}).getAttribute('href')).endsWith(lid(2)));
  assert.equal(await page.getByRole('progressbar',{name:'Progresso do laboratório'}).getAttribute('aria-valuenow'),'17');
  assert.equal(requests.length,0);
  await page.screenshot({path:`test-results/lab/jornada-${width}.png`});
  await page.getByRole('tab',{name:'Vídeos',exact:true}).click();
  await page.getByRole('heading',{name:'Assista. Entenda. Experimente.'}).waitFor();
  await page.getByText('9 referências encontradas',{exact:true}).waitFor();
  assert.equal(await page.getByRole('button',{name:/^Ver referência:/}).count(),9);
  await page.getByLabel('Buscar vídeos por tema ou autor').fill('supabase');
  await page.getByText('2 referências encontradas',{exact:true}).waitFor();
  assert.equal(await page.getByRole('button',{name:/^Ver referência:/}).count(),2);
  await page.getByLabel('Buscar vídeos por tema ou autor').fill('inexistente_zz');
  await page.getByRole('heading',{name:'Nenhum vídeo com esses filtros.'}).waitFor();
  await page.getByRole('button',{name:'Limpar filtros',exact:true}).click();
  await page.getByText('9 referências encontradas',{exact:true}).waitFor();
  await page.getByLabel('Áudio', {exact:true}).selectOption('pt');
  await page.getByText('2 referências encontradas',{exact:true}).waitFor();
  assert.equal(await page.getByRole('button',{name:/^Ver referência:/}).count(),2);
  await page.getByLabel('Áudio', {exact:true}).selectOption('all');
  await page.getByText('9 referências encontradas',{exact:true}).waitFor();
  assert.equal(requests.length,0);
  const trigger=page.getByRole('button',{name:'Ver referência: Do primeiro pedido ao app',exact:true});
  await trigger.click();
  const dialog=page.getByRole('dialog',{name:'Do primeiro pedido ao app',exact:true});await dialog.waitFor();
  assert.equal(await dialog.locator('iframe').count(),0);assert.equal(requests.length,0);
  await Promise.all([page.waitForRequest(request => request.url().startsWith('https://www.youtube-nocookie.com/embed/')), dialog.getByRole('button',{name:'Carregar vídeo do YouTube'}).click()]);
  assert.equal(await dialog.evaluate(el => el.scrollWidth > el.clientWidth + 1), false, 'Dialog must fit horizontally');
  const iframe=dialog.locator('iframe');await iframe.waitFor();
  assert.equal(await iframe.getAttribute('src'),'https://www.youtube-nocookie.com/embed/rqvtLxwMklo?rel=0');
  assert.equal(await iframe.getAttribute('referrerpolicy'),'strict-origin-when-cross-origin');
  await page.waitForFunction(()=>document.querySelector('iframe')?.contentWindow!==null);
  assert.ok(!String(await iframe.getAttribute('allow')).includes('autoplay'));
  assert.ok(requests.length>=1);
  await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});
  assert.equal(await page.locator('iframe').count(),0);
  const previous=requests.length;await trigger.click();await dialog.waitFor();
  assert.equal(await dialog.locator('iframe').count(),0);assert.equal(requests.length,previous);
  await page.keyboard.press('Escape');
  try { await dialog.waitFor({state:'hidden',timeout:5000}); }
  catch(error) { console.log('CLOSE_DIAGNOSTIC',width,await page.evaluate(()=>({url:location.href,focus:document.activeElement?.outerHTML,tabs:Array.from(document.querySelectorAll('[role=tab]')).map(n=>({text:n.textContent,selected:n.getAttribute('aria-selected')})),dialogs:Array.from(document.querySelectorAll('[role=dialog]')).map(n=>({text:n.textContent?.slice(0,200),state:n.getAttribute('data-state')}))}))); await page.screenshot({path:`test-results/lab/close-failure-${width}.png`}); throw error; }
  await page.getByRole('heading',{name:'Assista. Entenda. Experimente.'}).scrollIntoViewIfNeeded();
  await page.screenshot({path:`test-results/lab/videos-${width}.png`});
  await page.getByRole('tab',{name:'Código',exact:true}).click();
  await page.getByRole('heading',{name:'Não comece do escuro.'}).waitFor();
  assert.equal(await page.getByRole('link',{name:'Repositório',exact:true}).count(),11);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  assert.equal(writes.length,0);assert.deepEqual(errors,[]);
  results.push({width,progress:true,search:true,videos:9,repositories:11,noYoutubeBeforeActivation:true,iframeRemovedOnClose:true,noAutoplay:true,noWrites:true,noOverflow:true});
  await context.close();
 }
 for(const mode of ['empty','locked','anonymous','error']){
  const{page,context,requests,writes,errors}=await setup(390,mode);
  if(mode==='anonymous'){await page.waitForURL(/\/auth/);assert.equal(await page.locator('[data-lab-page]').count(),0);}
  if(mode==='empty')await page.getByText('O curso do laboratório ainda não aparece', {exact:false}).waitFor();
  if(mode==='locked'){await page.getByRole('link',{name:'Ver acesso ao laboratório'}).waitFor();assert.equal(await page.getByRole('link',{name:'Continuar meu projeto'}).count(),0);}
  if(mode==='error'){await page.getByRole('button',{name:'Recarregar jornada'}).waitFor({timeout:20000});await page.getByRole('tab',{name:'Vídeos',exact:true}).click();await page.getByText('9 referências encontradas',{exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:/^Ver referência:/}).count(),9);}
  assert.equal(requests.length,0);assert.equal(writes.length,0);assert.deepEqual(errors,[]);
  results.push({width:390,mode,passed:true});await context.close();
 }
 fs.writeFileSync('test-results/lab/results.json',JSON.stringify({scope:'real UI, mocked auth/database and external video player',results},null,2));console.log(JSON.stringify(results));
}finally{await browser.close();}
