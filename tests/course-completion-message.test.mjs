import test from 'node:test';
import assert from 'node:assert/strict';
import * as curriculum from '../src/lib/curriculum.ts';
test('Main course keeps its existing certificate guidance',()=>{
 assert.equal(curriculum.courseCompletionDescription?.(curriculum.CURRICULUM_COURSE_ID),'Veja os requisitos do certificado.');
});
test('Additional courses never imply automatic certificate eligibility',()=>{
 const text=curriculum.courseCompletionDescription?.('e20b4e91-fe38-b030-b292-6bd0094846fe');
 assert.equal(text,'Seu progresso foi salvo neste curso. Isso não emite um certificado automaticamente.');
});
