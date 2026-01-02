import logo from '@/assets/logo-iareal.png';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 bg-navy-dark border-t border-primary-foreground/10">
      <div className="container">
        <div className="flex flex-col items-center text-center">
          <img 
            src={logo} 
            alt="Método IA Real" 
            className="h-12 mb-6 opacity-80"
          />
          <p className="text-primary-foreground/50 text-sm mb-4 max-w-md">
            Método IA Real — Aprenda a usar inteligência artificial de forma prática e aplicável.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm">
            <a href="#" className="text-primary-foreground/60 hover:text-accent transition-colors">
              Termos de Uso
            </a>
            <a href="#" className="text-primary-foreground/60 hover:text-accent transition-colors">
              Política de Privacidade
            </a>
            <a href="#" className="text-primary-foreground/60 hover:text-accent transition-colors">
              Suporte
            </a>
          </div>
          <p className="text-primary-foreground/40 text-xs">
            © {currentYear} Método IA Real. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
