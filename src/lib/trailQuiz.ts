/**
 * Two-minute trail quiz (/membros/trilha). Each option adds weights to one or more tracks;
 * the highest total wins. Pure module so the scoring is covered by `node --test`.
 */
import { TRACK_KEYS, TRACKS, hoursLabelToHours, type TrackKey } from './curriculum.ts';

export interface TrailQuizOption {
  id: string;
  label: string;
  /** Second-person phrase used in the recommendation ("você quer …"). */
  reason: string;
  weights: Partial<Record<TrackKey, number>>;
  /** Study hours per week this option stands for (time question only). */
  weeklyHours?: number;
}

export interface TrailQuizQuestion {
  id: 'goal' | 'context' | 'build' | 'time' | 'tech';
  title: string;
  options: TrailQuizOption[];
}

export const TRAIL_QUIZ: readonly TrailQuizQuestion[] = [
  {
    id: 'goal',
    title: 'O que você mais quer conseguir com IA agora?',
    options: [
      { id: 'work', label: 'Ganhar tempo e me destacar no trabalho', reason: 'você quer ganhar tempo e se destacar no trabalho', weights: { carreira: 3 } },
      { id: 'business', label: 'Vender mais e gastar menos no meu negócio', reason: 'você quer vender mais e gastar menos no seu negócio', weights: { empreendedor: 3 } },
      { id: 'content', label: 'Produzir conteúdo melhor e com mais frequência', reason: 'você quer produzir conteúdo melhor e com mais frequência', weights: { criador: 3 } },
      { id: 'build', label: 'Tirar do papel um app ou produto digital', reason: 'você quer tirar do papel um app ou produto digital', weights: { construtor: 3 } },
      { id: 'all', label: 'Dominar a IA de ponta a ponta, sem pular etapas', reason: 'você quer dominar a IA de ponta a ponta', weights: { completa: 3 } },
    ],
  },
  {
    id: 'context',
    title: 'Qual frase descreve melhor o seu trabalho hoje?',
    options: [
      { id: 'employee', label: 'Sou CLT, servidor(a) ou trabalho em uma empresa', reason: 'você trabalha em uma empresa ou no serviço público', weights: { carreira: 2 } },
      { id: 'owner', label: 'Tenho um negócio próprio ou atendo clientes por conta própria', reason: 'você tem um negócio ou atende clientes por conta própria', weights: { empreendedor: 2 } },
      { id: 'creator', label: 'Crio conteúdo para redes sociais (ou quero começar)', reason: 'você cria conteúdo para as redes', weights: { criador: 2 } },
      { id: 'transition', label: 'Sou freelancer, estudante ou estou mudando de área', reason: 'você está em um momento de construção ou de transição', weights: { construtor: 1, carreira: 1, completa: 1 } },
    ],
  },
  {
    id: 'build',
    title: 'O que você mais quer ter pronto no fim do curso?',
    options: [
      { id: 'office', label: 'Documentos, planilhas, e-mails e apresentações na metade do tempo', reason: 'você quer documentos, planilhas e e-mails na metade do tempo', weights: { carreira: 2 } },
      { id: 'sales', label: 'Atendimento, vendas e rotinas do negócio rodando com IA', reason: 'você quer atendimento, vendas e rotinas rodando com IA', weights: { empreendedor: 2 } },
      { id: 'media', label: 'Posts, imagens, vídeos e voz com a minha identidade', reason: 'você quer posts, imagens, vídeos e voz com a sua identidade', weights: { criador: 2 } },
      { id: 'app', label: 'Um app ou ferramenta publicada que outras pessoas usam', reason: 'você quer publicar um app ou ferramenta', weights: { construtor: 2 } },
      { id: 'portfolio', label: 'Um portfólio com projetos de todas as áreas', reason: 'você quer um portfólio com projetos de todas as áreas', weights: { completa: 2 } },
    ],
  },
  {
    id: 'time',
    title: 'Quanto tempo por semana você consegue estudar?',
    options: [
      { id: 'short', label: 'Até 2 horas', reason: 'você tem até 2 horas por semana', weights: { completa: -2 }, weeklyHours: 1.5 },
      { id: 'medium', label: 'De 2 a 4 horas', reason: 'você tem de 2 a 4 horas por semana', weights: {}, weeklyHours: 3 },
      { id: 'long', label: 'Mais de 4 horas', reason: 'você tem mais de 4 horas por semana', weights: { completa: 2 }, weeklyHours: 5 },
    ],
  },
  {
    id: 'tech',
    title: 'Como você se sente com tecnologia?',
    options: [
      { id: 'basic', label: 'Prefiro passo a passo, sem termos técnicos', reason: 'você prefere aprender passo a passo', weights: { carreira: 1, empreendedor: 1, criador: 1 } },
      { id: 'comfortable', label: 'Me viro bem com apps e ferramentas novas', reason: 'você se vira bem com ferramentas novas', weights: { empreendedor: 1, criador: 1, construtor: 1 } },
      { id: 'tinkerer', label: 'Gosto de fuçar, configurar e testar coisas', reason: 'você gosta de fuçar e configurar', weights: { construtor: 2, completa: 1 } },
    ],
  },
];

