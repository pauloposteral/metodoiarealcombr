// Uses real built UI with mocked auth/database/provider. Never submits a real signup, payment, post or email.
import fs from 'node:fs';import assert from 'node:assert/strict';import {chromium} from 'playwright';
const origin=process.env.SCHOOL_ORIGIN||'http://127.0.0.1:4195';const env=fs.readFileSync('.env','utf8');const api=(env.match(/^VITE_SUPABASE_URL\s*=\s*["']?([^\s"']+)/m)||[])[1];if(!api)throw Error('Public API URL missing');const apiHost=new URL(api).hostname;const key=`sb-${apiHost.split('.')[0]}-auth-token`;
const uid='00000000-0000-4000-8000-000000009101';const lessonId='5ffa37ee-6b74-6358-fa6e-f51cd3f8dafc';const user={id:uid,email:'school-fixture@example.invalid',aud:'authenticated',role:'authenticated',app_metadata:{provider:'email',providers:['email']},user_metadata:{full_name:'Pessoa de teste'},created_at:'2026-10-20T00:00:00Z'};const exp=Math.floor(Date.now()/1000)+3600;const token=[Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url'),Buffer.from(JSON.stringify({sub:uid,aud:'authenticated',role:'authenticated',exp,iss:api+'/auth/v1'})).toString('base64url'),'not-a-real-signature'].join('.');const session={access_token:token,refresh_token:'local-fixture',expires_in:3600,expires_at:exp,token_type:'bearer',user};
const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{channel:'msedge'}:{})});fs.mkdirSync('test-results/school',{recursive:true});const results=[];
async function setup(width=390,mode='guest',storageFail=false){
 const context=await browser.newContext({viewport:{width,height:844},reducedMotion:'reduce',acceptDownloads:true,hasTouch:true,isMobile:true,deviceScaleFactor:2});context.setDefaultTimeout(14000);
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
const report = [];
try {
  for (const width of [320, 360, 390, 430, 440, 767]) {
    const {context,page,errors,writes} = await setup(width,'paid');
    await page.goto(origin+'/membros/pratica-reels',{waitUntil:'networkidle'});
    await page.locator('[data-reels-workbook]').waitFor();
    const nav = page.getByRole('navigation',{name:'Navegação rápida'});
    await nav.waitFor({timeout:10000});
    const cookie = page.locator('[data-cookie-consent]');
    if (await cookie.isVisible()) {
      const cookieBox=await cookie.boundingBox();
      const navBox=await nav.boundingBox();
      assert.ok(cookieBox && navBox && cookieBox.y+cookieBox.height<=navBox.y+1,'Consent must not cover touch navigation');
      for(const button of await cookie.getByRole('button').all()) { const b=await button.boundingBox(); assert.ok(b && b.height>=44,'Cookie choice touch target'); }
      await cookie.getByRole('button',{name:'Apenas essenciais'}).click();
    }
    assert.equal(await nav.getByRole('link').count(),5);
    for (const name of ['Início','Aprender','Laboratório','Criar','Perfil']) {
      const link=nav.getByRole('link',{name,exact:true});
      const box=await link.boundingBox();
      assert.ok(box && box.width>=44 && box.height>=44, 'Touch target '+name+' at '+width);
    }
    assert.equal(await nav.getByRole('link',{name:'Criar',exact:true}).getAttribute('aria-current'),'page');
    const bounds=await nav.boundingBox();
    assert.ok(bounds && bounds.y>=0 && bounds.y+bounds.height<=844+1,'Bottom nav inside viewport');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'No page overflow');
    const field=page.locator('#reel-audience');
    assert.ok(Number.parseFloat(await field.evaluate(el=>getComputedStyle(el).fontSize))>=16,'iOS font-size prevents focus zoom');
    const steps=page.getByRole('navigation',{name:'Passos da oficina'});
    const scroll=await steps.locator('ol').evaluate(el=>({scroll:el.scrollWidth,client:el.clientWidth}));
    assert.ok(scroll.scroll>scroll.client,'Step selector can swipe horizontally');
    await page.getByRole('button',{name:/02 Abertura/}).click();
    await page.locator('#reel-hook').fill('Um roteiro sem promessas');
    assert.equal(await nav.isVisible(),false,'Keyboard-focused field does not fight bottom nav');
    await page.locator('h2').filter({hasText:'Abertura'}).focus();
    assert.equal(await nav.isVisible(),true);
    await page.getByRole('button',{name:/01 Uma ideia/}).click();
    await field.fill('Público de teste');
    await page.getByRole('button',{name:/02 Abertura/}).click();
    assert.equal(await page.locator('#reel-hook').inputValue(),'Um roteiro sem promessas');
    const main=page.locator('main');
    await main.evaluate(el => { el.scrollTop=el.scrollHeight; });
    await page.waitForTimeout(100);
    const navEnd=await nav.boundingBox();
    const bottomPadding=await main.evaluate(el => Number.parseFloat(getComputedStyle(el).paddingBottom));
    assert.ok(navEnd && bottomPadding>=navEnd.height+20,'Scroll area reserves bottom navigation space');
    const trigger=page.locator('[data-sidebar="trigger"]');
    const triggerBox=await trigger.boundingBox();
    assert.ok(triggerBox && triggerBox.width>=44 && triggerBox.height>=44,'Drawer trigger touch size');
    await trigger.click();
    const closeMenu=page.getByRole('button',{name:'Fechar menu'});await closeMenu.waitFor();
    const closeBox=await closeMenu.boundingBox();assert.ok(closeBox && closeBox.width>=44 && closeBox.height>=44,'Drawer close touch size');
    await closeMenu.click();await closeMenu.waitFor({state:'hidden'});
    const search=page.getByRole('button',{name:'Buscar aulas'});
    const searchBox=await search.boundingBox();
    assert.ok(searchBox && searchBox.width>=44 && searchBox.height>=44,'Search touch size');
    for (const control of [page.getByRole('button',{name:/Ativar modo/}),page.getByRole('button',{name:/Notificações/})]) {
      const box=await control.boundingBox(); assert.ok(box && box.width>=44 && box.height>=44,'Header touch controls');
    }
    assert.equal(writes.some(x=>/checkout|payment|lesson_progress/.test(x.path)),false);
    assert.deepEqual(errors,[]);
    await page.screenshot({path:'test-results/school/touch-'+width+'.png'});
    if(width===390) {
      assert.equal(await page.evaluate(()=>matchMedia('(pointer: coarse)').matches),true);
      const lab=nav.getByRole('link',{name:'Laboratório'}); const b=await lab.boundingBox();
      await page.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);
      await page.waitForURL(/\/membros\/laboratorio/);
      const create=page.getByRole('navigation',{name:'Navegação rápida'}).getByRole('link',{name:'Criar'});
      const c=await create.boundingBox(); await page.touchscreen.tap(c.x+c.width/2,c.y+c.height/2);
      await page.waitForURL(/\/membros\/pratica-reels/);
      await page.getByRole('button',{name:/02 Abertura/}).click();
      assert.equal(await page.locator('#reel-hook').inputValue(),'Um roteiro sem promessas','Draft survives a real touch-navigation round trip');
    }
    report.push({width,bottomNav:true,touchTargets:true,keyboardSafe:true,stepSwipe:true,noOverflow:true});
    await context.close();
  }
  {
    const {context,page}=await setup(768,'paid');
    await page.goto(origin+'/membros/pratica-reels',{waitUntil:'networkidle'});
    await page.locator('[data-reels-workbook]').waitFor();
    assert.equal(await page.getByRole('navigation',{name:'Navegação rápida'}).isVisible(),false);
    report.push({width:768,desktopSidebarOnly:true});
    await context.close();
  }
  for(const width of [320,390]) {
    const {context,page}=await setup(width,'guest');
    await page.goto(origin+'/',{waitUntil:'networkidle'});
    const email=page.locator('#hero-email');
    await email.waitFor();
    const inputFont=await email.evaluate(el=>Number.parseFloat(getComputedStyle(el).fontSize));
    assert.ok(inputFont>=16,'Login input font prevents iOS zoom');
    const submit=await page.locator('.lcn-login-submit').boundingBox();
    assert.ok(submit && submit.height>=44);
    const reveal=await page.getByRole('button',{name:'Mostrar senha'}).boundingBox();
    assert.ok(reveal && reveal.width>=44 && reveal.height>=44);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
    await page.goto(origin+'/checkout',{waitUntil:'networkidle'});
    for (const id of ['purchase-email','purchase-password']) {
      const input=page.locator('#'+id);await input.waitFor();
      const box=await input.boundingBox();const font=await input.evaluate(el=>Number.parseFloat(getComputedStyle(el).fontSize));
      assert.ok(box && box.height>=44 && font>=16,'Checkout field is usable by touch without iOS zoom: '+id);
    }
    const submitBox=await page.locator('form button[type=submit]').boundingBox();
    assert.ok(submitBox && submitBox.height>=44,'Checkout action touch size');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
    if(width===390) {
      await page.goto(origin+'/',{waitUntil:'networkidle'});
      await page.getByRole('button',{name:/Conhecer a formação/}).click();
      const dialog=page.getByRole('dialog',{name:'Finalizar compra'});await dialog.waitFor();
      await dialog.getByRole('button',{name:'Criar conta',exact:true}).click();
      for(const id of ['checkout-name','checkout-email','checkout-password']) {
        const field=dialog.locator('#'+id);const box=await field.boundingBox();
        assert.ok(box && box.height>=44,'Dialog input touch height '+id);
        assert.ok(await field.evaluate(el=>Number.parseFloat(getComputedStyle(el).fontSize))>=16,'Dialog input avoids iOS focus zoom '+id);
      }
      for(const control of [dialog.getByRole('button',{name:'Mostrar senha'}),dialog.locator('button[type=submit]'),dialog.getByRole('button',{name:'Já tenho conta',exact:true})]) {
        const box=await control.boundingBox();assert.ok(box && box.height>=44,'Dialog control touch target');
      }
      await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});
    }
    report.push({width,loginTouch:true,checkoutTouch:true,dialogTouch:width===390});
    await context.close();
  }
  fs.writeFileSync('test-results/school/touch-results.json',JSON.stringify({mode:'mock auth and database; no real payments',report},null,2));
  console.log(JSON.stringify(report));
} finally {await browser.close();}
