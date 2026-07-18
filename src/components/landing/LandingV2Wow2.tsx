import { useEffect, useRef, useState } from 'react';

/* ============ 1. Live Terminal — types prompts/responses ============ */
const TERMINAL_STEPS: Array<{ who: 'you' | 'ia'; text: string }> = [
  { who: 'you', text: 'Reescreva este e-mail em tom executivo, direto, 5 linhas.' },
  { who: 'ia', text: 'Prezado(a), avanço no projeto: entregamos a fase 1 no prazo, com 3 riscos mitigados. Próximo marco: 12/ago. Pediria confirmação da reunião de review na quinta. Anexo, o resumo em 1 página.' },
  { who: 'you', text: 'Agora liste 3 argumentos para pedir aumento com base em resultados.' },
  { who: 'ia', text: '1) Entreguei 4 projetos acima da meta em 6 meses.\n2) Reduzi o tempo de onboarding em 38% (dado do RH).\n3) Assumi 2 responsabilidades novas sem aumento — mercado paga +18% para o mesmo escopo.' },
];

export function LiveTerminal() {
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    const full = TERMINAL_STEPS[step].text;
    setTyped('');
    setDone(false);
    let i = 0;
    const speed = TERMINAL_STEPS[step].who === 'you' ? 22 : 12;
    const id = setInterval(() => {
      i++;
      setTyped(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(id);
        setDone(true);
        setTimeout(() => setStep((s) => (s + 1) % TERMINAL_STEPS.length), 1600);
      }
    }, speed);
    return () => clearInterval(id);
  }, [step]);

  return (
    <div className="lv2-terminal rv">
      <div className="lv2-terminal-bar">
        <i /><i /><i />
        <span>método-ia-real — prompt-lab.sh</span>
      </div>
      <div className="lv2-terminal-body">
        {TERMINAL_STEPS.slice(0, step).map((s, i) => (
          <div key={i} className={`lv2-term-line ${s.who}`}>
            <span className="lv2-term-pfx">{s.who === 'you' ? '▸ você' : '◆ ia'}</span>
            <span>{s.text}</span>
          </div>
        ))}
        <div className={`lv2-term-line ${TERMINAL_STEPS[step].who} active`}>
          <span className="lv2-term-pfx">{TERMINAL_STEPS[step].who === 'you' ? '▸ você' : '◆ ia'}</span>
          <span>{typed}<em className={`lv2-caret ${done ? 'done' : ''}`}>▍</em></span>
        </div>
      </div>
    </div>
  );
}

/* ============ 2. Before / After AI slider ============ */
export function BeforeAfterSlider() {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef(false);

  const move = (clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const p = ((clientX - r.left) / r.width) * 100;
    setPos(Math.max(4, Math.min(96, p)));
  };

  useEffect(() => {
    const up = () => (drag.current = false);
    const mm = (e: MouseEvent) => drag.current && move(e.clientX);
    const tm = (e: TouchEvent) => drag.current && move(e.touches[0].clientX);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchend', up);
    window.addEventListener('mousemove', mm);
    window.addEventListener('touchmove', tm);
    return () => {
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchend', up);
      window.removeEventListener('mousemove', mm);
      window.removeEventListener('touchmove', tm);
    };
  }, []);

  return (
    <div
      className="lv2-ba rv"
      ref={ref}
      onMouseDown={(e) => { drag.current = true; move(e.clientX); }}
      onTouchStart={(e) => { drag.current = true; move(e.touches[0].clientX); }}
    >
      <div className="lv2-ba-side lv2-ba-before">
        <span className="lv2-ba-tag">✕ Sem método</span>
        <h4>"Faz um post sobre IA"</h4>
        <p>"Descubra como a Inteligência Artificial está revolucionando o mundo! 🚀 A IA veio para ficar e vai mudar tudo. Não perca essa oportunidade incrível! #IA #inovação #futuro"</p>
        <small>Genérico. Emojis vazios. Zero autoridade.</small>
      </div>
      <div className="lv2-ba-side lv2-ba-after" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
        <span className="lv2-ba-tag on">◆ Com Método IA Real</span>
        <h4>Prompt estruturado + sua voz</h4>
        <p>"Passei 6h testando 4 IAs no mesmo briefing de campanha. Uma delas entregou em 12 minutos o que meu freela cobrava R$ 800. Não é sobre substituir criativo — é sobre parar de perder tempo em tarefa de robô."</p>
        <small>Específico. Números. Ponto de vista. Vende sem parecer.</small>
      </div>
      <div className="lv2-ba-handle" style={{ left: `${pos}%` }}>
        <span>‹ ›</span>
      </div>
    </div>
  );
}

/* ============ 3. Journey Timeline — 30 dias ============ */
export const JOURNEY = [
  { day: 'Dia 1', title: 'Setup + trilha definida', body: 'Quiz de 2 min, contas em todas as IAs, primeira comparação lado a lado.' },
  { day: 'Dia 7', title: 'Primeiros 10 prompts que salvam sua semana', body: 'Você já economiza 4–6h/semana com a biblioteca aplicada ao seu trabalho.' },
  { day: 'Dia 15', title: 'Um GPT/Project personalizado no ar', body: 'Sua função tem um assistente próprio — treinado com seus documentos.' },
  { day: 'Dia 22', title: 'Primeiro projeto publicado', body: 'App no Lovable, vídeo com IA ou automação n8n rodando de verdade.' },
  { day: 'Dia 30', title: 'Portfólio + plano de monetização', body: 'Você termina com 3 projetos publicáveis e um plano concreto para os próximos 60 dias.' },
];

export function JourneyTimeline() {
  return (
    <div className="lv2-journey">
      <div className="lv2-journey-rail" />
      {JOURNEY.map((j, i) => (
        <div key={j.day} className="lv2-journey-step rv" style={{ transitionDelay: `${i * 100}ms` }}>
          <div className="lv2-journey-dot"><span>{i + 1}</span></div>
          <div className="lv2-journey-card">
            <span className="lv2-journey-day">{j.day}</span>
            <h3>{j.title}</h3>
            <p>{j.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
