import { Link } from 'react-router-dom';
import { Crown, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo-iareal.png';

export const TopHeader = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-navy-dark/80 backdrop-blur-md border-b border-gold/20">
      <div className="container">
        <div className="flex items-center justify-between h-14">
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Método IA Real" className="h-[100px] sm:h-[120px] w-auto" />
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => scrollToSection('modulos')}
              className="text-sm text-primary-foreground/70 hover:text-gold transition-colors"
            >
              Módulos
            </button>
            <button
              onClick={() => scrollToSection('depoimentos')}
              className="text-sm text-primary-foreground/70 hover:text-gold transition-colors"
            >
              Depoimentos
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="text-sm text-primary-foreground/70 hover:text-gold transition-colors"
            >
              FAQ
            </button>
          </nav>

          {/* VIP Member Access */}
          <Link to="/auth">
            <Button 
              variant="ghost" 
              size="sm"
              className="group relative overflow-hidden border border-gold/30 bg-gold/5 hover:bg-gold/15 hover:border-gold/50 text-primary-foreground transition-all duration-300"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-gold/0 via-gold/10 to-gold/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Crown className="w-8 h-8 sm:w-10 sm:h-10 sm:mr-2 text-gold" />
              <span className="font-medium hidden sm:inline text-lg">Área VIP</span>
              <LogIn className="w-8 h-8 sm:w-10 sm:h-10 ml-1 sm:ml-2 opacity-60 group-hover:opacity-100 transition-opacity" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
