import { Link } from 'react-router-dom';
import logo from '@/assets/logo-iareal.png';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 md:py-12 bg-navy-dark border-t border-primary-foreground/10">
      <div className="container px-4 md:px-8">
        <div className="flex flex-col items-center text-center">
          <img 
            src={logo} 
            alt="Método IA Real" 
            className="h-14 md:h-16 lg:h-20 mb-4 md:mb-6 opacity-80 w-auto min-w-[180px] md:min-w-[200px] object-contain"
          />
          <p className="text-primary-foreground/50 text-xs md:text-sm mb-4 max-w-md px-4">
            Método IA Real — Aprenda a usar inteligência artificial de forma prática e aplicável.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-4 md:mb-6 text-sm">
            <Link 
              to="/termos" 
              className="text-primary-foreground/60 hover:text-accent transition-colors py-1 px-2 -mx-2"
            >
              Termos de Uso
            </Link>
            <Link 
              to="/privacidade" 
              className="text-primary-foreground/60 hover:text-accent transition-colors py-1 px-2 -mx-2"
            >
              Privacidade
            </Link>
            <a 
              href="mailto:contato@metodoiareal.com.br" 
              className="text-primary-foreground/60 hover:text-accent transition-colors py-1 px-2 -mx-2"
            >
              Suporte
            </a>
          </div>
          <p className="text-primary-foreground/40 text-[10px] md:text-xs">
            © {currentYear} Método IA Real. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
