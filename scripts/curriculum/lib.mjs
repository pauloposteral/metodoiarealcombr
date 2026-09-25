// Curriculum-as-code: parses the private Markdown sources, validates them against the
// platform's rendering rules and builds the import pack consumed by /admin/cursos.
// WHY: course content is a paid product and must never be bundled into the public
// frontend or committed to a public repository. Only this tooling lives in the repo.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const PACK_FORMAT = 'metodo-ia-real/curriculum@1';
export const TRAILS = ['carreira', 'empreendedor', 'criador', 'construtor'];
export const LESSON_TYPES = ['text', 'project'];
// Stable namespace so every environment derives the same lesson/module/quiz ids.
const NAMESPACE = 'b3c1a7a2-5d0e-5f7b-9a41-6f1e2d3c4b5a';

/** RFC 4122 version 5 UUID (SHA-1, name-based). */
export function uuidv5(name, namespace = NAMESPACE) {
  const ns = Buffer.from(namespace.replace(/-/g, ''), 'hex');
  const hash = crypto.createHash('sha1').update(Buffer.concat([ns, Buffer.from(name, 'utf8')])).digest();
  const bytes = Buffer.from(hash.subarray(0, 16));
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function parseScalar(raw, key, errors) {
  const value = raw.trim();
  if (value === '') { errors.push(`frontmatter "${key}" está vazio`); return ''; }
  if (value.startsWith('[')) {
    if (!value.endsWith(']')) { errors.push(`frontmatter "${key}": lista sem "]"`); return []; }
    const inner = value.slice(1, -1).trim();
    return inner === '' ? [] : inner.split(',').map((item) => item.trim().replace(/^"(.*)"$/, '$1'));
  }
  if (value.startsWith('"')) {
    if (!value.endsWith('"') || value.length < 2) { errors.push(`frontmatter "${key}": aspas sem fechamento`); return value; }
    return value.slice(1, -1).replace(/\\"/g, '"');
  }
  if (value.startsWith("'")) { errors.push(`frontmatter "${key}": use aspas duplas, não simples`); return value; }
  if (value === 'true' || value === 'false') return value === 'true';
  if (/^-?\d+$/.test(value)) return Number(value);
  return value;
}

/** Restricted frontmatter: `key: value` pairs only (see _guia/FORMATO.md). */
export function parseFrontmatter(text) {
  const errors = [];
  const normalized = text.replace(/\r\n/g, '\n').replace(/^\uFEFF/, '');
  if (!normalized.startsWith('---\n')) return { data: {}, body: normalized, errors: ['arquivo não começa com "---" (cabeçalho ausente)'] };
  const end = normalized.indexOf('\n---', 4);
  if (end === -1) return { data: {}, body: normalized, errors: ['cabeçalho sem a linha "---" de fechamento'] };
  const header = normalized.slice(4, end);
  const afterHeader = normalized.slice(end + 4);
  const body = afterHeader.replace(/^[^\n]*\n/, '');
  const data = {};
  header.split('\n').forEach((line, index) => {
    if (line.trim() === '') return;
    const match = line.match(/^([a-z_]+):(.*)$/);
    if (!match) { errors.push(`cabeçalho linha ${index + 2}: formato inválido "${line.slice(0, 60)}"`); return; }
    if (match[1] in data) errors.push(`cabeçalho: chave "${match[1]}" repetida`);
    data[match[1]] = parseScalar(match[2], match[1], errors);
  });
  return { data, body, errors };
}

/** Parses the custom quiz block format. Returns questions plus parse errors. */
export function parseQuiz(source) {
  const errors = [];
  const questions = [];
  const chunks = source.replace(/\r\n/g, '\n').trim().split(/\n\s*\n(?=P:)/);
  chunks.forEach((chunk, qi) => {
    const label = `quiz pergunta ${qi + 1}`;
    const lines = chunk.split('\n').map((l) => l.trim()).filter(Boolean);
    const q = { question: '', options: [], correct: -1, explanation: '' };
    let correctLetter = null;
    for (const line of lines) {
      let m;
      if ((m = line.match(/^P:\s*(.+)$/))) q.question = m[1].trim();
      else if ((m = line.match(/^([A-D])\)\s*(.+)$/))) {
        const expected = String.fromCharCode(65 + q.options.length);
        if (m[1] !== expected) errors.push(`${label}: opção ${m[1]}) fora de ordem (esperado ${expected})`);
        q.options.push(m[2].trim());
      } else if ((m = line.match(/^Correta:\s*([A-D])\s*$/))) correctLetter = m[1];
      else if ((m = line.match(/^Explica[çc][ãa]o:\s*(.+)$/))) q.explanation = m[1].trim();
      else errors.push(`${label}: linha não reconhecida "${line.slice(0, 60)}"`);
    }
    if (!q.question) errors.push(`${label}: falta a linha "P:"`);
    if (q.options.length < 3 || q.options.length > 4) errors.push(`${label}: precisa de 3 ou 4 opções (tem ${q.options.length})`);
    if (!correctLetter) errors.push(`${label}: falta "Correta: <letra>"`);
    else {
      q.correct = correctLetter.charCodeAt(0) - 65;
      if (q.correct >= q.options.length) errors.push(`${label}: resposta ${correctLetter} não existe`);
    }
    if (q.explanation.length < 20) errors.push(`${label}: explicação ausente ou curta demais`);
    const lowered = q.options.map((o) => o.toLowerCase());
    if (lowered.some((o) => /todas as (anteriores|alternativas)|nenhuma das (anteriores|alternativas)/.test(o))) {
      errors.push(`${label}: não use "todas/nenhuma das anteriores"`);
    }
    if (new Set(lowered).size !== lowered.length) errors.push(`${label}: opções repetidas`);
    questions.push(q);
  });
  return { questions, errors };
}

const FENCE = /^```(\w*)\s*$/;

/** Splits a lesson body into rendered content, copyable prompts and the quiz source. */
export function extractBlocks(body) {
  const lines = body.replace(/\r\n/g, '\n').split('\n');
  const kept = [];
  const prompts = [];
  const quizzes = [];
  const errors = [];
  for (let i = 0; i < lines.length; i++) {
    const open = lines[i].match(FENCE);
    if (!open) { kept.push(lines[i]); continue; }
    const lang = open[1];
    const start = i;
    const inner = [];
    i++;
    while (i < lines.length && !/^```\s*$/.test(lines[i])) { inner.push(lines[i]); i++; }
    if (i >= lines.length) { errors.push(`bloco de código aberto na linha ${start + 1} não foi fechado`); break; }
    if (lang === 'prompt') prompts.push(inner.join('\n').trim());
    else if (lang === 'quiz') quizzes.push(inner.join('\n'));
    else kept.push(...lines.slice(start, i + 1));
  }
  const content = kept.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  return { content, prompts, quizzes, errors };
}

