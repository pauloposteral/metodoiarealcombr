import { useState } from 'react';

/* ============================================================
 * PACOTE WOW #6 — Explorador de ferramentas + Ficha do mentor
 * ============================================================ */

/* 1) TOOLS EXPLORER — grade interativa: cada ferramenta abre "pra quê serve" */
type Tool = {
  name: string;
  category: 'Texto' | 'Imagem' | 'Vídeo' | 'Voz' | 'Código' | 'Automação';
  role: string;       // pra que serve, em 1 linha
  best: string;       // quando escolher ela
  module: string;     // onde aparece no curso
  glyph: string;      // marca gráfica curta
};

const TOOLS: Tool[] = [
  { name: 'ChatGPT',     category: 'Texto',     role: 'Assistente geral com memória, Projects e GPTs personalizados.', best: 'Quando você quer um copiloto do dia a dia com voz, imagem e busca.', module: 'MOD-03', glyph: '◐' },
  { name: 'Claude',      category: 'Texto',     role: 'Redação longa e análise densa de documentos com Artifacts.',    best: 'Quando o texto precisa parecer humano e o PDF tem 200 páginas.',   module: 'MOD-04', glyph: '◑' },
  { name: 'Gemini',      category: 'Texto',     role: 'IA dentro do Gmail, Docs, Sheets e do NotebookLM.',              best: 'Quando você vive no ecossistema Google e quer IA embutida.',       module: 'MOD-05', glyph: '◒' },
  { name: 'Perplexity',  category: 'Texto',     role: 'Busca com fontes — pesquisa, não alucinação.',                   best: 'Quando o assunto muda toda semana e você precisa de fonte real.',  module: 'MOD-01', glyph: '◓' },
  { name: 'Midjourney',  category: 'Imagem',    role: 'Imagem cinematográfica com direção de arte fina.',               best: 'Quando o brief pede estilo, luz e coerência visual — não meme.',   module: 'MOD-06', glyph: '◈' },
  { name: 'Nano Banana', category: 'Imagem',    role: 'Edição por instrução dentro do Gemini.',                         best: 'Quando você já tem a foto e só quer trocar/ajustar por texto.',    module: 'MOD-06', glyph: '◇' },
  { name: 'Veo',         category: 'Vídeo',     role: 'Vídeo generativo com movimento de câmera realista.',             best: 'Quando o anúncio pede B-roll cinematográfico sem set de filmagem.', module: 'MOD-07', glyph: '▶' },
  { name: 'Runway',      category: 'Vídeo',     role: 'Edição, remoção de fundo e vídeo generativo profissional.',       best: 'Quando o pipeline é edição real e não só um clipe curto.',         module: 'MOD-07', glyph: '▷' },
  { name: 'HeyGen',      category: 'Vídeo',     role: 'Avatar digital que fala com sua voz clonada.',                    best: 'Quando você precisa gravar 30 vídeos e não pode aparecer em todos.', module: 'MOD-07', glyph: '◉' },
  { name: 'ElevenLabs',  category: 'Voz',       role: 'Voz clonada e narração em qualidade de estúdio.',                 best: 'Quando o áudio é a marca — podcast, curso, livro.',                module: 'MOD-07', glyph: '≋' },
  { name: 'Suno',        category: 'Voz',       role: 'Música gerada por prompt, com letra e mixagem.',                  best: 'Quando o vídeo precisa de trilha original sem pagar direitos.',    module: 'MOD-07', glyph: '♪' },
  { name: 'Lovable',     category: 'Código',    role: 'App no ar em 30 minutos, do prompt à publicação.',                best: 'Quando você tem uma ideia e não sabe programar — nem quer aprender.', module: 'MOD-08', glyph: '◆' },
  { name: 'Supabase',    category: 'Código',    role: 'Banco de dados e login sem servidor para os apps do Lovable.',   best: 'Quando o app precisa lembrar do usuário na próxima visita.',       module: 'MOD-08', glyph: '◇' },
  { name: 'n8n',         category: 'Automação', role: 'Automação visual — a "cola" entre IA, WhatsApp e planilhas.',    best: 'Quando a mesma tarefa se repete toda semana.',                     module: 'MOD-09', glyph: '⌘' },
  { name: 'Make',        category: 'Automação', role: 'Automação em nuvem com milhares de integrações prontas.',        best: 'Quando você prefere clicar do que hospedar servidor.',             module: 'MOD-09', glyph: '⌥' },
  { name: 'NotebookLM',  category: 'Texto',     role: 'Cérebro de estudos: PDFs viram resumo em áudio.',                best: 'Quando você quer ouvir o que leu, no trânsito, virando podcast.', module: 'MOD-05', glyph: '◔' },
];

