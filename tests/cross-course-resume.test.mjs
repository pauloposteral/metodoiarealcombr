import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const p=new URL('../src/lib/crossCourseResume.ts',import.meta.url);const m=fs.existsSync(p)?await import(p.href):{findCrossCourseResume:()=>null};
const entry=(id,lessons)=>({course:{id,title:id},outline:{modules:[{id:id+'m',code:null,trails:[]}],lessons:lessons.map(([lid,accessible=true])=>({id:lid,module_id:id+'m',title:lid,minutes:10,accessible}))}});const entries=[entry('main',[['m1'],['m2']]),entry('lab',[['l1'],['l2']])];
test('Resume returns the last accessible unfinished lesson across courses',()=>{assert.equal(m.findCrossCourseResume(entries,'main',['l1'],null,new Set()).lesson.id,'l1');});
test('After finishing a lab lesson, the next lab task is proposed, not a reset to main',()=>{assert.equal(m.findCrossCourseResume(entries,'main',['l1'],null,new Set(['l1'])).lesson.id,'l2');});
test('Locked or removed recent content never becomes a shortcut around permission',()=>{const data=[entries[0],entry('lab',[['l1',false]])];assert.equal(m.findCrossCourseResume(data,'main',['missing','l1'],null,new Set()).courseId,'main');});
test('Without history the established main formation is still the starting point',()=>{assert.equal(m.findCrossCourseResume(entries,'main',[],null,new Set()).lesson.id,'m1');});
test('A finished main formation can continue with another available course',()=>{assert.equal(m.findCrossCourseResume(entries,'main',[],null,new Set(['m1','m2'])).courseId,'lab');});
test('All finished or inaccessible courses produce no fabricated pending lesson',()=>{assert.equal(m.findCrossCourseResume(entries,'main',['l2'],null,new Set(['m1','m2','l1','l2'])),null);});
