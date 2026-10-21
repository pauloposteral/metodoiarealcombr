import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const path=new URL('../src/lib/accountDrafts.ts',import.meta.url);const clear=fs.existsSync(path)?(await import(path.href)).clearAccountDrafts:()=>{};
const make=()=>{const map=new Map([['ia-real:note-draft-v1:alice:lesson','secret-a'],['ia-real:reel-v1:alice:lesson','idea'],['ia-real:note-draft-v1:bob:lesson','secret-b'],['other-app','keep']]);return{map,storage:{get length(){return map.size;},key:i=>[...map.keys()][i]??null,removeItem:k=>map.delete(k)}};};
test('Changing account clears only its own pending work',()=>{const {map,storage}=make();clear(storage,'alice');assert.deepEqual([...map.keys()],['ia-real:note-draft-v1:bob:lesson','other-app']);});
test('Sign-out clears this app draft families and leaves unrelated storage intact',()=>{const {map,storage}=make();clear(storage);assert.deepEqual([...map.keys()],['other-app']);});
test('Unavailable storage never prevents sign-out',()=>{assert.doesNotThrow(()=>clear({get length(){throw Error('disabled');},key:()=>null,removeItem:()=>{}}));});
