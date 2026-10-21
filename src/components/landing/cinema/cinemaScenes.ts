import { SCHOOL_MEDIA } from '@/lib/schoolMedia';

export type CinemaScene = {
  id: string;
  slate: string;
  chapter: string;
  kicker: string;
  title: string[];
  body: string;
  poster: string;
  video: string;
  image: typeof SCHOOL_MEDIA[number];
  tone: 'abertura' | 'arsenal' | 'mestre' | 'prejuizo' | 'fabrica' | 'horizonte';
};

export const CINEMA_SCENES: CinemaScene[] = [
  {
    id: 'abertura',
    slate: 'CENA 01',
    chapter: "ABERTURA",
    kicker: "IA para o seu mundo.",
    title: ["Não","só","use","IA.","Crie","com","ela."],
    body: "Aprenda criando conteúdo, vídeos e aplicativos. Um passo de cada vez, com exemplos e prática.",
    poster: SCHOOL_MEDIA[0].sources[2].src,
    video: '',
    image: SCHOOL_MEDIA[0],
    tone: 'abertura',
  },
  {
    id: 'arsenal',
    slate: 'CENA 02',
    chapter: "SEU CONTEÚDO",
    kicker: "Da sua ideia para a tela.",
    title: ["Mostre","o","que","você","sabe","fazer."],
    body: "Transforme uma dúvida real em roteiro, cenas e legenda. Sem fórmula mágica de viralização.",
    poster: SCHOOL_MEDIA[1].sources[2].src,
    video: '',
    image: SCHOOL_MEDIA[1],
    tone: 'arsenal',
  },
  {
    id: 'mestre',
    slate: 'CENA 03',
    chapter: "NA PRÁTICA",
    kicker: "Menos leitura passiva.",
    title: ["Entenda.","Veja.","Faça.","Revise."],
    body: "A aula completa continua disponível. Os atalhos levam ao exemplo, à prática e à revisão.",
    poster: SCHOOL_MEDIA[2].sources[2].src,
    video: '',
    image: SCHOOL_MEDIA[2],
    tone: 'mestre',
  },
  {
    id: 'prejuizo',
    slate: 'CENA 04',
    chapter: "SEU REEL",
    kicker: "Um roteiro que sai do papel.",
    title: ["Uma","ideia.","Seis","passos.","Seu","próximo","Reel."],
    body: "Prepare a abertura, a demonstração e o próximo passo. Exporte seu roteiro e grave no seu ritmo.",
    poster: SCHOOL_MEDIA[1].sources[2].src,
    video: '',
    image: SCHOOL_MEDIA[1],
    tone: 'prejuizo',
  },
  {
    id: 'fabrica',
    slate: 'CENA 05',
    chapter: "SEU PROJETO",
    kicker: "Aprenda construindo.",
    title: ["Seu","primeiro","app.","Seu","próximo","projeto."],
    body: "Do briefing ao teste: organize dados, construa com IA e confira o que realmente funciona.",
    poster: SCHOOL_MEDIA[2].sources[2].src,
    video: '',
    image: SCHOOL_MEDIA[2],
    tone: 'fabrica',
  },
  {
    id: 'horizonte',
    slate: 'CENA 06',
    chapter: "COMECE AQUI",
    kicker: "Conheça antes de decidir.",
    title: ["O","próximo","passo","é","seu."],
    body: "Explore os guias gratuitos ou entre para continuar. A formação completa está a um passo.",
    poster: SCHOOL_MEDIA[0].sources[2].src,
    video: '',
    image: SCHOOL_MEDIA[0],
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
