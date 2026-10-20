import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

test('Public learning build produces unique useful HTML, downloads and a public-only sitemap', () => {
  const script='scripts/seo/build-public.mjs';
  assert.ok(fs.existsSync(script), 'Static learning build must exist');
  const out=fs.mkdtempSync(path.join(os.tmpdir(),'ia-real-seo-'));
  try {
    const run=spawnSync(process.execPath,[script,'--out',out],{encoding:'utf8'});
    assert.equal(run.status,0,run.stderr);
    const data=JSON.parse(fs.readFileSync('src/data/publicGuides.json','utf8'));
    assert.equal(data.length,13);
    const titles=new Set(); const urls=new Set();
    for(const g of data) {
      const html=fs.readFileSync(path.join(out,'aprender',g.slug,'index.html'),'utf8');
      const canonical=`https://metodoiareal.com.br/aprender/${g.slug}`;
      assert.ok(html.includes(`href="${canonical}"`));
      assert.equal((html.match(/<h1[ >]/g)||[]).length,1);
      assert.equal((html.match(/rel="canonical"/g)||[]).length,1);
      assert.ok(html.includes('application/ld+json'));
      assert.ok(html.includes('Baixar modelo'));
      assert.ok(html.includes(g.title));
      assert.ok(!html.includes('aggregateRating'));
      assert.ok(g.intro.length>150 && g.steps.length>=4 && g.example.length>180);
      assert.ok(fs.readFileSync(path.join(out,'recursos',`${g.slug}.md`),'utf8').length>1300);
      titles.add(g.title); urls.add(canonical);
    }
    assert.equal(titles.size,13); assert.equal(urls.size,13);
    const sitemap=fs.readFileSync(path.join(out,'sitemap.xml'),'utf8');
    assert.ok(sitemap.includes('/aprender'));
    assert.ok(!/\/membros|\/admin|\/auth|\/checkout|\/preview/.test(sitemap));
    assert.ok(fs.readFileSync(path.join(out,'robots.txt'),'utf8').includes('Sitemap: https://metodoiareal.com.br/sitemap.xml'));
  } finally { fs.rmSync(out,{recursive:true,force:true}); }
});

test('Base metadata has a canonical, managed tags and no duplicate descriptions', () => {
  const html=fs.readFileSync('index.html','utf8');
  assert.equal((html.match(/rel="canonical"/g)||[]).length,1);
  assert.equal((html.match(/name="description"/g)||[]).length,1);
  assert.ok(html.includes('data-rh="true"'));
});

test('Public guide source is original free support, not a dump of paid lessons', () => {
  assert.ok(fs.existsSync('src/data/publicGuides.json'),'Free resource source must exist');
  const data=JSON.parse(fs.readFileSync('src/data/publicGuides.json','utf8'));
  for(const g of data) {
    assert.match(g.slug,/^[a-z0-9-]+$/);
    assert.equal(g.isFree,true);
    assert.ok(g.template.length>80);
    assert.ok(g.checks.length>=3);
    assert.ok(g.sources.every(s=>s.url.startsWith('https://')));
  }
});
