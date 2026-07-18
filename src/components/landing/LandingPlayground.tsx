import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const PRESETS = [
  {
    id: 'email',
    label: 'E-mail executivo',
    hint: 'Ex: pedir prorrogação de prazo ao cliente sem soar fraco',
    icon: '✉',
  },
  {
    id: 'post',
    label: 'Post de LinkedIn',
    hint: 'Ex: minha experiência montando um GPT pra atender clientes',
    icon: '◆',
  },
  {
    id: 'planilha',
    label: 'Fórmula de planilha',
    hint: 'Ex: somar vendas do mês só das linhas em que status = "pago"',
    icon: '∑',
  },
] as const;

export function LandingPlayground() {
  const [preset, setPreset] = useState<(typeof PRESETS)[number]['id']>('email');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [typed, setTyped] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const typeRef = useRef<number | null>(null);

  const current = PRESETS.find((p) => p.id === preset)!;

  const run = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setError(null);
    setOutput('');
    setTyped('');
    try {
      const { data, error: fnErr } = await supabase.functions.invoke('landing-playground', {
        body: { preset, input: input.trim() },
      });
      if (fnErr) throw new Error(fnErr.message);
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      const text = (data as { text: string }).text || '';
      setOutput(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao gerar');
    } finally {
      setLoading(false);
    }
  };

  // Type-writer effect for the response
  useEffect(() => {
    if (!output) return;
    setTyped('');
    let i = 0;
    if (typeRef.current) window.clearInterval(typeRef.current);
    typeRef.current = window.setInterval(() => {
      i += 3;
      setTyped(output.slice(0, i));
      if (i >= output.length && typeRef.current) {
        window.clearInterval(typeRef.current);
        typeRef.current = null;
      }
    }, 14);
    return () => {
      if (typeRef.current) window.clearInterval(typeRef.current);
    };
  }, [output]);

  return (
    <div className="lv2-play rv">
      <div className="lv2-play-head">
        <span className="lv2-live-badge"><em /> DEMO AO VIVO</span>
        <span className="lv2-play-note">Roda de verdade. Gemini 2.5 · sem cadastro.</span>
      </div>

      <div className="lv2-play-tabs">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            className={`lv2-play-tab ${preset === p.id ? 'on' : ''}`}
            onClick={() => { setPreset(p.id); setOutput(''); setTyped(''); setError(null); }}
          >
            <span className="lv2-play-tab-i">{p.icon}</span>
            {p.label}
          </button>
        ))}
      </div>

      <div className="lv2-play-input">
        <label>{current.label} — descreva em uma frase:</label>
        <div className="lv2-play-row">
          <input
            type="text"
            value={input}
            maxLength={180}
            placeholder={current.hint}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && run()}
          />
          <button className="lv2-play-run" onClick={run} disabled={loading || !input.trim()}>
            {loading ? '...' : 'Gerar →'}
          </button>
        </div>
      </div>

      <div className="lv2-play-out">
        <div className="lv2-play-out-bar">
          <i /><i /><i />
          <span>resposta.md</span>
          {loading && <span className="lv2-play-loading">gerando<em>.</em><em>.</em><em>.</em></span>}
        </div>
        <div className="lv2-play-out-body">
          {error && <p className="lv2-play-err">⚠ {error}</p>}
          {!error && !typed && !loading && (
            <p className="lv2-play-empty">Escolha um preset, escreva sua frase e veja a IA responder ao vivo.</p>
          )}
          {typed && (
            <pre>{typed}<em className="lv2-caret">▍</em></pre>
          )}
        </div>
      </div>

      <p className="lv2-play-foot">
        Isto é 1% do que você aprende no <b>MOD-02</b>. No curso você monta prompts assim — para você — em minutos.
      </p>
    </div>
  );
}
