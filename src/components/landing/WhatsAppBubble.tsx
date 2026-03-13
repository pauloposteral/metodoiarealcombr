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
    <div className="fixed bottom-28 sm:bottom-6 right-4 z-40 flex items-end gap-2 animate-fade-in">
      {/* Tooltip — à esquerda do botão */}
      <div className="relative bg-card border border-border rounded-xl shadow-lg p-2.5 max-w-[180px]">
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
        className="w-12 h-12 sm:w-14 sm:h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110 shrink-0"
        aria-label="Contato via WhatsApp"
      >
        <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
      </a>
    </div>
  );
};
