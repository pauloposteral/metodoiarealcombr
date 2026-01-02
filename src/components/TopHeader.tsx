import { Link } from 'react-router-dom';
import { Crown, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const TopHeader = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-navy-dark/80 backdrop-blur-md border-b border-gold/20">
      <div className="container">
        <div className="flex items-center justify-between h-14">
          {/* Logo / Brand */}
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-gold" />
            <span className="text-sm font-medium text-primary-foreground/80 hidden sm:inline">
              Método IA Real
            </span>
          </div>

          {/* VIP Member Access */}
          <Link to="/auth">
            <Button 
              variant="ghost" 
              size="sm"
              className="group relative overflow-hidden border border-gold/30 bg-gold/5 hover:bg-gold/15 hover:border-gold/50 text-primary-foreground transition-all duration-300"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-gold/0 via-gold/10 to-gold/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Crown className="w-4 h-4 mr-2 text-gold" />
              <span className="font-medium">Área VIP</span>
              <LogIn className="w-4 h-4 ml-2 opacity-60 group-hover:opacity-100 transition-opacity" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
