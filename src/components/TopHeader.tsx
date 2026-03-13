import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Crown, LogIn, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo-iareal.png';

export const TopHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    setIsMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-9 sm:top-10 left-0 right-0 z-50 bg-navy-dark/85 backdrop-blur-md border-b border-gold/20 shadow-sm">
      <div className="container px-4 md:px-8">
        <div className="flex items-center justify-between h-12 md:h-14">
          {/* Logo / Brand - Smaller on mobile */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Método IA Real" className="h-8 sm:h-9 md:h-10 w-auto object-contain" />
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

          {/* Right side - VIP + Mobile menu */}
          <div className="flex items-center gap-2">
            {/* VIP Member Access - Compact on mobile */}
            <Link to="/auth">
              <Button 
                variant="ghost" 
                size="sm"
                className="group relative overflow-hidden border border-gold/30 bg-gold/5 hover:bg-gold/15 hover:border-gold/50 text-primary-foreground transition-all duration-300 px-2 sm:px-3"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-gold/0 via-gold/10 to-gold/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-gold" />
                <span className="font-medium hidden sm:inline text-sm sm:text-base ml-1.5">Área VIP</span>
                <LogIn className="w-4 h-4 sm:w-5 sm:h-5 ml-1 opacity-60 group-hover:opacity-100 transition-opacity" />
              </Button>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-primary-foreground/80 hover:text-gold transition-colors"
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMenuOpen && (
          <div className="md:hidden py-3 border-t border-gold/10 animate-fade-in">
            <nav className="flex flex-col gap-1">
              <button
                onClick={() => scrollToSection('modulos')}
                className="text-left py-2.5 px-3 text-sm text-primary-foreground/80 hover:text-gold hover:bg-gold/5 rounded-lg transition-colors"
              >
                Módulos
              </button>
              <button
                onClick={() => scrollToSection('depoimentos')}
                className="text-left py-2.5 px-3 text-sm text-primary-foreground/80 hover:text-gold hover:bg-gold/5 rounded-lg transition-colors"
              >
                Depoimentos
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className="text-left py-2.5 px-3 text-sm text-primary-foreground/80 hover:text-gold hover:bg-gold/5 rounded-lg transition-colors"
              >
                FAQ
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
