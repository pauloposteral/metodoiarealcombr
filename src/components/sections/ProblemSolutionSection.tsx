import { ScrollReveal } from '@/components/ScrollReveal';

const painPoints = [
  { emoji: '😵‍💫', text: 'Tutoriais soltos que não levam a nada' },
  { emoji: '🤯', text: 'Tecnicismos que mais confundem do que ensinam' },
  { emoji: '⏰', text: 'Horas perdidas tentando fazer a IA funcionar' },
  { emoji: '😤', text: 'Resultados genéricos que ninguém quer usar' },
];

const steps = [
  { num: '01', title: 'Assista', desc: 'Aulas curtas e diretas. Sem enrolação, sem slides infinitos.', color: '#6EE7B7' },
  { num: '02', title: 'Pratique', desc: 'Cada aula tem exercício prático. Sandbox com IA real.', color: '#3B82F6' },
  { num: '03', title: 'Aplique', desc: 'Projetos reais do início ao fim. Resultado concreto.', color: '#A78BFA' },
];

export const ProblemSolutionSection = () => {
  return (
    <section className="bg-[#08080C] py-[clamp(80px,10vw,120px)]">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* PROBLEM */}
        <div className="mb-20">
          <ScrollReveal>
            <span className="inline-block text-xs font-semibold tracking-[0.15em] uppercase text-[#F87171] mb-4">O PROBLEMA</span>
            <h2 className="font-landing font-bold text-white leading-[1.12] tracking-[-0.03em] mb-10" style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}>
              Você sabe que IA é importante.<br className="hidden sm:block" /> Mas não sabe por onde começar.
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {painPoints.map((p, i) => (
              <ScrollReveal key={i} delay={i * 60}>
                <div className="flex items-center gap-4 p-5 rounded-xl border border-[#F87171]/10 bg-[#F87171]/[0.03] transition-colors">
                  <span className="text-2xl flex-shrink-0">{p.emoji}</span>
                  <span className="text-white/80 text-sm sm:text-base">{p.text}</span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* SOLUTION */}
        <div>
          <ScrollReveal>
            <span className="inline-block text-xs font-semibold tracking-[0.15em] uppercase text-[#6EE7B7] mb-4">A SOLUÇÃO</span>
            <h2 className="font-landing font-bold text-white leading-[1.12] tracking-[-0.03em] mb-3" style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}>
              Um método claro, prático e testado por milhares.
            </h2>
            <p className="text-white/55 mb-10 max-w-lg" style={{ fontSize: 'clamp(16px, 2vw, 18px)' }}>
              Sem enrolação. Você assiste, aplica e vê resultado.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {steps.map((s, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <div className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 transition-colors hover:border-white/[0.12]">
                  <span className="absolute -top-4 -right-2 font-landing font-bold text-[80px] leading-none opacity-[0.04]" style={{ color: s.color }}>
                    {s.num}
                  </span>
                  <div className="relative z-10">
                    <h3 className="font-landing font-bold text-lg mb-2" style={{ color: s.color }}>{s.title}</h3>
                    <p className="text-white/55 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
