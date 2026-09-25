import { useEffect, useRef, useState } from 'react';
import heroPoster from '@/assets/landing/hero-cinematic-poster.jpg';
import heroVideo from '@/assets/landing/hero-cinematic.mp4.asset.json';

type NetworkInformation = {
  saveData?: boolean;
  effectiveType?: string;
};

export function CinematicHeroBackground() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [canPlay, setCanPlay] = useState(() => {
    if (typeof window === 'undefined') return false;
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      && !connection?.saveData
      && connection?.effectiveType !== '2g'
      && Boolean(heroVideo.url);
  });
  const [isReady, setIsReady] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    const constrainedNetwork = connection?.saveData || connection?.effectiveType === '2g';

    setCanPlay(!reducedMotion && !constrainedNetwork && Boolean(heroVideo.url));
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const progress = Math.min(1, Math.max(0, window.scrollY / Math.max(window.innerHeight, 1)));
      root.style.setProperty('--hero-parallax', `${progress * 34}px`);
      root.style.setProperty('--hero-scale', `${1 + progress * 0.035}`);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={rootRef} className="lv2-hero-media" aria-hidden="true">
      <img
        className="lv2-hero-poster"
        src={heroPoster}
        alt=""
        width={1536}
        height={864}
      />
      {canPlay && !hasFailed && (
        <video
          className={`lv2-hero-video ${isReady ? 'is-ready' : ''}`}
          src={heroVideo.url}
          poster={heroPoster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          disablePictureInPicture
          onCanPlay={() => setIsReady(true)}
          onError={() => setHasFailed(true)}
        />
      )}
      <div className="lv2-hero-scrim" />
    </div>
  );
}