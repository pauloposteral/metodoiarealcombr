# Landing cinematográfica compacta — auditoria e evolução visual

## Diagnóstico confirmado

**Nota visual atual: 74/100**

- **Força:** hero cinematográfico, tipografia, contraste, vídeos e narrativa em atos já criam identidade premium.
- **Principal perda:** a página ainda mede **12.535 px no desktop e 13.728 px no mobile**, com **25 seções** e 19 títulos principais. A repetição de abertura de seção dilui a oferta.
- **Ritmo:** vários blocos recolhidos continuam ocupando uma seção completa apenas para título, texto e botão.
- **Cor:** quase toda a jornada usa o mesmo fundo escuro com verde/azul; os capítulos mudam a imagem, mas não separam visualmente cada fase da história.
- **Scroll:** já há progresso superior e revelações, porém a navegação não comunica claramente em qual ato o visitante está.
- **Mobile:** não existe rolagem horizontal e o hero está correto, mas a página continua longa e alguns blocos empilham espaço demais.

## Objetivo

Levar a experiência para **100/100 visual**, reduzindo a rolagem em cerca de **25% a 35%**, sem excluir conteúdo, sem adicionar novos CTAs e sem transformar a página em um parque de efeitos.

## Implementação

### 1. Compactação editorial por atos

- Reagrupar as 25 seções visuais em **6 capítulos narrativos**, preservando internamente todo o conteúdo existente.
- Unir blocos complementares no mesmo fluxo:
  - ferramentas + demonstração + contadores;
  - problema + solução + antes/depois;
  - mapa + trilhas + comparativo;
  - quiz + playground + prova;
  - ROI + números + jornada;
  - mentor + oferta + garantia + manifesto + dúvidas.
- Remover alturas artificiais entre blocos recolhidos e reduzir cabeçalhos repetidos.
- Manter detalhes extensos em expansões acessíveis, com uma prévia visual útil antes do clique.
- Meta de altura: **até 9.500 px desktop** e **até 10.500 px mobile**, sem ocultar informação essencial.

### 2. Sistema cromático cinematográfico

Criar tons semânticos por capítulo, mantendo o fundo premium e o verde/azul da marca:

- **Descoberta:** verde mineral + azul elétrico.
- **Ruído/problema:** coral controlado + vermelho sinal.
- **Mapa/método:** ciano + azul claro.
- **Inteligência viva:** verde-limão discreto + turquesa.
- **Execução:** âmbar + dourado técnico.
- **Horizonte/oferta:** azul celeste + magenta frio pontual.

As cores aparecerão em linhas, etiquetas, bordas, números, luz ambiente e fundos sutis — nunca em grandes blocos saturados. Tudo será tokenizado no CSS da landing para consistência e contraste.

### 3. Parallax com profundidade real

- Aplicar parallax progressivo apenas no hero e nos cinco capítulos de vídeo.
- Separar poster/vídeo, grade, luz e texto em velocidades diferentes para criar profundidade.
- Adicionar leve escala cinematográfica e deslocamento vertical conforme a seção atravessa a tela.
- Manter vídeos pausados fora da área visível e sem download antecipado.
- Desligar parallax em `prefers-reduced-motion`, economia de dados e dispositivos onde o efeito prejudique fluidez.

### 4. Scroll inteligente, sem poluição

- Transformar a barra superior existente em progresso por **capítulos**, sem criar novo elemento flutuante.
- Destacar automaticamente no menu o capítulo atual.
- Fazer links do menu chegarem ao início correto de cada ato, compensando o cabeçalho fixo.
- Usar revelações direcionais coerentes: texto entra do lado da leitura; mídia ganha profundidade; números sobem suavemente.
- Preservar posição ao abrir/recolher blocos para evitar “saltos” de tela.
- Manter o botão voltar ao topo como único controle flutuante.

### 5. Hero renovado e conectado à jornada

- Refinar enquadramento do vídeo, contraste e hierarquia sem alterar a mensagem ou o checkout.
- Compactar a régua MOD-00 → MOD-12 em uma assinatura visual mais leve no mobile.
- Fazer a saída do hero se conectar visualmente ao primeiro capítulo, evitando a sensação de corte entre blocos.
- Manter apenas um CTA no hero e um CTA principal na oferta.

### 6. Acabamento responsivo

- Desktop: alternância de composição e maior profundidade lateral.
- Mobile: parallax reduzido, textos mais curtos por linha, capítulos mais baixos e expansões com área de toque confortável.
- Garantir ausência de sobreposição, texto cortado, salto de layout e rolagem horizontal.
- Preservar contraste AA e navegação por teclado.

## Validação

- Comparar altura antes/depois em desktop e mobile.
- Testar abertura de todos os blocos, módulos, trilhas, quiz, playground, checkout e links do menu.
- Validar movimento reduzido e conexão restrita usando capas estáticas.
- Testar boot em sessão anônima/incógnita.
- Confirmar build limpo, zero erros de página e zero rolagem horizontal.
- Entregar o DIFF completo das mudanças executadas.

## Limites

- Nenhum conteúdo funcional será apagado.
- Nenhum novo CTA, popup, contador flutuante ou aviso intrusivo será criado.
- Checkout, preço e regras comerciais não serão alterados.
