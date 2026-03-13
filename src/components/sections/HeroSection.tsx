import { Link } from 'react-router-dom';
import { ScrollReveal } from '@/components/ScrollReveal';

export const HeroSection = () => {
  const stats = [
    { value: '2.500+', label: 'Alunos' },
    { value: '4.9 ★', label: 'Avaliação' },
    { value: '43+', label: 'Aulas práticas' },
    { value: '8h', label: 'De conteúdo' },
  ];

  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-[#08080C]">
      {/* Grain overlay */}
      <div className="absolute inset-0 opacity-[0.35] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
        backgroundSize: '128px 128px',
      }} />

      {/* Radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(110,231,183,0.08),rgba(59,130,246,0.04),transparent_70%)]" />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center pt-20 pb-12">
        {/* Pulsing badge */}
        <ScrollReveal>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.06] bg-white/[0.02] mb-8">
            <span className="w-2 h-2 rounded-full bg-[#6EE7B7] animate-pulse" />
            <span className="text-white/55 text-sm">+2.500 alunos já estão aprendendo</span>
          </div>
        </ScrollReveal>

        {/* Headline */}
        <ScrollReveal delay={60}>
          <h1 className="font-landing font-bold text-white leading-[1.08] tracking-[-0.03em] mb-6" style={{ fontSize: 'clamp(36px, 6vw, 64px)' }}>
            Aprenda IA de verdade.{' '}
            <span className="bg-gradient-to-r from-[#6EE7B7] to-[#3B82F6] bg-clip-text text-transparent">
              Aplique hoje.
            </span>
          </h1>
        </ScrollReveal>

        {/* Sub-headline */}
        <ScrollReveal delay={120}>
          <p className="text-white/55 max-w-xl mx-auto mb-10 leading-relaxed" style={{ fontSize: 'clamp(16px, 2vw, 20px)' }}>
            Método prático e direto para usar inteligência artificial no seu dia a dia — sem tecnicismos.
          </p>
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal delay={180}>
          <div className="flex flex-col items-center gap-4 mb-12">
            <Link
              to="/auth"
              className="inline-flex items-center px-8 py-4 rounded-xl text-lg font-semibold text-[#08080C] bg-gradient-to-r from-[#6EE7B7] to-[#3B82F6] hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-4px_rgba(110,231,183,0.4)] transition-all duration-200 min-h-[44px]"
            >
              Começar agora
            </Link>
            <p className="text-white/35 text-sm">Garantia de 7 dias · Acesso imediato</p>
          </div>
        </ScrollReveal>

        {/* Stats */}
        <ScrollReveal delay={240}>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10 pt-8 border-t border-white/[0.06]">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="font-landing font-bold text-white text-lg sm:text-xl">{stat.value}</div>
                <div className="text-white/35 text-xs mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
