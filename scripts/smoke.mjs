// Run against the built preview. All external HTTP requests are mocked or blocked.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
const base = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:4173';
const output = process.env.SMOKE_OUTPUT_DIR || 'test-results';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}) });
const results=[];
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport:{width,height:900}, reducedMotion:'reduce' });
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.origin === base) return route.continue();
      if (url.pathname.endsWith('/rpc/get_shared_carousel')) return route.fulfill({json:{topic:'Carrossel de teste',slides:[{id:'slide-1',type:'cover',title:'Preview seguro',order:0},{id:'slide-2',type:'content',title:'Segundo slide',content:'Conteúdo de demonstração',order:1}],theme:{id:'test',name:'test',displayName:'Teste',category:'minimal',primaryColor:'#111827',secondaryColor:'#1f2937',accentColor:'#fbbf24',textColor:'#ffffff',backgroundGradient:'linear-gradient(135deg,#111827,#1f2937)',fontFamily:'sans-serif'}}});
      if (url.hostname.endsWith('.supabase.co')) return route.fulfill({json:[], headers:{'content-range':'0-0/0'}});
      // Do not contact real payment, AI, email, analytics or external media services.
      return route.fulfill({status:200,body:'',contentType:'text/plain'});
    });
    const page = await context.newPage();
    const errors=[]; page.on('pageerror',e=>errors.push(e.message));
    const paths=['/','/auth','/auth?recovery=1','/pricing','/checkout','/admin/setup','/membros','/preview/audit-share-123456','/obrigado'];
    for (const pathname of paths) {
      await page.goto(base+pathname);
      await page.locator('h1,h2').first().waitFor({timeout:20000});
      await page.locator('[role="status"]').filter({hasText:'Carregando...'}).waitFor({state:'hidden'});
      if (pathname === '/admin/setup') await page.waitForURL('**/admin/login');
      if (pathname === '/membros') await page.waitForURL('**/auth');
      if (pathname === '/auth?recovery=1') {
        await page.getByRole('button',{name:'Salvar nova senha'}).waitFor();
        assert.equal(await page.locator('#email').count(),0);
      }
      if (pathname === '/auth') {
        await page.locator('#email').fill('audit@example.test');
        if(await page.getByRole('button',{name:'Apenas essenciais'}).isVisible()) await page.getByRole('button',{name:'Apenas essenciais'}).click();
        assert.equal(await page.locator('#email').inputValue(),'audit@example.test');
        await page.getByRole('button',{name:'Mostrar senha'}).click();
        assert.equal(await page.locator('#password').getAttribute('type'),'text');
      }
      if (pathname.startsWith('/preview/')) {
        await page.getByRole('heading',{name:'Carrossel de teste',exact:true}).waitFor();
        await page.getByRole('button',{name:'Próximo slide'}).click();
        await page.getByText('Segundo slide',{exact:true}).waitFor();
      }
      const layout=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth,body:document.body.scrollWidth}));
      assert.ok(Math.max(layout.document,layout.body)<=width+2,`Horizontal overflow at ${width} ${pathname}: ${JSON.stringify(layout)}`);
      assert.deepEqual(errors,[],`JavaScript errors at ${pathname}`);
      if (['/','/auth?recovery=1','/preview/audit-share-123456'].includes(pathname)) await page.screenshot({animations:'disabled',path:`${output}/${width}-${pathname==='/'?'home':pathname.includes('recovery')?'recovery':'share'}.png`});
      results.push({width,path:pathname,result:'pass'});
    }
    await context.close();
  }
  console.log(JSON.stringify({browser:browser.version(),externalServices:'mocked',checks:results.length,results},null,2));
} finally { await browser.close(); }
