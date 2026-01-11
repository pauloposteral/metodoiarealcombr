import { useEffect } from 'react';
import { Zap, Trophy } from 'lucide-react';

interface PointsNotificationProps {
  points: number;
  action: string;
  show: boolean;
  onClose: () => void;
}

export function PointsNotification({ points, action, show, onClose }: PointsNotificationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed top-20 right-4 z-50">
      <div 
        className="bg-gradient-to-r from-accent to-gold-light text-accent-foreground px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in-down"
      >
        <div className="bg-white/20 p-2 rounded-full">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <p className="font-bold text-lg">+{points} pontos!</p>
          <p className="text-sm opacity-90">{action}</p>
        </div>
      </div>
    </div>
  );
}

interface BadgeNotificationProps {
  badgeName: string;
  show: boolean;
  onClose: () => void;
}

export function BadgeNotification({ badgeName, show, onClose }: BadgeNotificationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed top-20 right-4 z-50">
      <div 
        className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in-down"
      >
        <div className="bg-white/20 p-3 rounded-full">
          <Trophy className="w-6 h-6" />
        </div>
        <div>
          <p className="font-bold text-lg">Novo Badge!</p>
          <p className="text-sm opacity-90">Você conquistou: {badgeName}</p>
        </div>
      </div>
    </div>
  );
}
