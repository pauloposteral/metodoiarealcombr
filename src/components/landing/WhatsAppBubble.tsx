import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';

export const WhatsAppBubble = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible || isDismissed) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 z-40 flex flex-col items-end gap-2 animate-fade-in">
      {/* Tooltip */}
      <div className="relative bg-card border border-border rounded-xl shadow-lg p-3 max-w-[200px]">
        <button
          onClick={() => setIsDismissed(true)}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-muted rounded-full flex items-center justify-center"
          aria-label="Fechar"
        >
          <X className="w-3 h-3 text-muted-foreground" />
        </button>
        <p className="text-xs text-foreground font-medium">Dúvidas? Fale com a gente! 👋</p>
      </div>
      
      {/* Button */}
      <a
        href="https://wa.me/5500000000000?text=Olá! Tenho interesse no Método IA Real"
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110"
        aria-label="Contato via WhatsApp"
      >
        <MessageCircle className="w-7 h-7 text-white" />
      </a>
    </div>
  );
};
