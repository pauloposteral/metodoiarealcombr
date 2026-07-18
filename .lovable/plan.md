
# 15 Melhorias WOW para a Landing V2

Foco: elevar o nível editorial/premium sem quebrar a identidade Ink + Mint/Blue e sem re-adicionar bloqueadores (FAQ pesado, popups, urgency bars).

## 1. Hero cinematográfico
- **Cursor magnético + gradient spotlight** que segue o mouse na headline (efeito Linear/Vercel).
- Headline com **split-text reveal** (palavras entrando em cascata, Space Grotesk).
- Micro-badge animado "MOD-00 → MOD-12" com número girando tipo odômetro.

## 2. Terminal IA "ao vivo" no Hero
Substituir o mini-map por um **terminal typewriter** que digita prompts reais e mostra respostas simuladas (Space Mono). Loop de 3 exemplos: post, e-mail, planilha.

## 3. Trilho de módulos 3D horizontal (opcional desktop)
Além do rail vertical atual, uma faixa horizontal com **scroll-hijack suave** onde os 13 módulos passam como cartões inclinados (perspective + parallax leve).

## 4. Contador de valor entregue
Bloco "**Enquanto você lê isso**" com números incrementando em tempo real:
- Prompts salvos por alunos: `12.847 →`
- Horas economizadas nesta semana
- Uso via `requestAnimationFrame`, não fetch.

## 5. Comparador interativo "Antes/Depois IA"
Slider drag revelando dois textos lado a lado: e-mail cru vs. e-mail com Método IA Real. Instantâneo, sem vídeo.

## 6. Depoimentos em áudio (waveform)
Cards com **waveform SVG animada** e play inline. Mais raro/premium que vídeo. 3 áudios de 20s.

## 7. Prompt Playground embutido
Mini-textarea no meio da página: usuário digita algo, IA responde (via edge function `ai-sandbox` já existente, com rate-limit por IP). Prova de valor real antes de comprar.

## 8. Radar IA "vivo"
O feed atual vira **stream com timestamps relativos** ("há 2h") e um badge pulsante "AO VIVO". Adicionar rotação automática a cada 6s.

## 9. Trilhas com preview expansível
Clicar em Carreira/Empreendedor/Criador/Construtor **expande inline** mostrando: 3 aulas-âncora + resultado esperado em 30 dias. Sem sair da página.

## 10. Timeline "Sua jornada de 30 dias"
Nova seção com 4 marcos (Dia 1, 7, 14, 30) em formato de trilho horizontal com ilustração minimalista de progresso. Ancoragem psicológica de resultado.

## 11. Prova social geolocalizada (sutil)
Toast discreto canto inferior: "Alguém de **São Paulo** entrou agora" — rotativo, sem pop-up invasivo, tipografia mono, some em 4s.

## 12. Seção "Bastidores" — quem construiu
Card editorial estilo revista: foto B&W do fundador, 3 linhas de manifesto, assinatura vetorial. Constrói autoridade sem parecer bio de LinkedIn.

## 13. Oferta com stack animado
Cada item da pilha (`lv2-stack li`) entra **um-a-um com contador subindo** ao entrar no viewport. O total riscado anima até revelar R$ 497. Efeito "recibo".

## 14. Sticky mini-CTA contextual
Barra fina inferior que aparece apenas após 40% de scroll, com:
- Preço R$ 497
- Botão "Garantir vaga"
- Fecha com X, lembra sessão.
Substitui o antigo StickyMobileCTA com visual editorial (mint/blue thin border).

## 15. Cursor trail + som opcional
- Trail de partículas mint sutil no cursor (desktop only).
- Ícone speaker no canto: liga/desliga **micro-sons** (hover, click) tipo Arc/Rauno. Off por padrão.

---

## Bônus técnicos (não visíveis, mas WOW)
- **View Transitions API** entre seções âncoras.
- **Preload de fonte** com `font-display: optional` para evitar FOUT.
- **Lighthouse 95+**: lazyload de todas imagens, `prefers-reduced-motion` respeitado (já parcial).
- **OG image dinâmica** gerada no build com título + preço.

---

## Sugestão de priorização (impacto vs. esforço)

| Prioridade | Itens |
|---|---|
| ⚡ Alto impacto, baixo esforço | 1 (spotlight), 4 (contador), 8 (radar vivo), 13 (stack animado), 14 (sticky mini) |
| 🎯 Alto impacto, médio esforço | 2 (terminal), 5 (antes/depois), 9 (trilhas expansíveis), 10 (timeline 30d) |
| 💎 Wow, maior esforço | 3 (3D rail), 6 (waveform áudio), 7 (playground live), 11 (geoproof), 15 (som) |

Me diga quais quer que eu implemente — posso começar pelo pacote "Alto impacto / baixo esforço" (5 itens em uma leva) ou você escolhe à la carte.