export function countWords(markdown) {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#>*_`|:-]/g, ' ');
  return (text.match(/[\p{L}\p{N}][\p{L}\p{N}'’.,]*/gu) || []).length;
}

const EMOJI = /\p{Extended_Pictographic}/gu;

/** Rendering-rule checks for Markdown the platform's lightweight renderer can display. */
export function lintMarkdown(content) {
  const errors = [];
  const warnings = [];
  const lines = content.split('\n');
  let openBlock = null;
  let inCode = false;
  lines.forEach((line, index) => {
    const where = `linha ${index + 1}`;
    if (/^```/.test(line)) { inCode = !inCode; return; }
    if (inCode) return;
    const block = line.trim().match(/^:::(tip|warning|success|exercise)?(.*)$/);
    if (block) {
      if (line.trim() === ':::') {
        if (!openBlock) errors.push(`${where}: ":::" de fechamento sem bloco aberto`);
        openBlock = null;
      } else if (!block[1]) errors.push(`${where}: bloco ":::" inválido (use tip, warning, success ou exercise)`);
      else {
        if (openBlock) errors.push(`${where}: bloco ":::${block[1]}" aberto dentro de outro bloco`);
        openBlock = block[1];
      }
      return;
    }
    if (/^#\s/.test(line)) errors.push(`${where}: título nível 1 ("# ") não é permitido; use "##"`);
    if (/!\[[^\]]*\]\(/.test(line)) errors.push(`${where}: imagens não são permitidas`);
    if (/<\/?[a-z][a-z0-9-]*(\s[^>]*)?>/i.test(line)) errors.push(`${where}: HTML não é permitido`);
    if (/^\s+([-*+]|\d+\.)\s+/.test(line)) errors.push(`${where}: lista indentada/aninhada não é suportada`);
    for (const match of line.matchAll(/\]\(([^)]+)\)/g)) {
      const url = match[1].trim();
      if (!/^(https?:\/\/[^\s]+|mailto:[^\s]+|\/membros(\/[^\s]*)?)$/.test(url)) errors.push(`${where}: link inválido "${url.slice(0, 60)}"`);
    }
  });
  if (openBlock) errors.push(`bloco ":::${openBlock}" sem ":::" de fechamento`);
  if (inCode) errors.push('bloco de código sem fechamento');
  const emojis = content.match(EMOJI) || [];
  if (emojis.length > 2) warnings.push(`${emojis.length} emojis (máximo recomendado: 2)`);
  return { errors, warnings };
}

function sectionHeadings(content) {
  return content.split('\n').filter((l) => /^##\s+\S/.test(l)).map((l) => l.replace(/^##\s+/, '').trim());
}

export function parseLessonFile(filePath, moduleNumber, position) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, body, errors: fmErrors } = parseFrontmatter(raw);
  const { content, prompts, quizzes, errors: blockErrors } = extractBlocks(body);
  const errors = [...fmErrors, ...blockErrors];
  const warnings = [];
  const nn = String(moduleNumber).padStart(2, '0');
  const aa = String(position).padStart(2, '0');

  for (const key of ['slug', 'title', 'description', 'minutes', 'type', 'updated']) {
    if (!(key in data)) errors.push(`cabeçalho sem "${key}"`);
  }
  const allowed = new Set(['slug', 'title', 'description', 'minutes', 'type', 'updated', 'free']);
  for (const key of Object.keys(data)) if (!allowed.has(key)) errors.push(`cabeçalho com chave desconhecida "${key}"`);

  const type = data.type;
  if (type !== undefined && !LESSON_TYPES.includes(type)) errors.push(`type "${type}" inválido (use text ou project)`);
  if (typeof data.slug === 'string') {
    const re = new RegExp(`^mod-${nn}-${aa}-[a-z0-9]+(-[a-z0-9]+)*$`);
    if (!re.test(data.slug)) errors.push(`slug "${data.slug}" deve seguir mod-${nn}-${aa}-palavras-chave`);
    else if (data.slug.length - 10 < 3 || data.slug.length - 10 > 60) errors.push('slug: parte descritiva deve ter de 3 a 60 caracteres');
  } else if ('slug' in data) errors.push('slug deve ser texto');
  if (typeof data.title !== 'string' || data.title.length < 5 || data.title.length > 90) errors.push('title deve ter de 5 a 90 caracteres');
  if (typeof data.description !== 'string' || data.description.length < 20 || data.description.length > 200) errors.push('description deve ter de 20 a 200 caracteres');
  if (typeof data.updated !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data.updated) || Number.isNaN(Date.parse(data.updated))) errors.push('updated deve ser uma data AAAA-MM-DD');
  if ('free' in data && typeof data.free !== 'boolean') errors.push('free deve ser true ou false');
  const minutes = data.minutes;
  if (!Number.isInteger(minutes)) errors.push('minutes deve ser inteiro');
  else if (type === 'text' && (minutes < 5 || minutes > 15)) errors.push(`minutes ${minutes} fora de 5–15 para aula de conteúdo`);
  else if (type === 'project' && (minutes < 30 || minutes > 90)) errors.push(`minutes ${minutes} fora de 30–90 para projeto`);

  const lint = lintMarkdown(content);
  errors.push(...lint.errors);
  warnings.push(...lint.warnings);

  const words = countWords(content);
  const headings = sectionHeadings(content);
  const firstLine = content.split('\n').find((l) => l.trim() !== '') || '';
  if (/^#{2,}\s/.test(firstLine)) errors.push('a aula deve abrir com um parágrafo, não com um título');
  if (type === 'text') {
    const teaching = headings.filter((h) => !/^(Resumo|Fontes)/i.test(h)).length;
    if (teaching < 3) errors.push(`aula de conteúdo precisa de pelo menos 3 seções "##" de ensino além de Resumo/Fontes (tem ${teaching})`);
    if (!/^:::exercise\b/m.test(content)) errors.push('falta o bloco ":::exercise Resultado da aula"');
    if (!/^:::warning\b/m.test(content)) warnings.push('sem bloco ":::warning" (erro comum, risco ou limite)');
    if (words < 600) errors.push(`texto curto demais (${words} palavras; mínimo 600)`);
    else if (words < 900) warnings.push(`texto abaixo do recomendado (${words} palavras; alvo 900–1.800)`);
    else if (words > 2200) warnings.push(`texto longo demais (${words} palavras; alvo 900–1.800)`);
    if (prompts.length < 3 || prompts.length > 6) errors.push(`aula de conteúdo precisa de 3 a 6 prompts (tem ${prompts.length})`);
    if (quizzes.length !== 1) errors.push(`aula de conteúdo precisa de exatamente 1 bloco quiz (tem ${quizzes.length})`);
  } else if (type === 'project') {
    if (words < 500) errors.push(`projeto curto demais (${words} palavras; mínimo 500)`);
    else if (words < 700) warnings.push(`projeto abaixo do recomendado (${words} palavras; alvo 700–1.600)`);
    if (prompts.length < 2 || prompts.length > 6) errors.push(`projeto precisa de 2 a 6 prompts (tem ${prompts.length})`);
    if (quizzes.length > 1) errors.push('projeto pode ter no máximo 1 bloco quiz');
    if (!/est[aá] pront[oa] quando/i.test(content)) warnings.push('projeto sem critério "está pronto quando"');
  }
  const summaryIndex = headings.findIndex((h) => /^Resumo$/i.test(h));
  if (summaryIndex === -1) errors.push('falta a seção "## Resumo"');
  else {
    const after = content.split(/^##\s+Resumo\s*$/m)[1] || '';
    const bullets = (after.split(/^##\s/m)[0].match(/^-\s+\S/gm) || []).length;
    if (bullets < 3 || bullets > 6) errors.push(`"## Resumo" precisa de 3 a 6 tópicos com "- " (tem ${bullets})`);
  }
  prompts.forEach((prompt, index) => {
    if (prompt.length < 60 || prompt.length > 2500) errors.push(`prompt ${index + 1}: tamanho ${prompt.length} fora de 60–2.500 caracteres`);
  });

  let quiz = null;
  if (quizzes.length >= 1) {
    const parsed = parseQuiz(quizzes[0]);
    errors.push(...parsed.errors);
    const count = parsed.questions.length;
    if (type === 'text' && (count < 3 || count > 4)) errors.push(`quiz precisa de 3 ou 4 perguntas (tem ${count})`);
    quiz = parsed.questions;
  }

  return {
    file: filePath,
    position,
    slug: data.slug,
    title: data.title,
    description: data.description,
    minutes,
    type,
    free: data.free === true,
    updated: data.updated,
    content,
    prompts,
    quiz,
    words,
    headings,
    errors,
    warnings,
  };
}

const MODULE_DIR = /^mod-(\d{2})-[a-z0-9]+(-[a-z0-9]+)*$/;
const LESSON_FILE = /^(\d{2})-[a-z0-9]+(-[a-z0-9]+)*\.md$/;

export function hoursLabelToMinutes(label) {
  const m = typeof label === 'string' ? label.match(/^~(\d+)h(\d{2})?$/) : null;
  return m ? Number(m[1]) * 60 + Number(m[2] || 0) : null;
}

export function parseModuleDir(dirPath) {
  const dirName = path.basename(dirPath);
  const errors = [];
  const warnings = [];
  const dirMatch = dirName.match(MODULE_DIR);
  if (!dirMatch) errors.push(`pasta "${dirName}" deve seguir mod-NN-slug`);
  const number = dirMatch ? Number(dirMatch[1]) : -1;
  const metaPath = path.join(dirPath, '_modulo.md');
  let meta = {};
  let intro = '';
  if (!fs.existsSync(metaPath)) errors.push('falta o arquivo _modulo.md');
  else {
    const { data, body, errors: fmErrors } = parseFrontmatter(fs.readFileSync(metaPath, 'utf8'));
    meta = data;
    intro = body.trim();
    errors.push(...fmErrors.map((e) => `_modulo.md: ${e}`));
    const code = `MOD-${String(number).padStart(2, '0')}`;
    const required = ['code', 'order', 'slug', 'title', 'description', 'hours_label', 'trails', 'project_title', 'star'];
    for (const key of required) if (!(key in data)) errors.push(`_modulo.md sem "${key}"`);
    for (const key of Object.keys(data)) if (!required.includes(key)) errors.push(`_modulo.md com chave desconhecida "${key}"`);
    if (data.code !== code) errors.push(`_modulo.md: code deve ser ${code}`);
    if (data.order !== number) errors.push(`_modulo.md: order deve ser ${number}`);
    if (data.slug !== dirName) errors.push(`_modulo.md: slug deve ser "${dirName}"`);
    if (typeof data.title !== 'string' || data.title.length < 5 || data.title.length > 80 || /^MOD-/i.test(data.title)) errors.push('_modulo.md: title deve ter 5–80 caracteres, sem prefixo MOD-');
    if (typeof data.description !== 'string' || data.description.length < 30 || data.description.length > 300) errors.push('_modulo.md: description deve ter 30–300 caracteres');
    if (hoursLabelToMinutes(data.hours_label) === null) errors.push('_modulo.md: hours_label deve ser como ~1h ou ~2h30');
    if (!Array.isArray(data.trails) || data.trails.length === 0 || data.trails.some((t) => !TRAILS.includes(t))) errors.push(`_modulo.md: trails deve listar valores de ${TRAILS.join(', ')}`);
    if (typeof data.project_title !== 'string' || data.project_title.length < 10 || data.project_title.length > 160) errors.push('_modulo.md: project_title deve ter 10–160 caracteres');
    if (typeof data.star !== 'boolean') errors.push('_modulo.md: star deve ser true ou false');
    const introWords = countWords(intro);
    if (introWords < 60 || introWords > 300) errors.push(`_modulo.md: apresentação com ${introWords} palavras (use 80–250)`);
    const lint = lintMarkdown(intro);
    errors.push(...lint.errors.map((e) => `_modulo.md: ${e}`));
  }

  const files = fs.existsSync(dirPath) ? fs.readdirSync(dirPath).filter((f) => f.endsWith('.md') && f !== '_modulo.md').sort() : [];
  const lessons = [];
  files.forEach((file, index) => {
    const m = file.match(LESSON_FILE);
    if (!m) { errors.push(`arquivo "${file}" deve seguir NN-slug.md`); return; }
    if (Number(m[1]) !== index + 1) errors.push(`arquivo "${file}": numeração deveria ser ${String(index + 1).padStart(2, '0')}`);
    lessons.push(parseLessonFile(path.join(dirPath, file), number, index + 1));
  });
  if (lessons.length < 5 || lessons.length > 13) errors.push(`módulo com ${lessons.length} aulas (use de 6 a 12)`);
  const projects = lessons.filter((l) => l.type === 'project');
  if (projects.length !== 1) errors.push(`módulo precisa de exatamente 1 projeto (tem ${projects.length})`);
  else if (lessons[lessons.length - 1].type !== 'project') errors.push('o projeto deve ser a última aula do módulo');
  const totalMinutes = lessons.reduce((sum, l) => sum + (Number.isInteger(l.minutes) ? l.minutes : 0), 0);
  const target = hoursLabelToMinutes(meta.hours_label);
  if (target && Math.abs(totalMinutes - target) / target > 0.25) warnings.push(`soma de minutos ${totalMinutes} está longe de ${meta.hours_label} (${target} min)`);
  if (number >= 3 && number <= 11) {
    for (const lesson of lessons) {
      if (lesson.type === 'text' && !lesson.headings.some((h) => /^Fontes/i.test(h))) lesson.warnings.push('aula de ferramenta sem "## Fontes e leitura"');
    }
  }
  const letters = lessons.flatMap((l) => (l.quiz || []).map((q) => q.correct));
  if (letters.length >= 8) {
    const counts = [0, 1, 2, 3].map((n) => letters.filter((x) => x === n).length);
    const max = Math.max(...counts);
    if (max / letters.length > 0.45) warnings.push(`quiz: ${Math.round((max / letters.length) * 100)}% das respostas na mesma letra`);
  }
  return { dir: dirPath, dirName, number, meta, intro, lessons, totalMinutes, errors, warnings };
}

export function loadCurriculum(srcDir, { only } = {}) {
  const coursePath = path.join(srcDir, 'curso.json');
  const errors = [];
  let course = null;
  if (!fs.existsSync(coursePath)) errors.push('falta curso.json');
  else {
    try { course = JSON.parse(fs.readFileSync(coursePath, 'utf8')); } catch (e) { errors.push(`curso.json inválido: ${e.message}`); }
  }
  const dirs = fs.readdirSync(srcDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith('mod-'))
    .map((d) => d.name)
    .sort()
    .filter((name) => !only || name.startsWith(only));
  const modules = dirs.map((d) => parseModuleDir(path.join(srcDir, d)));
  if (!only) {
    const numbers = modules.map((m) => m.number);
    for (let n = 0; n <= 12; n++) if (!numbers.includes(n)) errors.push(`módulo ${String(n).padStart(2, '0')} ausente`);
    if (new Set(numbers).size !== numbers.length) errors.push('há dois módulos com o mesmo número');
  }
  const seen = new Map();
  for (const mod of modules) for (const lesson of mod.lessons) {
    if (!lesson.slug) continue;
    if (seen.has(lesson.slug)) lesson.errors.push(`slug repetido (também em ${seen.get(lesson.slug)})`);
    else seen.set(lesson.slug, lesson.file);
  }
  return { srcDir, course, modules, errors };
}

export function summarize(curriculum) {
  let errors = curriculum.errors.length;
  let warnings = 0;
  for (const mod of curriculum.modules) {
    errors += mod.errors.length;
    warnings += mod.warnings.length;
    for (const lesson of mod.lessons) { errors += lesson.errors.length; warnings += lesson.warnings.length; }
  }
  const lessons = curriculum.modules.flatMap((m) => m.lessons);
  return {
    errors,
    warnings,
    modules: curriculum.modules.length,
    lessons: lessons.length,
    words: lessons.reduce((s, l) => s + l.words, 0),
    prompts: lessons.reduce((s, l) => s + l.prompts.length, 0),
    questions: lessons.reduce((s, l) => s + (l.quiz ? l.quiz.length : 0), 0),
    minutes: lessons.reduce((s, l) => s + (Number.isInteger(l.minutes) ? l.minutes : 0), 0),
  };
}

const COURSE_KEYS = ['id', 'slug', 'title', 'description', 'difficulty', 'estimated_hours', 'tags', 'version'];

export function buildPack(curriculum, generatedAt = new Date().toISOString()) {
  const { course } = curriculum;
  for (const key of COURSE_KEYS) if (!(key in (course || {}))) throw new Error(`curso.json sem "${key}"`);
  return {
    format: PACK_FORMAT,
    version: course.version,
    generated_at: generatedAt,
    course: Object.fromEntries(COURSE_KEYS.filter((k) => k !== 'version').map((k) => [k, course[k]])),
    modules: curriculum.modules.map((mod) => {
      const code = mod.meta.code;
      return {
        id: uuidv5(`module/${code}`),
        code,
        order_index: mod.meta.order,
        slug: mod.meta.slug,
        title: mod.meta.title,
        description: mod.meta.description,
        intro: mod.intro,
        hours_label: mod.meta.hours_label,
        trails: mod.meta.trails,
        project_title: mod.meta.project_title,
        is_star: mod.meta.star,
        lessons: mod.lessons.map((lesson, index) => ({
          id: uuidv5(`lesson/${lesson.slug}`),
          slug: lesson.slug,
          order_index: index,
          title: lesson.title,
          description: lesson.description,
          content: lesson.content,
          prompts: lesson.prompts,
          type: lesson.type,
          estimated_minutes: lesson.minutes,
          is_free: lesson.free,
          reviewed_at: lesson.updated,
          quiz: lesson.quiz ? {
            id: uuidv5(`quiz/${lesson.slug}`),
            title: `Fixação: ${lesson.title}`.slice(0, 120),
            questions: lesson.quiz,
            passing_score: 70,
            max_attempts: 3,
          } : null,
        })),
      };
    }),
  };
}