const CATS: Array<Tool['category'] | 'Todas'> = ['Todas', 'Texto', 'Imagem', 'Vídeo', 'Voz', 'Código', 'Automação'];

export function ToolsExplorer() {
  const [cat, setCat] = useState<Tool['category'] | 'Todas'>('Todas');
  const [active, setActive] = useState<Tool>(TOOLS[0]);

  const filtered = cat === 'Todas' ? TOOLS : TOOLS.filter(t => t.category === cat);

  return (
    <div className="lv2-tools">
      <div className="lv2-tools-tabs" role="tablist">
        {CATS.map(c => (
          <button
            key={c}
            role="tab"
            aria-selected={cat === c}
            className={`lv2-tools-tab ${cat === c ? 'is-active' : ''}`}
            onClick={() => setCat(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="lv2-tools-body">
        <div className="lv2-tools-grid">
          {filtered.map(t => (
            <button
              key={t.name}
              className={`lv2-tool-chip ${active.name === t.name ? 'is-active' : ''}`}
              onMouseEnter={() => setActive(t)}
              onFocus={() => setActive(t)}
              onClick={() => setActive(t)}
            >
              <span className="lv2-tool-glyph">{t.glyph}</span>
              <span className="lv2-tool-name">{t.name}</span>
              <span className="lv2-tool-mod">{t.module}</span>
            </button>
          ))}
        </div>

        <aside className="lv2-tools-detail" aria-live="polite">
          <div className="lv2-tools-detail-head">
            <span className="lv2-tools-detail-glyph">{active.glyph}</span>
            <div>
              <div className="lv2-tools-detail-cat">{active.category}</div>
              <h3>{active.name}</h3>
            </div>
          </div>
          <p className="lv2-tools-detail-role">{active.role}</p>
          <div className="lv2-tools-detail-row">
            <b>Quando escolher</b>
            <span>{active.best}</span>
          </div>
          <div className="lv2-tools-detail-row">
            <b>No curso</b>
            <span>{active.module} · aula prática de ponta a ponta</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* 2) INSTRUCTOR CARD — âncora de confiança antes da oferta */
export function InstructorCard() {
  return (
    <div className="lv2-mentor">
      <div className="lv2-mentor-photo" aria-hidden>
        <div className="lv2-mentor-photo-inner">
          <span>MR</span>
        </div>
        <div className="lv2-mentor-photo-ring" />
      </div>
      <div className="lv2-mentor-body">
        <span className="lv2-eyebrow">Quem assina o método</span>
        <h3>Uma equipe que <em>usa</em> IA todo dia — e ensina só o que já provou funcionar.</h3>
        <p>
          O Método IA Real é mantido por uma equipe pequena de engenheiros, designers e criadores
          que rodam IA em produção há mais de três anos. Cada aula é escrita por quem já entregou
          o resultado dela — não por gente que só leu sobre.
        </p>
        <ul className="lv2-mentor-points">
          <li><b>+ de 2.800 alunos</b> executando trilha real</li>
          <li><b>13 módulos</b> revisados a cada Radar mensal</li>
          <li><b>Resposta em até 24h</b> úteis, com monitores humanos</li>
          <li><b>Zero promessa</b> de riqueza — sim promessa de execução</li>
        </ul>
      </div>
    </div>
  );
}
