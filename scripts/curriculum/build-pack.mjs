#!/usr/bin/env node
// Usage: node scripts/curriculum/build-pack.mjs --src <pasta curso> --out <arquivo.json>
// Builds the import pack uploaded in /admin/cursos → "Importar currículo".
// The pack contains paid course content: keep it out of public repositories.
import fs from 'node:fs';
import path from 'node:path';
import { buildPack, loadCurriculum, summarize } from './lib.mjs';

function arg(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

const src = arg('--src');
const out = arg('--out');
if (!src || !out) {
  console.error('Uso: node scripts/curriculum/build-pack.mjs --src <pasta curso> --out <arquivo.json>');
  process.exit(2);
}
const curriculum = loadCurriculum(path.resolve(src));
const summary = summarize(curriculum);
if (summary.errors > 0) {
  console.error(`O conteúdo tem ${summary.errors} erro(s). Rode validate.mjs e corrija antes de gerar o pacote.`);
  process.exit(1);
}
const pack = buildPack(curriculum);
fs.writeFileSync(path.resolve(out), `${JSON.stringify(pack, null, 1)}\n`);
const bytes = fs.statSync(path.resolve(out)).size;
console.log(`Pacote ${pack.version} gerado: ${summary.modules} módulos, ${summary.lessons} aulas, ${summary.questions} perguntas, ${(bytes / 1024).toFixed(0)} KB → ${out}`);
