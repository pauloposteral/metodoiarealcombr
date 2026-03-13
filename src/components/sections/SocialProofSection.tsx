import { ScrollReveal } from '@/components/ScrollReveal';

const testimonials = [
  {
    text: 'Finalmente entendi como usar IA no meu negócio. O método é claro e direto.',
    name: 'Camila R.',
    role: 'Empreendedora',
    initials: 'CR',
    gradient: 'from-[#6EE7B7] to-[#3B82F6]',
  },
  {
    text: 'Em 2 semanas já estava aplicando tudo no trabalho. Valeu cada centavo.',
    name: 'Rafael M.',
    role: 'Gerente de Marketing',
    initials: 'RM',
    gradient: 'from-[#3B82F6] to-[#A78BFA]',
  },
  {
    text: 'Achei que IA era complicado. O curso provou que eu estava errada.',
    name: 'Ana L.',
    role: 'Professora',
    initials: 'AL',
    gradient: 'from-[#A78BFA] to-[#F472B6]',
  },
  {
    text: 'O sandbox de IA dentro do curso é genial. Prática real, não só teoria.',
    name: 'Pedro S.',
    role: 'Desenvolvedor',
    initials: 'PS',
    gradient: 'from-[#FBBF24] to-[#F87171]',
  },
];

export const SocialProofSection = () => {
  return (
    <section id="depoimentos" className="bg-[#08080C] py-[clamp(80px,10vw,120px)] scroll-mt-16">
      <div className="max-w-[1200px] mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-semibold tracking-[0.15em] uppercase text-[#A78BFA] mb-4">PROVA REAL</span>
            <h2 className="font-landing font-bold text-white leading-[1.12] tracking-[-0.03em]" style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}>
              Quem aprendeu, recomenda.
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {testimonials.map((t, i) => (
            <ScrollReveal key={i} delay={i * 80}>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 transition-colors hover:border-white/[0.12]">
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, s) => (
                    <span key={s} className="text-[#FBBF24] text-sm">★</span>
                  ))}
                </div>
                {/* Text */}
                <p className="text-white/80 text-sm leading-relaxed mb-5">"{t.text}"</p>
                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-xs font-bold`}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">{t.name}</div>
                    <div className="text-white/35 text-xs">{t.role}</div>
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
