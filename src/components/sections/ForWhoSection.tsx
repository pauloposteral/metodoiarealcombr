import { ScrollReveal } from '@/components/ScrollReveal';

const audiences = [
  { emoji: '🚀', title: 'Empreendedores', desc: 'Que querem automatizar e escalar seus negócios com IA.' },
  { emoji: '💼', title: 'Profissionais', desc: 'Que precisam se manter relevantes no mercado de trabalho.' },
  { emoji: '🎓', title: 'Estudantes', desc: 'Que querem se preparar para o futuro da tecnologia.' },
  { emoji: '📚', title: 'Professores', desc: 'Que desejam integrar IA na sala de aula e no dia a dia.' },
  { emoji: '🎨', title: 'Criadores de conteúdo', desc: 'Que querem produzir mais e melhor com ajuda da IA.' },
  { emoji: '🔍', title: 'Curiosos', desc: 'Que sabem que IA é o futuro e querem aprender de verdade.' },
];

export const ForWhoSection = () => {
  return (
    <section className="bg-[#08080C] py-[clamp(80px,10vw,120px)]">
      <div className="max-w-[1200px] mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-semibold tracking-[0.15em] uppercase text-[#FBBF24] mb-4">PARA QUEM É</span>
            <h2 className="font-landing font-bold text-white leading-[1.12] tracking-[-0.03em]" style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}>
              Se você quer usar IA de verdade, esse curso é pra você.
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {audiences.map((a, i) => (
            <ScrollReveal key={i} delay={i * 60}>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-colors hover:border-[#6EE7B7]/30">
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{a.emoji}</span>
                  <div>
                    <h3 className="font-landing font-bold text-white text-base mb-1">{a.title}</h3>
                    <p className="text-white/55 text-sm leading-relaxed">{a.desc}</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
