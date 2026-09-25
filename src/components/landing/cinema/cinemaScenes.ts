import heroPoster from '@/assets/landing/hero-cinematic-poster.jpg';
import act2Poster from '@/assets/landing/cinematic-act-2-poster.jpg';
import act3Poster from '@/assets/landing/cinematic-act-3-poster.jpg';
import act4Poster from '@/assets/landing/cinematic-act-4-poster.jpg';
import act5Poster from '@/assets/landing/cinematic-act-5-poster.jpg';
import act6Poster from '@/assets/landing/cinematic-act-6-poster.jpg';
import heroVideo from '@/assets/landing/hero-cinematic.mp4.asset.json';
import act2Video from '@/assets/landing/cinematic-act-2-noise.mp4.asset.json';
import act3Video from '@/assets/landing/cinematic-act-3-map.mp4.asset.json';
import act4Video from '@/assets/landing/cinematic-act-4-living-intelligence.mp4.asset.json';
import act5Video from '@/assets/landing/cinematic-act-5-execution.mp4.asset.json';
import act6Video from '@/assets/landing/cinematic-act-6-horizon.mp4.asset.json';

export type CinemaScene = {
  id: string;
  slate: string;
  chapter: string;
  kicker: string;
  title: string[];
  body: string;
  poster: string;
  video: string;
  tone: 'abertura' | 'arsenal' | 'mestre' | 'prejuizo' | 'fabrica' | 'horizonte';
};

export const CINEMA_SCENES: CinemaScene[] = [
  {
    id: 'abertura',
    slate: 'CENA 01',
    chapter: 'ABERTURA',
    kicker: 'Método IA Real',
    title: ['Pare', 'de', 'usar', 'IA.', 'Comece', 'a', 'comandar', 'uma.'],
    body: 'De um lado, quem digita perguntas no ChatGPT. Do outro, quem monta sistemas que trabalham sozinhos e faturam enquanto dorme. Este curso muda o seu lado da mesa.',
    poster: heroPoster,
    video: heroVideo.url,
    tone: 'abertura',
  },
  {
    id: 'arsenal',
    slate: 'CENA 02',
    chapter: 'O ARSENAL',
    kicker: 'Nada de pedaço. A máquina completa.',
    title: ['Todas', 'as', 'ferramentas', 'que', 'movem', 'o', 'mundo', 'hoje.'],
    body: 'ChatGPT, Claude, Gemini, Lovable, Cursor, n8n, Midjourney, ElevenLabs. Você aprende cada uma no lugar certo do processo — e como elas se conectam em uma só linha de produção.',
    poster: act3Poster,
    video: act3Video.url,
    tone: 'arsenal',
  },
  {
    id: 'mestre',
    slate: 'CENA 03',
    chapter: 'O MESTRE',
    kicker: 'Décadas de engenharia no seu bolso',
    title: ['Um', 'arquiteto', 'sênior', 'orientando', 'cada', 'linha.'],
    body: 'O método coloca do seu lado a cabeça de um programador com décadas de estrada — traduzida em passos que você executa hoje. O resultado é produção de equipe grande, feita por uma pessoa só.',
    poster: act4Poster,
    video: act4Video.url,
    tone: 'mestre',
  },
  {
    id: 'prejuizo',
    slate: 'CENA 04',
    chapter: 'A CONTA',
    kicker: 'O preço de continuar do mesmo jeito',
    title: ['Cada', 'mês', 'parado', 'tem', 'um', 'valor.', 'Alto.'],
    body: 'Uma agência cobra R$ 15 mil e entrega em quatro meses o que você vai montar em uma tarde. Oito horas por dia de tarefa repetida é o que uma automação faz de madrugada, de graça.',
    poster: act2Poster,
    video: act2Video.url,
    tone: 'prejuizo',
  },
  {
    id: 'fabrica',
    slate: 'CENA 05',
    chapter: 'A FÁBRICA',
    kicker: 'Você sai com ativos, não com certificado',
    title: ['Apps,', 'automações', 'e', 'produtos', 'no', 'ar.'],
    body: 'Micro-SaaS com cobrança ligada, serviços de automação para empresas, produtos digitais próprios. Cada módulo termina com algo publicado e funcionando no seu nome.',
    poster: act5Poster,
    video: act5Video.url,
    tone: 'fabrica',
  },
  {
    id: 'horizonte',
    slate: 'CENA 06',
    chapter: 'O HORIZONTE',
    kicker: 'A decisão',
    title: ['Entre', 'para', 'o', 'lado', 'que', 'constrói.'],
    body: 'Acesso completo, atualização mensal das ferramentas, comunidade e suporte. Sete dias para testar por dentro — se não for para você, devolvemos tudo.',
    poster: act6Poster,
    video: act6Video.url,
    tone: 'horizonte',
  },
];

export const GIANTS = [
  'OpenAI',
  'Anthropic',
  'Google DeepMind',
  'Lovable',
  'Cursor',
  'Midjourney',
  'n8n',
  'ElevenLabs',
];
