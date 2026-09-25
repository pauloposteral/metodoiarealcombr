# Landing mais curta, concreta e atraente

## Objetivo
Eliminar os vazios visuais mostrados no celular e substituir a linguagem genérica sobre IA por uma narrativa direta, específica e orientada a resultados, sem remover recursos nem adicionar novos CTAs.

## Ajustes propostos

1. **Corrigir o vazio dos blocos expansíveis**
   - Garantir que conteúdos carregados ao abrir “playground”, demonstrações, trilhas e demais expansões fiquem visíveis imediatamente.
   - Corrigir o fechamento desses blocos para reposicionar a página no ponto certo, sem salto nem área preta residual.
   - Manter todos os 15 conteúdos expansíveis e seus estados atuais.

2. **Retirar espaços excessivos no celular**
   - Fazer o topo acompanhar a altura real do conteúdo, em vez de ocupar uma tela inteira quando não precisa.
   - Reduzir margens fixas grandes entre títulos, botões, mapa, capítulos e blocos recolhidos.
   - Aproximar o letreiro de ferramentas do topo e unir seções relacionadas em uma sequência visual contínua.
   - Preservar respiro, legibilidade e o efeito cinematográfico no computador.

3. **Trocar linguagem genérica por benefícios concretos**
   - Renovar o topo para dizer claramente o que a pessoa aprenderá e produzirá.
   - Substituir frases abstratas como “o curso mais organizado” e “o futuro vira território” por entregas verificáveis: escrever melhor, criar imagens e vídeos, automatizar tarefas e publicar um app.
   - Reescrever títulos e introduções dos seis atos para formar uma história prática: confusão → escolha → execução → portfólio.
   - Manter intactos números, preço, garantia, duração, ferramentas e demais afirmações factuais.

4. **Deixar a leitura mais atraente**
   - Dar mais contraste às palavras de resultado, com frases menores e escaneáveis.
   - Usar exemplos cotidianos em vez de termos como “engenharia”, “ecossistema” ou “inteligência viva” sem contexto.
   - Manter apenas o CTA do topo e o CTA da oferta, conforme a direção minimalista já aprovada.

## Direção de texto do topo

- **Título:** “Aprenda IA fazendo: escreva, crie, automatize e publique.”
- **Apoio:** “São 13 módulos práticos, do primeiro prompt ao seu próprio app. Cada etapa termina em uma entrega que você pode usar no trabalho ou colocar no portfólio.”
- **Botão:** “Quero aprender na prática”

## Validação

- Testar abertura e fechamento de todos os blocos no celular.
- Confirmar ausência de áreas vazias, saltos e rolagem horizontal.
- Comparar a altura total antes e depois em celular e computador.
- Validar o topo, os capítulos, o checkout e o modo de movimento reduzido.
- Confirmar inicialização limpa em janela anônima e zero erros na página.

## Detalhes técnicos

A área vazia foi localizada no comportamento dos conteúdos inseridos após o carregamento: eles recebem o estado visual oculto, mas não entram no observador inicial de revelação. A correção será feita no componente expansível para cobrir todos os casos, em vez de mascarar apenas o playground. A compactação será responsiva e restrita aos espaçamentos; nenhuma função ou seção será apagada.
