export type MemberDestination = 'home' | 'learn' | 'lab' | 'create' | 'profile';
export interface MemberNavigationGroup { id: MemberDestination; title: string; url: string; items: readonly { title: string; url: string }[] }
export const MEMBER_NAVIGATION: readonly MemberNavigationGroup[] = [
  { id: 'home', title: 'Início', url: '/membros', items: [] },
  { id: 'learn', title: 'Aprender', url: '/membros/cursos', items: [
    { title: 'Módulos', url: '/membros/modulos' }, { title: 'Minha trilha', url: '/membros/trilha' },
    { title: 'Prompts', url: '/membros/prompts' }, { title: 'Materiais', url: '/membros/materiais' },
    { title: 'Glossário', url: '/membros/glossario' }, { title: 'Ferramentas e custos', url: '/membros/ferramentas' },
    { title: 'Bônus', url: '/membros/bonus' },
  ] },
  { id: 'lab', title: 'Laboratório', url: '/membros/laboratorio', items: [] },
  { id: 'create', title: 'Criar', url: '/membros/pratica-reels', items: [
    { title: 'Carrosséis', url: '/carrossel' }, { title: 'Stories', url: '/stories' },
  ] },
  { id: 'profile', title: 'Perfil', url: '/membros/perfil', items: [
    { title: 'Meu progresso', url: '/membros/analytics' }, { title: 'Certificado', url: '/membros/certificado' },
    { title: 'Salvos', url: '/membros/salvos' }, { title: 'Comunidade', url: '/membros/comunidade' },
    { title: 'Ranking', url: '/membros/ranking' }, { title: 'Atualizações', url: '/membros/atualizacoes' },
    { title: 'Suporte', url: '/membros/suporte' },
  ] },
];
export function memberNavigationGroup(pathname: string): MemberDestination | null {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/membros') return 'home';
  if (path.startsWith('/membros/aula/')) return 'learn';
  for (const group of MEMBER_NAVIGATION) {
    for (const item of [group, ...group.items]) {
      if (item.url === '/membros') continue;
      if (path === item.url || path.startsWith(item.url + '/')) return group.id;
    }
  }
  return null;
}
