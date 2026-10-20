export const REELS_LESSON_ID = '5ffa37ee-6b74-6358-fa6e-f51cd3f8dafc';
export const REEL_FIELD_LIMIT = 2000;
export const REEL_FIELDS = ['audience', 'idea', 'hook', 'script', 'shots', 'caption', 'experiment'] as const;
export type ReelField = typeof REEL_FIELDS[number];
export const REEL_CHECKS = ['proof', 'rights', 'captions', 'disclosure'] as const;
export type ReelCheck = typeof REEL_CHECKS[number];
export interface ReelDraft { version: 1; fields: Record<ReelField, string>; checks: Record<ReelCheck, boolean> }
export const REELS_STEPS = [
  { id: 'idea', label: 'Uma ideia', description: 'Escolha uma dúvida real e o que você consegue mostrar.', fields: ['audience', 'idea'] },
  { id: 'hook', label: 'Abertura', description: 'Diga por que vale assistir. Sem prometer o que o vídeo não entrega.', fields: ['hook'] },
  { id: 'script', label: 'Roteiro', description: 'Escreva começo, demonstração e próximo passo. Leia em voz alta.', fields: ['script'] },
  { id: 'shoot', label: 'Cenas', description: 'Defina o que gravar ou gerar. Cada tomada precisa ajudar a entender.', fields: ['shots'] },
  { id: 'publish', label: 'Legenda', description: 'Prepare a capa e a legenda. Confira o vídeo sem som antes de publicar.', fields: ['caption'] },
  { id: 'review', label: 'Revisar', description: 'Confira direitos, clareza e evidência. Escolha uma coisa para testar depois.', fields: ['experiment'] },
] as const;
export function emptyReelDraft(): ReelDraft {
  return { version: 1, fields: { audience: '', idea: '', hook: '', script: '', shots: '', caption: '', experiment: '' }, checks: { proof: false, rights: false, captions: false, disclosure: false } };
}
export function reelDraftKey(userId: string): string { return `ia-real:reel-v1:${userId}:${REELS_LESSON_ID}`; }
export function parseReelDraft(raw: string | null): ReelDraft | null {
  if (!raw || raw.length > 40000) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object' || !('version' in value) || value.version !== 1 || !('fields' in value) || !value.fields || typeof value.fields !== 'object') return null;
    const fields = value.fields as Record<string, unknown>; const result = emptyReelDraft();
    for (const field of REEL_FIELDS) { if (typeof fields[field] !== 'string') return null; result.fields[field] = fields[field].slice(0, REEL_FIELD_LIMIT); }
    const checks = 'checks' in value && value.checks && typeof value.checks === 'object' ? value.checks as Record<string, unknown> : {};
    for (const key of REEL_CHECKS) result.checks[key] = checks[key] === true;
    return result;
  } catch { return null; }
}
export function reelReadiness(draft: ReelDraft) {
  const completed = REEL_FIELDS.filter(key => draft.fields[key].trim()).length;
  return { completed, total: REEL_FIELDS.length, ready: completed === REEL_FIELDS.length && REEL_CHECKS.every(key => draft.checks[key]) };
}
export const REEL_LABELS: Record<ReelField, string> = {
  audience: 'Para quem é este vídeo?', idea: 'O que você vai demonstrar?', hook: 'Sua primeira frase',
  script: 'O que acontece no vídeo?', shots: 'Sua lista de tomadas', caption: 'Capa, legenda e convite', experiment: 'O que você vai observar depois?',
};
export const REEL_EXAMPLES: Record<ReelField, string> = {
  audience: 'Pessoas começando a preparar café com leite em casa.',
  idea: 'Mostrar como a altura do fio de leite muda o desenho, usando uma demonstração própria.',
  hook: 'O desenho some no café? Observe a altura do leite.',
  script: 'ABERTURA: mostrar o desenho sumindo.\nDEMONSTRAÇÃO: comparar duas alturas na mesma preparação.\nFECHAMENTO: mostrar o resultado real e convidar a praticar com segurança.',
  shots: '1. Close da xícara e do problema.\n2. Plano lateral do fio mais alto.\n3. Plano lateral do fio próximo à bebida.\n4. Resultado visto de cima.\nUsar gravações próprias; cuidar do líquido quente.',
  caption: 'CAPA: O desenho some?\nLEGENDA: Neste exemplo, comparei a altura do fio. Pratique uma variável por vez e observe o resultado.\nCONVITE: Salve para testar na próxima preparação.',
  experiment: 'Depois de publicar, registrar a data, o objetivo e os indicadores disponíveis. Comparar duas aberturas em conteúdos semelhantes. Não atribuir toda mudança ao gancho nem prometer alcance.',
};
export const REEL_REVIEW_LABELS: Record<ReelCheck, string> = {
  proof: 'A demonstração sustenta o que eu digo.', rights: 'Tenho direito de usar imagens, voz e música.',
  captions: 'Revisei legenda, leitura e compreensão sem som.', disclosure: 'Conferi as regras de identificação de IA e publicidade aplicáveis.',
};
export function exportReelDraft(draft: ReelDraft): string {
  return `# Roteiro de Reel — Método IA Real\n\nDocumento de trabalho. Este roteiro não garante alcance ou viralização e não publica nem gera um vídeo automaticamente.\n\n${REEL_FIELDS.map(key => `## ${REEL_LABELS[key]}\n\n${draft.fields[key].trim() || '[preencher]'}`).join('\n\n')}\n\n## Revisão humana\n\n${REEL_CHECKS.map(key => `- [${draft.checks[key] ? 'x' : ' '}] ${REEL_REVIEW_LABELS[key]}`).join('\n')}\n\nRevisão final e publicação continuam sob sua responsabilidade.\n`;
}
export function reelPrompt(draft: ReelDraft): string {
  return `Ajude a revisar um roteiro de vídeo curto. Use somente as informações abaixo. Não invente depoimentos, números, resultados ou promessas de viralização. Proponha ajustes específicos de clareza, demonstração, continuidade e acessibilidade. Marque o que depende de autorização, gravação ou confirmação. Não publique nada.\n\n${exportReelDraft(draft)}`;
}
