import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const origin=process.env.AUDIT_ORIGIN||'http://127.0.0.1:8188';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'});
const result=[];
try {
 for(const width of [390,1440]) {
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
  const page=await context.newPage(); const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/auth/v1/token**',route=>route.fulfill({status:400,contentType:'application/json',body:JSON.stringify({error:'invalid_grant',error_description:'Invalid login credentials'})}));
  await page.goto(origin,{waitUntil:'domcontentloaded'});
  await page.getByRole('heading',{level:1}).waitFor({timeout:15000});
  assert.equal(await page.getByRole('heading',{level:1}).count(),1,'One H1 in the opening');
  const email=page.getByLabel('E-mail',{exact:true});
  const password=page.getByLabel('Senha',{exact:true});
  assert.equal(await email.count(),1,'Email input is visible in the opening');
  assert.equal(await password.count(),1,'Password input is visible in the opening');
  await email.fill('student@example.test'); await password.fill('not-a-real-password');
  await page.locator('#hero-login button[type="submit"]').click();
  await page.getByText('E-mail ou senha incorretos. Confira os campos ou recupere sua senha.',{exact:true}).waitFor();
  assert.equal(await email.inputValue(),'student@example.test','Preserve input after an error');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
  assert.equal(overflow,false,'No horizontal overflow');
  assert.equal(await page.locator('head meta[name="description"]').count(),1,'One description');
  assert.equal(await page.locator('head link[rel="canonical"]').count(),1,'One canonical');
  await page.screenshot({path:`docs/audit/2026-10-20/landing-${width}.png`,fullPage:false});
  await page.goto(origin+'/auth?mode=reset',{waitUntil:'domcontentloaded'});
  await page.getByRole('heading',{name:'Recuperar senha'}).waitFor();
  assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'),'noindex,nofollow');
  assert.deepEqual(errors,[],'No page errors');
  result.push({width,status:'pass'}); await context.close();
 }
 console.log(JSON.stringify(result));
 fs.writeFileSync('docs/audit/2026-10-20/browser-expansion.json',JSON.stringify(result,null,2));
} finally { await browser.close(); }
