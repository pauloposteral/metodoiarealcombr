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
    kicker: "Aprenda. Crie. Aplique.",
    title: ["Não","só","use","IA.","Crie","com","ela."],
    body: "13 módulos, 124 aulas e 13 projetos. Do primeiro prompt ao seu portfólio, com uma trilha para o seu objetivo.",
    poster: heroPoster,
    video: heroVideo.url,
    tone: 'abertura',
  },
  {
    id: 'arsenal',
    slate: 'CENA 02',
    chapter: 'O ARSENAL',
    kicker: "Um caminho para o seu objetivo.",
    title: ["Escolha","sua","trilha.","Comece","pelo","próximo","passo."],
    body: "Carreira, negócio, conteúdo ou aplicativos. Aprenda a escolher ferramentas e aplicar a IA a tarefas do seu dia.",
    poster: act3Poster,
    video: act3Video.url,
    tone: 'arsenal',
  },
  {
    id: 'mestre',
    slate: 'CENA 03',
    chapter: 'O MESTRE',
    kicker: "Conhecimento que vira prática.",
    title: ["Entenda.","Veja","o","exemplo.","Faça","o","seu."],
    body: "Aulas em texto, exercícios, quizzes e projetos. Confira o resultado antes de seguir para a próxima etapa.",
    poster: act4Poster,
    video: act4Video.url,
    tone: 'mestre',
  },
  {
    id: 'prejuizo',
    slate: 'CENA 04',
    chapter: 'A CONTA',
    kicker: "Menos improviso. Mais critério.",
    title: ["Aprenda","a","avaliar","o","que","a","IA","entrega."],
    body: "Compare respostas, confira fontes e reconheça limites. O método inclui segurança, revisão humana e testes do que você constrói.",
    poster: act2Poster,
    video: act2Video.url,
    tone: 'prejuizo',
  },
  {
    id: 'fabrica',
    slate: 'CENA 05',
    chapter: 'A FÁBRICA',
    kicker: "Seu portfólio começa aqui.",
    title: ["Prompts,","conteúdo,","aplicativos","e","automações."],
    body: "Cada módulo termina com um projeto para aplicar o aprendizado. Registre o que funciona, o que precisa de ajuste e o que ainda não foi validado.",
    poster: act5Poster,
    video: act5Video.url,
    tone: 'fabrica',
  },
  {
    id: 'horizonte',
    slate: 'CENA 06',
    chapter: 'O HORIZONTE',
    kicker: "Comece pelo primeiro resultado.",
    title: ["Seu","próximo","passo","começa","aqui."],
    body: "Conheça o programa, experimente os guias gratuitos e escolha sua trilha. A formação completa inclui os 13 módulos e a área do aluno.",
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
