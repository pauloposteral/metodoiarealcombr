import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const path=new URL('../src/lib/purchaseState.ts',import.meta.url);
const m=fs.existsSync(path)?await import(path.href):{purchaseSessionState:()=> 'authenticated',safeCheckoutDestination:()=>null};

test('Signup without a session is confirmation pending, never authenticated',()=>{assert.equal(m.purchaseSessionState('signup',null),'confirmation-pending');});
test('Login without a session is an error state, not a successful login',()=>{assert.equal(m.purchaseSessionState('login',null),'session-missing');});
test('A user record alone does not establish a checkout session',()=>{assert.equal(m.purchaseSessionState('signup',{user:{id:'u'}}),'confirmation-pending');});
test('Valid session state is derived from returned user and access token',()=>{assert.equal(m.purchaseSessionState('signup',{user:{id:'u'},access_token:'fixture'}),'authenticated');});
test('Checkout navigation accepts the provider HTTPS URL',()=>{assert.equal(m.safeCheckoutDestination('https://checkout.stripe.com/c/pay/test_session'),'https://checkout.stripe.com/c/pay/test_session');});
test('Checkout navigation rejects scripts, foreign hosts and credentials',()=>{for(const value of ['javascript:alert(1)','https://checkout.stripe.com.attacker.invalid/x','http://checkout.stripe.com/x','https://me:secret@checkout.stripe.com/x','/checkout','data:text/html,test'])assert.equal(m.safeCheckoutDestination(value),null);});
