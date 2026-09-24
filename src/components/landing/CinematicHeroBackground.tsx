import { useEffect, useState } from 'react';
import heroPoster from '@/assets/landing/hero-cinematic-poster.jpg';
import heroVideo from '@/assets/landing/hero-cinematic.mp4.asset.json';

type NetworkInformation = {
  saveData?: boolean;
  effectiveType?: string;
};

export function CinematicHeroBackground() {
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

  return (
    <div className="lv2-hero-media" aria-hidden="true">
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