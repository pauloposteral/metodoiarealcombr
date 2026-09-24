import test from 'node:test';
import assert from 'node:assert/strict';
import { safeContentUrl } from '../src/lib/safeUrl.ts';
import { csvCell } from '../src/lib/exportCSV.ts';
import { parsePublicUrl, isPublicAddress } from '../supabase/functions/_shared/safe-fetch.ts';
import { normalizeGreenn, validWebhookToken } from '../supabase/functions/_shared/greenn.ts';
import { billingPeriod, checkoutProduct } from '../supabase/functions/_shared/billing.ts';
import { readJson } from '../supabase/functions/_shared/http.ts';

for (const value of ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:text/html,payload', 'java\nscript:alert(1)', '//evil.test', '/\\evil.test']) {
  test(`Markdown rejects executable or ambiguous URL ${JSON.stringify(value)}`, () => assert.equal(safeContentUrl(value), undefined));
}
test('Markdown keeps valid web and internal links', () => {
  assert.equal(safeContentUrl('https://example.com/path'), 'https://example.com/path');
  assert.equal(safeContentUrl('/curso'), '/curso');
});
for (const value of ['=1+1',' +cmd','-cmd','@SUM(A1:A2)','\tformula','\rformula']) {
  test(`CSV neutralizes formula ${JSON.stringify(value)}`, () => assert.ok(csvCell(value).startsWith('"\'')));
}
test('CSV escapes quotes and preserves numeric negatives', () => {
  assert.equal(csvCell('Paulo, "Real"'),'"Paulo, ""Real"""');
  assert.equal(csvCell(-42),'"-42"');
});
for(const input of ['http://127.0.0.1','http://2130706433','http://169.254.169.254','http://[::1]','file:///etc/passwd','https://user:password@example.com','http://localhost','http://internal.local','https://example.com:9999']) {
  test(`Scraper rejects unsafe target ${input}`, () => assert.throws(()=>parsePublicUrl(input)));
}
for(const ip of ['127.0.0.1','10.0.0.1','172.16.1.1','192.168.1.1','169.254.169.254','100.64.0.1','0.0.0.0','224.0.0.1','::1','fe80::1','::ffff:127.0.0.1']) {
  test(`Scraper rejects private DNS answer ${ip}`, () => assert.equal(isPublicAddress(ip),false));
}
test('Scraper accepts public addresses', () => {
  assert.equal(isPublicAddress('93.184.216.34'),true);
  assert.equal(isPublicAddress('2606:4700:4700::1111'),true);
});
test('Stripe accepts only the intended price/mode pairs', () => {
  assert.equal(checkoutProduct('price_other','payment'),null);
  assert.equal(checkoutProduct('price_1TAKj1K7VFRW1YcZZSZSsb3n','subscription'),null);
  assert.equal(checkoutProduct('price_1TAKj1K7VFRW1YcZZSZSsb3n','payment').kind,'course');
});
test('Stripe supports both Basil item periods and legacy periods', () => {
  assert.equal(billingPeriod({ items:{data:[{current_period_end:1000}]} }).end,new Date(1000000).toISOString());
  assert.equal(billingPeriod({current_period_end:2000}).end,new Date(2000000).toISOString());
  assert.equal(billingPeriod({}).end,null);
});
test('Greenn uses the provider documented top-level status and sale.method', () => {
  const result=normalizeGreenn({currentStatus:'paid',sale:{id:12,amount:99,method:'PIX'},client:{id:1,email:'A@example.test',name:'A'},product:{id:1,name:'Curso'}});
  assert.equal(result.status,'paid'); assert.equal(result.paymentMethod,'PIX'); assert.equal(result.email,'a@example.test');
});
test('Greenn rejects missing, weak, and incorrect secrets', async () => {
  const secret='x'.repeat(40);
  assert.equal(await validWebhookToken(null,secret),false);
  assert.equal(await validWebhookToken('x','x'),false);
  assert.equal(await validWebhookToken('y'.repeat(40),secret),false);
  assert.equal(await validWebhookToken(secret,secret),true);
});
test('Body reader rejects invalid JSON and oversized chunked bodies', async () => {
  await assert.rejects(()=>readJson(new Request('https://example.test',{method:'POST',body:'broken'})),/JSON inválido/);
  await assert.rejects(()=>readJson(new Request('https://example.test',{method:'POST',body:JSON.stringify({a:'x'.repeat(100)})}),20),/muito grande/);
});
