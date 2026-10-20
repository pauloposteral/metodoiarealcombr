// Uses real built UI with mocked auth/database/provider. Never submits a real signup, payment, post or email.
import fs from 'node:fs';import assert from 'node:assert/strict';import {chromium} from 'playwright';
const origin=process.env.SCHOOL_ORIGIN||'http://127.0.0.1:4195';const env=fs.readFileSync('.env','utf8');const api=(env.match(/^VITE_SUPABASE_URL\s*=\s*["']?([^\s"']+)/m)||[])[1];if(!api)throw Error('Public API URL missing');const apiHost=new URL(api).hostname;const key=`sb-${apiHost.split('.')[0]}-auth-token`;
const uid='00000000-0000-4000-8000-000000009101';const lessonId='5ffa37ee-6b74-6358-fa6e-f51cd3f8dafc';const user={id:uid,email:'school-fixture@example.invalid',aud:'authenticated',role:'authenticated',app_metadata:{provider:'email',providers:['email']},user_metadata:{full_name:'Pessoa de teste'},created_at:'2026-10-20T00:00:00Z'};const exp=Math.floor(Date.now()/1000)+3600;const token=[Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url'),Buffer.from(JSON.stringify({sub:uid,aud:'authenticated',role:'authenticated',exp,iss:api+'/auth/v1'})).toString('base64url'),'not-a-real-signature'].join('.');const session={access_token:token,refresh_token:'local-fixture',expires_in:3600,expires_at:exp,token_type:'bearer',user};
const browser=await chromium.launch({headless:true,...(process.platform==='win32' && process.env.PLAYWRIGHT_BROWSER !== 'chromium'?{channel:'msedge'}:{})});fs.mkdirSync('test-results/school',{recursive:true});const results=[];
async function setup(width=390,mode='guest',storageFail=false){
 const context=await browser.newContext({viewport:{width,height:844},reducedMotion:'reduce',acceptDownloads:true});context.setDefaultTimeout(14000);
 if(['paid','locked','storage','access-error'].includes(mode))await context.addInitScript(({key,session})=>localStorage.setItem(key,JSON.stringify(session)),{key,session});
 if(storageFail)await context.addInitScript(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k.startsWith('ia-real:reel-v1:'))throw Error('Fixture storage unavailable');return original.call(this,k,v);};});
 const writes=[],external=[];let signupCount=0;
 await context.route('**/*',async route=>{const req=route.request();const u=new URL(req.url());if(u.origin===origin)return route.continue();if(u.hostname!==apiHost){external.push(req.url());return route.fulfill({status:200,body:'External provider fixture, not a payment',contentType:'text/plain'});}
  if(u.pathname==='/auth/v1/signup'){signupCount++;return route.fulfill({json:user});}
  if(u.pathname==='/auth/v1/token')return route.fulfill({json:session});
  if(u.pathname==='/auth/v1/user')return route.fulfill({json:{user}});
  if(u.pathname==='/auth/v1/logout')return route.fulfill({status:204,body:''});
  if(u.pathname.includes('/functions/')){writes.push({path:u.pathname,body:req.postDataJSON()});return route.fulfill({json:{url:'https://checkout.stripe.com/c/pay/fixture'}});}
  if(!u.pathname.startsWith('/rest/v1/'))return route.fulfill({json:{}});
  const name=u.pathname.split('/').pop();if(req.method()!=='GET'&&!u.pathname.includes('/rpc/'))writes.push({path:name,body:req.postDataJSON()});
  if(u.pathname.includes('/rpc/')){if(name==='has_role')return route.fulfill({json:false});return route.fulfill({json:[]});}
  if(name==='profiles'&&mode==='access-error')return route.fulfill({status:503,json:{message:'Fixture profile lookup unavailable'}});
  let rows=[];if(name==='profiles')rows=[{id:uid,access_status:mode==='paid'||mode==='storage'?'active':'pending',full_name:'Pessoa de teste',onboarding_done:true,selected_trail:'criador'}];
  if(name==='lessons'&&mode!=='locked')rows=[{id:lessonId,module_id:'00000000-0000-4000-8000-000000009103',title:'Vídeo curto — aula fictícia',content:'## Explicação completa\nConteúdo de teste autorizado.\n\n:::exercise Prática\nPrepare seu roteiro.\n:::',type:'text',prompts:['Um pedido de teste.'],video_url:null,estimated_minutes:25,reviewed_at:'2026-10-20',order_index:2}];
  const single=(req.headers().accept||'').includes('application/vnd.pgrst.object+json');return route.fulfill({json:single?rows[0]??null:rows,headers:{'content-range':rows.length?'0-0/1':'*/0'}});
 });
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));return{context,page,writes,external,errors,signups:()=>signupCount};
}
async function dismissCookies(page){const b=page.getByRole('button',{name:'Apenas essenciais',exact:true});if(await b.count())await b.click();}
try{
 for(const width of [360,390,768,1440]){
  const{context,page,external,errors}=await setup(width);await page.goto(origin+'/',{waitUntil:'networkidle'});await page.locator('#hero-password').waitFor();await dismissCookies(page);
  assert.equal(await page.locator('h1').evaluate(n=>n.textContent.replace(/\s+/g,' ').trim()),'Não só use IA. Crie com ela.');const b=await page.locator('#hero-password').boundingBox();assert.ok(b&&b.y+b.height<=844,'Password remains above the fold');
  assert.equal(await page.locator('.lcn-sticky').isVisible(),false,'No second purchase CTA overlays the first scene');assert.equal(await page.locator('#abertura video').count(),0);assert.ok((await page.locator('#abertura .lcn-poster').getAttribute('srcset')).includes('/media/school/work-480.webp'));
  assert.equal(await page.locator('head link[rel=canonical]').count(),1);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.ok(external.every(url=>new URL(url).hostname==='fonts.googleapis.com'));assert.ok(external.every(url=>!url.includes('Bebas+Neue')));assert.ok(external.length<=1);assert.deepEqual(errors,[]);
  await page.screenshot({path:`test-results/school/landing-${width}.png`});results.push({area:'landing',width,loginAboveFold:true,responsiveLocalImage:true,noAutoplay:true,noExternalMediaRequests:true,coreFontsOnly:true,noOverflow:true});await context.close();
 }
 for(const surface of ['page','dialog']){
  const{context,page,writes,signups}=await setup(390);await page.goto(origin+(surface==='page'?'/checkout':'/'),{waitUntil:'networkidle'});await dismissCookies(page);let root=page;
  if(surface==='dialog'){await page.getByRole('button',{name:'Conhecer a formação · R$ 497',exact:true}).click();root=page.getByRole('dialog',{name:'Finalizar compra',exact:true});await root.waitFor();await root.getByRole('button',{name:'Criar conta',exact:true}).click();}
  await root.getByPlaceholder('Seu nome').fill('Pessoa de teste');await root.getByPlaceholder('seu@email.com').fill(user.email);await root.locator('input[type=password]').fill('fixture-password');await root.locator('button[type=submit]').click();
  await root.getByRole('heading',{name:'Confira seu e-mail'}).waitFor();assert.equal(await root.getByRole('button',{name:'Continuar para pagamento seguro'}).count(),0);assert.equal(signups(),1);assert.equal(writes.length,0);
  const text=surface==='page'?await page.locator('body').innerText():await root.innerText();assert.ok(!/23 vagas|R\$\s?447|R\$\s?3\.252|Desconto \(50%\)/.test(text));
  await root.getByRole('button',{name:'Já confirmei. Entrar',exact:true}).click();await root.locator('input[type=password]').fill('fixture-password');await root.locator('button[type=submit]').click();await root.getByRole('button',{name:'Continuar para pagamento seguro',exact:true}).waitFor();assert.equal(writes.length,0);
  results.push({area:'checkout',surface,signupWithoutSessionPending:true,noPaymentBeforeSession:true,validLoginShowsPayment:true,uncharged:true});await context.close();
 }
 {
  const{context,page,writes}=await setup(390,'access-error');await page.goto(origin+'/checkout',{waitUntil:'networkidle'});
  await page.getByRole('alert').filter({hasText:'Não foi possível verificar seu acesso'}).waitFor({timeout:4000});
  assert.equal(await page.getByRole('button',{name:'Continuar para pagamento seguro'}).count(),0);assert.equal(writes.length,0);
  results.push({area:'checkout',mode:'access-check-failed',noPaymentUI:true});await context.close();
 }
 for(const width of [360,390,768,1440]){
  const{context,page,writes,errors}=await setup(width,'paid');await page.goto(origin+'/membros/pratica-reels',{waitUntil:'networkidle'});await page.locator('[data-reels-workbook]').waitFor();await dismissCookies(page);await page.locator('#reel-audience').fill('Pessoas que aprendem café');await page.locator('#reel-idea').fill('Comparar duas alturas do leite');await page.getByRole('button',{name:'Próximo passo',exact:true}).click();
  try { await page.locator('#reel-hook').waitFor({timeout:8000}); }
  catch(error) { console.log('REELS_STEP_DIAGNOSTIC',JSON.stringify({width,url:page.url(),activeSteps:await page.locator('[aria-current="step"]').allTextContents(),headings:await page.locator('h2').allTextContents(),pageErrors:errors,body:(await page.locator('body').innerText()).slice(-1400)})); await page.screenshot({path:`test-results/school/step-failure-${width}.png`,fullPage:true}); throw error; }
  await page.locator('#reel-hook').fill('Seu desenho sumiu?');
  await page.getByRole('button',{name:/03 Roteiro/}).click();await page.locator('#reel-script').fill('Mostrar problema, comparar e explicar.');await page.getByRole('button',{name:/04 Cenas/}).click();await page.locator('#reel-shots').fill('Close, lateral, resultado.');await page.getByRole('button',{name:/05 Legenda/}).click();await page.locator('#reel-caption').fill('Teste uma variável por vez.');await page.getByRole('button',{name:/06 Revisar/}).click();await page.locator('#reel-experiment').fill('Observar dúvidas e tempo assistido, sem garantia de alcance.');
  for(const check of await page.locator('fieldset input[type=checkbox]').all())await check.check();await page.reload({waitUntil:'networkidle'});await page.locator('#reel-audience').waitFor();assert.equal(await page.locator('#reel-audience').inputValue(),'Pessoas que aprendem café');await page.getByRole('button',{name:/02 Abertura/}).click();assert.equal(await page.locator('#reel-hook').inputValue(),'Seu desenho sumiu?');
  const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Baixar rascunho',exact:true}).click();const download=await downloadPromise;const dest=`test-results/school/roteiro-${width}.md`;await download.saveAs(dest);const text=fs.readFileSync(dest,'utf8');assert.ok(text.includes('Seu desenho sumiu?')&&text.includes('não garante alcance'));
  assert.equal(writes.length,0);assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);await page.screenshot({path:`test-results/school/reels-${width}.png`});results.push({area:'reels',width,sixSteps:true,draftRecovered:true,export:true,noProgressWrites:true,noOverflow:true});await context.close();
 }
 {
  const{context,page}=await setup(390,'paid');await page.goto(origin+'/membros/laboratorio',{waitUntil:'networkidle'});
  await page.getByRole('link',{name:'Abrir oficina de Reels',exact:true}).click();await page.locator('[data-reels-workbook]').waitFor();
  results.push({area:'reels',mode:'laboratory-discovery',passed:true});await context.close();
 }
 {
  const{context,page,writes}=await setup(390,'paid');await page.goto(origin+'/checkout',{waitUntil:'networkidle'});await page.waitForURL(origin+'/membros');
  assert.equal(await page.getByRole('button',{name:'Continuar para pagamento seguro'}).count(),0);assert.equal(writes.some(write => /checkout|payment|purchase|lesson_progress/i.test(write.path)),false,'Returning member is never charged or marked complete');
  results.push({area:'checkout',mode:'already-entitled',noRepurchasePrompt:true});await context.close();
 }
 {
  const{context,page}=await setup(390,'paid');await page.goto(origin+'/membros/pratica-reels',{waitUntil:'networkidle'});await page.locator('#reel-audience').fill('Rascunho privado de teste');
  assert.ok(await page.evaluate(()=>Object.keys(sessionStorage).some(key=>key.startsWith('ia-real:reel-v1:'))));
  await page.goto(origin+'/membros/laboratorio',{waitUntil:'networkidle'});await dismissCookies(page);await page.locator('[data-sidebar=trigger]').first().click();await page.getByRole('button',{name:'Sair da conta',exact:true}).click();await page.waitForURL(origin+'/');
  assert.equal(await page.evaluate(()=>Object.keys(sessionStorage).some(key=>key.startsWith('ia-real:reel-v1:')||key.startsWith('ia-real:note-draft-v1:'))),false);
  results.push({area:'reels',mode:'sign-out-after-leaving-workshop',pendingTabDraftsCleared:true});await context.close();
 }
 for(const mode of ['locked','guest','storage']){
  const{context,page,writes}=await setup(390,mode,mode==='storage');await page.goto(origin+'/membros/pratica-reels',{waitUntil:'networkidle'});
  if(mode==='locked'){await page.getByRole('heading',{name:'Esta oficina acompanha a aula de vídeo curto.'}).waitFor();assert.equal(await page.locator('[data-reels-workbook]').count(),0);}
  if(mode==='guest'){await page.waitForURL(/\/auth/);assert.equal(await page.locator('[data-reels-workbook]').count(),0);}
  if(mode==='storage'){await page.locator('#reel-audience').fill('Rascunho em memória');await page.getByRole('alert').filter({hasText:'não permitiu manter'}).waitFor();assert.equal(await page.locator('#reel-audience').inputValue(),'Rascunho em memória');}
  assert.equal(writes.length,0);results.push({area:'reels',mode,passed:true});await context.close();
 }
 fs.writeFileSync('test-results/school/results.json',JSON.stringify({scope:'built UI, mock auth/database/payment; no real customer or publication',results},null,2));console.log(JSON.stringify(results));
}finally{await browser.close();}
