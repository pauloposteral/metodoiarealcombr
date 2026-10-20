import { chromium } from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const origin=process.env.AUDIT_ORIGIN || 'http://127.0.0.1:4189';
const browser=await chromium.launch({headless:true,...(process.platform==='win32'?{channel:'msedge'}:{})});
const results=[];
try {
 for(const width of [390,1440]) {
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>{
   const u=new URL(route.request().url());
   if(u.hostname===new URL(origin).hostname)return route.continue();
   if(u.pathname.includes('/auth/v1/token')) return route.fulfill({status:400,contentType:'application/json',body:JSON.stringify({error:'invalid_grant',error_description:'Invalid login credentials'})});
   return route.abort();
  });
  await page.goto(origin+'/',{waitUntil:'networkidle'});
  const email=page.locator('#hero-email');
  await email.waitFor({timeout:7000});
  const password=page.locator('#hero-password');
  assert.equal(await email.getAttribute('autocomplete'),'username');
  assert.equal(await password.getAttribute('autocomplete'),'current-password');
  const box=await password.boundingBox(); assert.ok(box.y+box.height<900,'Password is visible in the first frame');
  assert.equal(await page.locator('h1').count(),1);
  assert.equal(await page.locator('h1').evaluate(node => node.textContent.replace(/\s+/g,' ').trim()), 'Não só use IA. Crie com ela.');
  assert.equal(await page.locator('head meta[name="description"]').count(),1);
  assert.equal(await page.locator('head link[rel="canonical"]').count(),1);
  await page.screenshot({path:`docs/audit/2026-10-20/landing-${width}.png`,fullPage:false});
  await page.locator('button').filter({hasText:'Apenas essenciais'}).click().catch(()=>{});
  await email.fill('learner@example.test'); await password.fill('invalid-test-password');
  await page.locator('#hero-login button[type="submit"]').click();
  await page.getByRole('alert').filter({hasText:/E-mail ou senha/}).waitFor();
  assert.equal(await email.inputValue(),'learner@example.test');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1);assert.equal(overflow,false);
  await page.goto(origin+'/auth',{waitUntil:'networkidle'});
  assert.match(await page.locator('meta[name="robots"]').getAttribute('content'),/noindex/);
  await page.goto(origin+'/aprender/como-escrever-prompt',{waitUntil:'networkidle'});
  assert.equal(await page.getByRole('heading',{level:1}).count(),1);
  await page.getByRole('link',{name:'Baixar modelo'}).waitFor();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1),false);
  assert.deepEqual(errors,[]);
  results.push({width,loginVisible:true,validation:true,canonical:true,noindex:true,guide:true,errors});
  await page.close();
 }
 fs.writeFileSync('docs/audit/2026-10-20/browser-results.json',JSON.stringify(results,null,2));
 console.log(JSON.stringify(results));
} finally {await browser.close();}
