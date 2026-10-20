import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import guides from '@/data/publicGuideIndex.json';

const ORIGIN = 'https://metodoiareal.com.br';
const PUBLIC_PAGES: Record<string, { title: string; description: string }> = {
  '/': { title: 'Método IA Real — Curso de inteligência artificial na prática', description: 'Aprenda IA com 13 módulos, 124 aulas e 13 projetos. Escolha sua trilha, pratique com exercícios e construa seu portfólio. Conheça os guias gratuitos.' },
  '/completo': { title: 'Programa completo do curso | Método IA Real', description: 'Conheça os módulos e trilhas da formação Método IA Real: fundamentos, prompts, ChatGPT, Claude, Gemini, imagem, vídeo, aplicativos e automações.' },
  '/pricing': { title: 'Planos e recursos | Método IA Real', description: 'Compare os recursos e as condições de acesso disponíveis na plataforma Método IA Real.' },
  '/metodo': { title: 'IA para empresas e equipes | Método IA Real', description: 'Conheça a proposta de treinamento e ferramentas de inteligência artificial para empresas e equipes.' },
  '/metodo/pricing': { title: 'Planos para empresas | Método IA Real', description: 'Conheça as opções de treinamento e ferramentas de IA para sua equipe, com condições e recursos de cada plano.' },
  '/aprender': { title: 'Guias gratuitos de inteligência artificial | Método IA Real', description: '13 guias práticos com modelos e checklists gratuitos para começar com IA, escrever prompts, conferir respostas e planejar projetos.' },
};

/** This controls discoverability, not authorization. Paid content remains protected by RLS. */
export function RouteSEO() {
  const { pathname } = useLocation();
  const path = pathname.replace(/\/+$/, '') || '/';
  const canonicalPath = path === '/curso' ? '/completo' : path;
  const guide = guides.find(item => path === `/aprender/${item.slug}`);
  const meta = guide ? { title: `${guide.title} | Método IA Real`, description: guide.description } : PUBLIC_PAGES[canonicalPath];
  const indexable = Boolean(meta);
  const canonical = `${ORIGIN}${canonicalPath}`;
  return <Helmet>
    <title>{meta?.title ?? 'Área de acesso | Método IA Real'}</title>
    <meta name="description" content={meta?.description ?? 'Entre com sua conta para acessar a plataforma Método IA Real.'} />
    <meta name="robots" content={indexable ? 'index,follow,max-image-preview:large' : 'noindex,nofollow'} />
    <link rel="canonical" href={canonical} />
    <meta property="og:url" content={canonical} />
    <meta property="og:title" content={meta?.title ?? 'Método IA Real'} />
    <meta property="og:description" content={meta?.description ?? 'Plataforma de aprendizagem em inteligência artificial.'} />
    <meta property="og:image" content={`${ORIGIN}/og-image.jpg`} />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="pt_BR" />
    <meta property="og:site_name" content="Método IA Real" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={meta?.title ?? 'Método IA Real'} />
    <meta name="twitter:description" content={meta?.description ?? 'Plataforma de aprendizagem em inteligência artificial.'} />
    <meta name="twitter:image" content={`${ORIGIN}/og-image.jpg`} />
  </Helmet>;
}
