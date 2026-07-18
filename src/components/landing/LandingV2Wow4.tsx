import { useMemo, useState } from 'react';

/* =========================================================
   ROI CALCULATOR — interactive time-saved projection
   ========================================================= */
export function ROICalculator() {
  const [hourlyRate, setHourlyRate] = useState(80);
  const [weeklyHours, setWeeklyHours] = useState(5);

  const { weekly, monthly, yearly, payback } = useMemo(() => {
    const w = hourlyRate * weeklyHours;
    const m = w * 4;
    const y = m * 12;
    const p = 497 / (m || 1);
    return {
      weekly: w,
      monthly: m,
      yearly: y,
      payback: p < 1 ? 'menos de 1 mês' : `${Math.ceil(p)} ${Math.ceil(p) === 1 ? 'mês' : 'meses'}`,
    };
  }, [hourlyRate, weeklyHours]);

  const fmt = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

  return (
    <div className="lv2-roi">
      <div className="lv2-roi-controls">
        <div className="lv2-roi-field">
          <label>
            Seu valor por hora <b>{fmt(hourlyRate)}</b>
          </label>
          <input
            type="range"
            min={20}
            max={500}
            step={10}
            value={hourlyRate}
            onChange={(e) => setHourlyRate(Number(e.target.value))}
          />
          <div className="lv2-roi-scale"><span>R$ 20</span><span>R$ 500</span></div>
        </div>
        <div className="lv2-roi-field">
          <label>
            Horas que a IA economiza por semana <b>{weeklyHours}h</b>
          </label>
          <input
            type="range"
            min={1}
            max={20}
            step={1}
            value={weeklyHours}
            onChange={(e) => setWeeklyHours(Number(e.target.value))}
          />
          <div className="lv2-roi-scale"><span>1h</span><span>20h</span></div>
        </div>
      </div>

      <div className="lv2-roi-out">
        <div className="lv2-roi-card">
          <span>Por semana</span>
          <strong>{fmt(weekly)}</strong>
        </div>
        <div className="lv2-roi-card">
          <span>Por mês</span>
          <strong>{fmt(monthly)}</strong>
        </div>
        <div className="lv2-roi-card lv2-roi-hl">
          <span>Em 12 meses</span>
          <strong>{fmt(yearly)}</strong>
        </div>
        <div className="lv2-roi-card">
          <span>Payback do curso</span>
          <strong>{payback}</strong>
        </div>
      </div>

      <p className="lv2-roi-note">
        Estimativa baseada no seu próprio tempo e valor por hora — não é promessa de ganho.
        Execução varia. Muitos alunos relatam economizar mais que isso a partir do módulo 3.
      </p>
    </div>
  );
}

/* =========================================================
   GUARANTEE SHIELD — bold risk-reversal card
   ========================================================= */
export function GuaranteeShield({ onCta }: { onCta: () => void }) {
  return (
    <div className="lv2-guarantee">
      <div className="lv2-guarantee-badge" aria-hidden>
        <svg viewBox="0 0 120 140" width="120" height="140">
          <defs>
            <linearGradient id="lv2-gShield" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2EE8C7" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#2EE8C7" stopOpacity="0.35" />
            </linearGradient>
          </defs>
          <path
            d="M60 4 L112 22 L112 74 C112 104 90 128 60 136 C30 128 8 104 8 74 L8 22 Z"
            fill="url(#lv2-gShield)"
            stroke="#2EE8C7"
            strokeWidth="1.5"
          />
          <text x="60" y="72" textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontSize="34" fontWeight="700" fill="#08080C">7</text>
          <text x="60" y="94" textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontSize="10" fill="#08080C" letterSpacing="2">DIAS</text>
        </svg>
      </div>
      <div className="lv2-guarantee-body">
        <span className="lv2-eyebrow">Garantia incondicional</span>
        <h3>7 dias para provar. Ou devolvemos <span className="lv2-grad-text">100%</span>, sem uma única pergunta.</h3>
        <p>Entre, assista o que quiser, faça o primeiro projeto. Se em 7 dias você achar que não é para você — por qualquer motivo — um e-mail resolve. Zero burocracia, zero ligação de retenção, zero taxa.</p>
        <ul>
          <li><b>◆</b> Reembolso integral em até 5 dias úteis</li>
          <li><b>◆</b> Você fica com tudo o que baixou nesses 7 dias</li>
          <li><b>◆</b> Nenhuma justificativa exigida</li>
        </ul>
        <button className="lv2-btn" onClick={onCta}>Entrar sem risco <span className="arr">→</span></button>
      </div>
    </div>
  );
}
