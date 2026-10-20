import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Clapperboard, FlaskConical, Home, UserRound, type LucideIcon } from 'lucide-react';
import { MEMBER_NAVIGATION, memberNavigationGroup, type MemberDestination } from '@/lib/memberNavigation';

const icons: Record<MemberDestination, LucideIcon> = {
  home: Home,
  learn: BookOpen,
  lab: FlaskConical,
  create: Clapperboard,
  profile: UserRound,
};

/** One-hand navigation. Uses existing routes/permissions; no new access or progress logic. */
export function MobileTouchNav() {
  const { pathname } = useLocation();
  const active = memberNavigationGroup(pathname);

  return (
    <nav aria-label="Navegação rápida" data-touch-nav className="touch-bottom-nav md:hidden print:hidden">
      <div className="touch-bottom-nav-grid">
        {MEMBER_NAVIGATION.map((destination) => {
          const Icon = icons[destination.id];
          const selected = active === destination.id;
          return (
            <Link
              key={destination.id}
              to={destination.url}
              aria-label={destination.title}
              aria-current={selected ? 'page' : undefined}
              data-touch-destination={destination.id}
              className={`touch-bottom-nav-link ${selected ? 'is-active' : ''}`}
            >
              <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />
              <span aria-hidden="true">{destination.id === 'lab' ? 'Lab' : destination.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
