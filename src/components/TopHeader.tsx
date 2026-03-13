import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export const TopHeader = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        scrolled
          ? 'bg-[#08080C]/80 backdrop-blur-xl border-b border-white/[0.06]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between h-14">
        {/* Logo */}
        <Link to="/" className="font-landing font-bold text-xl tracking-tight">
          <span className="text-[#6EE7B7]">IA</span>
          <span className="text-white"> Real</span>
        </Link>

        {/* CTA */}
        <Link
          to="/auth"
          className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold text-[#08080C] bg-gradient-to-r from-[#6EE7B7] to-[#3B82F6] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-4px_rgba(110,231,183,0.4)] transition-all duration-200"
        >
          Começar agora
        </Link>
      </div>
    </header>
  );
};