export type TrailQuizAnswers = Partial<Record<TrailQuizQuestion['id'], string>>;

export interface TrailQuizResult {
  track: TrackKey;
  scores: Record<TrackKey, number>;
  /** Phrases from the answers that pointed to the recommended track. */
  reasons: string[];
  weeklyHours: number | null;
  /** Weeks to finish the track at the chosen pace. */
  estimatedWeeks: number | null;
}

export function countAnswered(answers: TrailQuizAnswers): number {
  return TRAIL_QUIZ.filter((question) => findOption(question, answers[question.id])).length;
}

function findOption(question: TrailQuizQuestion, optionId: string | undefined): TrailQuizOption | undefined {
  return optionId ? question.options.find((option) => option.id === optionId) : undefined;
}

/** Recommendation for a complete set of answers; null while any question is unanswered. */
export function scoreTrailQuiz(answers: TrailQuizAnswers): TrailQuizResult | null {
  const options = TRAIL_QUIZ.map((question) => findOption(question, answers[question.id])).filter(
    (option): option is TrailQuizOption => option !== undefined,
  );
  if (options.length !== TRAIL_QUIZ.length) return null;

  const scores: Record<TrackKey, number> = { carreira: 0, empreendedor: 0, criador: 0, construtor: 0, completa: 0 };
  for (const option of options) {
    for (const key of TRACK_KEYS) scores[key] += option.weights[key] ?? 0;
  }
  // Ties go to the track of the main goal, then to the fixed track order.
  const goalTrack = TRACK_KEYS.find((key) => (options[0].weights[key] ?? 0) > 0);
  const priority = goalTrack ? [goalTrack, ...TRACK_KEYS.filter((key) => key !== goalTrack)] : [...TRACK_KEYS];
  const track = priority.reduce((best, key) => (scores[key] > scores[best] ? key : best), priority[0]);

  const weeklyHours = options.find((option) => option.weeklyHours !== undefined)?.weeklyHours ?? null;
  return {
    track,
    scores,
    reasons: options.filter((option) => (option.weights[track] ?? 0) > 0).map((option) => option.reason),
    weeklyHours,
    estimatedWeeks: estimateWeeks(track, weeklyHours),
  };
}

export function estimateWeeks(track: TrackKey, weeklyHours: number | null): number | null {
  const hours = hoursLabelToHours(TRACKS[track].hoursLabel);
  return hours && weeklyHours ? Math.ceil(hours / weeklyHours) : null;
}

/** "a, b e c" in Portuguese. */
export function joinReasons(reasons: readonly string[]): string {
  if (reasons.length <= 1) return reasons[0] ?? '';
  return `${reasons.slice(0, -1).join(', ')} e ${reasons[reasons.length - 1]}`;
}
