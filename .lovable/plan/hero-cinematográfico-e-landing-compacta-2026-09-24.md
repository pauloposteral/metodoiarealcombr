# Hero cinematográfico e landing compacta

## Resultado
Transformar o topo em uma experiência cinematográfica de futuro tecnológico, com vídeo elegante em loop, texto sempre legível e carregamento leve. Reorganizar o ritmo vertical para reduzir a rolagem e tornar todas as seções mais claras e responsivas.

## Implementação

1. **Produzir o vídeo do topo com IA**
   - Gerar uma cena de aproximadamente 8 segundos, sem texto incorporado, em estética cinematográfica premium: arquitetura futurista, fluxos de dados e inteligência em movimento.
   - Movimento de câmera lento, composição escura e áreas de respiro adequadas para o título e botão existentes.
   - Validar duração, dimensões e presença de áudio; o uso no site será silencioso.

2. **Integrar o vídeo de forma leve e segura**
   - Usar o vídeo como fundo do topo, em loop, silencioso e sem controles, preservando título, texto, preço e botão atuais.
   - Criar imagem de capa otimizada para aparecer imediatamente antes do vídeo carregar.
   - Carregar o vídeo apenas quando adequado e aplicar alternativa estática em economia de dados, movimento reduzido ou falha de reprodução.
   - Manter contraste forte com tratamento visual sobre o vídeo, sem prejudicar a leitura.

3. **Compactar a página sem remover conteúdo funcional**
   - Reduzir os grandes intervalos verticais e substituir espaçamentos pontuais por regras responsivas consistentes.
   - Aproximar blocos relacionados e equilibrar títulos, demonstrações, comparativos, oferta e garantia.
   - Preservar todas as ferramentas, botões, checkout, módulos, quiz e demais funções existentes.

4. **Garantir visibilidade durante toda a rolagem**
   - Tornar as revelações progressivas resilientes: o conteúdo não poderá permanecer invisível se a pessoa rolar rápido ou se o observador não iniciar.
   - Ajustar pontos de entrada e distância das animações para mobile, mantendo movimento sutil no desktop.
   - Respeitar a preferência de movimento reduzido.

5. **Responsividade e hierarquia visual**
   - Reenquadrar o vídeo separadamente para celular e desktop.
   - Ajustar topo, título, botão, mapa inicial, cards, tabelas, trilhas e blocos fixos para evitar cortes e sobreposições.
   - Manter a identidade escura premium e a paleta atual, eliminando efeitos decorativos que concorram com o novo vídeo.

6. **Validação final**
   - Verificar carregamento, reprodução, legibilidade e rolagem em celular e desktop.
   - Testar o início da página em sessão anônima, com movimento reduzido e com o vídeo indisponível.
   - Confirmar que o checkout e os atalhos de navegação continuam funcionando e que não há erros visuais ou de execução.

## Detalhes técnicos
- O vídeo será armazenado no próprio projeto, sem dependência de reprodução externa.
- Serão usados formatos e compressão voltados à web, com capa estática para melhorar a primeira exibição.
- As alterações ficarão concentradas na landing atual e em um pequeno componente próprio para o fundo cinematográfico.
