import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-[#08080C] border-t border-white/[0.06] py-6">
      <div className="max-w-[1200px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-white/35 text-xs">© {new Date().getFullYear()} Método IA Real</p>
        <div className="flex items-center gap-6">
          <Link to="/termos" className="text-white/35 text-xs hover:text-white/55 transition-colors">Termos</Link>
          <Link to="/privacidade" className="text-white/35 text-xs hover:text-white/55 transition-colors">Privacidade</Link>
        </div>
      </div>
    </footer>
  );
};
