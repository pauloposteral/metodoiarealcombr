#!/usr/bin/env node
// Usage: node scripts/curriculum/validate.mjs --src <pasta curso> [--module mod-03] [--quiet]
import path from 'node:path';
import { loadCurriculum, summarize } from './lib.mjs';

function arg(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

const src = arg('--src');
if (!src) {
  console.error('Informe a pasta do conteúdo: --src <caminho>/curso');
  process.exit(2);
}
const only = arg('--module');
const quiet = process.argv.includes('--quiet');
const curriculum = loadCurriculum(path.resolve(src), { only });

for (const error of curriculum.errors) console.log(`ERRO  curso: ${error}`);
for (const mod of curriculum.modules) {
  const label = mod.dirName;
  for (const error of mod.errors) console.log(`ERRO  ${label}: ${error}`);
  if (!quiet) for (const warning of mod.warnings) console.log(`AVISO ${label}: ${warning}`);
  for (const lesson of mod.lessons) {
    const file = path.basename(lesson.file);
    for (const error of lesson.errors) console.log(`ERRO  ${label}/${file}: ${error}`);
    if (!quiet) for (const warning of lesson.warnings) console.log(`AVISO ${label}/${file}: ${warning}`);
  }
  const words = mod.lessons.reduce((s, l) => s + l.words, 0);
  console.log(`      ${label}: ${mod.lessons.length} aulas, ${mod.totalMinutes} min (alvo ${mod.meta.hours_label ?? '?'}), ${words} palavras`);
}
const s = summarize(curriculum);
console.log(`\n${s.modules} módulos · ${s.lessons} aulas · ${s.minutes} min (${(s.minutes / 60).toFixed(1)} h) · ${s.words} palavras · ${s.prompts} prompts · ${s.questions} perguntas`);
console.log(`${s.errors} erro(s), ${s.warnings} aviso(s)`);
process.exit(s.errors > 0 ? 1 : 0);
