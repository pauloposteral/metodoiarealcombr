import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';

async function edge(name, { env = {}, client = {}, Stripe = class {}, fetch = () => { throw new Error('Unexpected network call'); } } = {}) {
  let handler;
  const capture = fn => { handler = fn; };
  const context = vm.createContext({
    Request, Response, URL, Headers, TextEncoder, TextDecoder, Uint8Array, AbortSignal, crypto, console: { log() {}, error() {} },
    setTimeout, clearTimeout, fetch,
    Deno: { env: { get: key => env[key] }, serve: capture, resolveDns: async () => ['93.184.216.34'] },
  });
  const cache = new Map();
  const synthetic = (key, exports) => {
    if (cache.has(key)) return cache.get(key);
    const mod = new vm.SyntheticModule(Object.keys(exports), function () { for (const [name, value] of Object.entries(exports)) this.setExport(name, value); }, { context, identifier: key });
    cache.set(key,mod); return mod;
  };
  async function load(file) {
    if (cache.has(file)) return cache.get(file);
    const code = ts.transpileModule(readFileSync(file, 'utf8'), {compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
    const mod = new vm.SourceTextModule(code, {context,identifier:file}); cache.set(file,mod);
    await mod.link(async (specifier, parent) => {
      if (specifier.includes('supabase-js')) return synthetic(specifier, { createClient: () => client });
      if (specifier === 'npm:stripe@18.5.0') return synthetic(specifier, { default: Stripe });
      if (specifier.includes('/http/server.ts')) return synthetic(specifier, { serve: capture });
      if (specifier.startsWith('https://')) return synthetic(specifier, {});
      return load(path.resolve(path.dirname(parent.identifier),specifier));
    });
    return mod;
  }
  const module = await load(path.resolve(`supabase/functions/${name}/index.ts`));
  await module.evaluate();
  return handler;
}
const request = (body = {}, headers = {}) => new Request('https://project.test/functions/v1/handler', {method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});
const env = { SUPABASE_URL: 'https://project.test', SUPABASE_ANON_KEY: 'test-anon', SUPABASE_SERVICE_ROLE_KEY:'test-service', STRIPE_SECRET_KEY:'sk_test_fake', STRIPE_WEBHOOK_SECRET:'whsec_fake', APP_ORIGIN:'https://metodoiareal.com.br' };

for (const name of ['generate-carousel','generate-image','generate-slide-image','generate-story','carousel-engine','scrape-url','ai-sandbox']) {
  test(`${name} denies anonymous access before charging AI credits`, async () => {
    const handler = await edge(name, {env});
    assert.equal((await handler(request({topic:'test'}))).status,401);
  });
}
test('Stripe webhook fails closed without configured signing secret', async () => {
  const handler = await edge('stripe-webhook'); assert.equal((await handler(request())).status,503);
});
test('Stripe webhook rejects a missing signature', async () => {
  const handler = await edge('stripe-webhook',{env}); assert.equal((await handler(request())).status,400);
});
test('Stripe webhook rejects an invalid signature', async () => {
  class Stripe { static createSubtleCryptoProvider(){}; webhooks={constructEventAsync:async()=>{throw new Error('bad signature');}}; }
  const handler = await edge('stripe-webhook',{env,Stripe}); assert.equal((await handler(request({}, {'stripe-signature':'bad'}))).status,400);
});
test('Stripe webhook returns 500 when saving a verified payment fails, allowing retries', async () => {
  class Stripe {
    static createSubtleCryptoProvider(){};
    webhooks={constructEventAsync:async()=>({type:'checkout.session.completed',data:{object:{id:'cs_test'}}})};
    checkout={sessions:{retrieve:async()=>({id:'cs_test',mode:'payment',payment_status:'paid',payment_intent:'pi_test',metadata:{supabase_user_id:'user-1'}}),listLineItems:async()=>({data:[{price:{id:'price_1TAKj1K7VFRW1YcZZSZSsb3n'}}]})}};
    paymentIntents={retrieve:async()=>({latest_charge:'ch_test'})};
    charges={retrieve:async()=>({refunded:false,disputed:false})};
  }
  const client={from:()=>({upsert:async()=>({error:{message:'database unavailable'}})})};
  const handler=await edge('stripe-webhook',{env,Stripe,client});
  assert.equal((await handler(request({}, {'stripe-signature':'valid-test'}))).status,500);
});
test('Checkout rejects unsupported prices and ignores caller-controlled redirect origins', async () => {
  let params;
  class Stripe {
    customers={list:async()=>({data:[{id:'cus_test',metadata:{supabase_user_id:'user-1'}}]})};
    checkout={sessions:{create:async input=>{params=input;return{url:'https://checkout.stripe.com/test'};}}};
  }
  const client={auth:{getUser:async()=>({data:{user:{id:'user-1',email:'buyer@example.test',email_confirmed_at:'2026-01-01'}},error:null})}};
  const handler=await edge('create-checkout',{env,Stripe,client});
  assert.equal((await handler(request({priceId:'price_evil',mode:'payment'},{Authorization:'Bearer test'}))).status,400);
  assert.equal((await handler(request({priceId:'price_1TAKj1K7VFRW1YcZZSZSsb3n',mode:'payment'},{Authorization:'Bearer test',Origin:'https://evil.test'}))).status,200);
  assert.equal(params.success_url,'https://metodoiareal.com.br/membros?checkout=success');
  assert.equal(params.metadata.supabase_user_id,'user-1');
  assert.equal(params.metadata.purchase_kind,'course');
});
test('Billing refuses an account with an unverified email', async () => {
  const client={auth:{getUser:async()=>({data:{user:{id:'user-1',email:'buyer@example.test'}},error:null})}};
  const handler=await edge('customer-portal',{env,client});
  assert.equal((await handler(request({}, {Authorization:'Bearer test'}))).status,403);
});
test('Greenn webhook refuses untrusted events before touching the database', async () => {
  const handler=await edge('greenn-webhook',{env:{GREENN_WEBHOOK_SECRET:'x'.repeat(40)}});
  assert.equal((await handler(request())).status,401);
});

test('Subscription lookup preserves the paid customer mapping after an email change', async () => {
  let requestedCustomer;
  class Stripe {
    customers={list:async()=>{throw new Error('Must use the verified database mapping');}};
    subscriptions={list:async({customer})=>{requestedCustomer=customer;return{data:[{status:'active',items:{data:[{price:{id:'price_1T8qngK7VFRW1YcZdgbfLP0b'},current_period_start:1750000000,current_period_end:1850000000}]}}]};}};
  }
  const query={select(){return this;},eq(){return this;},order(){return this;},limit:async()=>({data:[{stripe_customer_id:'cus_original'}],error:null})};
  const client={from:()=>query,auth:{getUser:async()=>({data:{user:{id:'user-1',email:'changed@example.test',email_confirmed_at:'2026-01-01'}},error:null})}};
  const handler=await edge('check-subscription',{env,client,Stripe});
  const response=await handler(request({}, {Authorization:'Bearer test'}));
  assert.equal(response.status,200); assert.equal(requestedCustomer,'cus_original');
  assert.equal((await response.json()).plan,'pro');
});

test('A verified free account cannot bypass the paid Sandbox entitlement', async () => {
  const query={select(){return this;},eq(){return this;},single:async()=>({data:{access_status:'pending'},error:null})};
  const client={from:()=>query,rpc:async()=>({data:0,error:null}),auth:{getUser:async()=>({data:{user:{id:'user-1',email:'free@example.test',email_confirmed_at:'2026-01-01'}},error:null})}};
  const handler=await edge('ai-sandbox',{env,client});
  assert.equal((await handler(request({prompt:'hello'}, {Authorization:'Bearer test'}))).status,403);
});
