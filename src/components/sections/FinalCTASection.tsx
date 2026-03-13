import { Link } from 'react-router-dom';
import { ScrollReveal } from '@/components/ScrollReveal';
import { CheckCircle } from 'lucide-react';

const badges = [
  'Comunidade privada',
  'Certificado',
  'Atualizações grátis',
  'Suporte dedicado',
  'Sandbox IA',
];

export const FinalCTASection = () => {
  return (
    <section className="relative bg-[#08080C] py-[clamp(80px,10vw,120px)] overflow-hidden">
      {/* Green radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(110,231,183,0.06),transparent_70%)]" />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
        <ScrollReveal>
          <h2 className="font-landing font-bold text-white leading-[1.08] tracking-[-0.03em] mb-4" style={{ fontSize: 'clamp(32px, 5vw, 52px)' }}>
            Pronto pra dominar IA?
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={60}>
          <p className="text-white/55 max-w-xl mx-auto mb-10" style={{ fontSize: 'clamp(16px, 2vw, 18px)' }}>
            Acesso vitalício a todos os módulos, bônus exclusivos, comunidade privada e certificado.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={120}>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {badges.map((b, i) => (
              <div key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] text-white/80 text-sm">
                <CheckCircle className="w-3.5 h-3.5 text-[#6EE7B7]" />
                {b}
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={180}>
          <div className="flex flex-col items-center gap-4">
            <Link
              to="/auth"
              className="inline-flex items-center px-8 py-4 rounded-xl text-lg font-semibold text-[#08080C] bg-gradient-to-r from-[#6EE7B7] to-[#3B82F6] hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-4px_rgba(110,231,183,0.4)] transition-all duration-200 min-h-[44px]"
            >
              Começar agora
            </Link>
            <p className="text-white/35 text-sm">Garantia incondicional de 7 dias · Pagamento seguro</p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
