import { useEffect, useRef, useState } from 'react';

type NetworkInformation = {
  saveData?: boolean;
  effectiveType?: string;
};

type CinematicChapterProps = {
  act: string;
  title: string;
  body: string;
  poster: string;
  video: string;
  align?: 'left' | 'right';
  tone?: 'noise' | 'map' | 'living' | 'execution' | 'horizon';
};

export function CinematicChapter({ act, title, body, poster, video, align = 'left', tone = 'map' }: CinematicChapterProps) {
  const rootRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [canPlay] = useState(() => {
    if (typeof window === 'undefined') return false;
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      && !connection?.saveData
      && connection?.effectiveType !== '2g'
      && Boolean(video);
  });
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (!canPlay) return;
    const checkProximity = () => {
      const bounds = root.getBoundingClientRect();
      if (bounds.top <= window.innerHeight + 500 && bounds.bottom >= -500) setShouldLoad(true);
    };
    const playbackObserver = new IntersectionObserver(
      ([entry]) => setIsVisible(Boolean(entry?.isIntersecting)),
      { rootMargin: '180px 0px', threshold: 0.08 },
    );

    checkProximity();
    window.addEventListener('scroll', checkProximity, { passive: true });
    window.addEventListener('resize', checkProximity);
    playbackObserver.observe(root);
    return () => {
      window.removeEventListener('scroll', checkProximity);
      window.removeEventListener('resize', checkProximity);
      playbackObserver.disconnect();
    };
  }, [canPlay]);

  useEffect(() => {
    const media = videoRef.current;
    if (!media || !shouldLoad) return;
    if (isVisible) media.play().catch(() => setHasFailed(true));
    else media.pause();
  }, [isVisible, shouldLoad]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.matchMedia('(pointer: coarse)').matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = root.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;
      const progress = Math.max(-1, Math.min(1, (center - viewportCenter) / window.innerHeight));
      root.style.setProperty('--chapter-shift', `${progress * -36}px`);
      root.style.setProperty('--chapter-copy', `${progress * 14}px`);
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
    <section ref={rootRef} className={`lv2-cinema-chapter lv2-cinema-${align} lv2-tone-${tone}`} aria-label={`${act}: ${title}`}>
      <img className="lv2-cinema-poster" src={poster} alt="" loading="lazy" width={1536} height={864} />
      {shouldLoad && !hasFailed && (
        <video
          ref={videoRef}
          className={`lv2-cinema-video ${isReady ? 'is-ready' : ''}`}
          src={video}
          poster={poster}
          muted
          loop
          playsInline
          preload="none"
          disablePictureInPicture
          onCanPlay={() => setIsReady(true)}
          onError={() => setHasFailed(true)}
        />
      )}
      <div className="lv2-cinema-scrim" aria-hidden="true" />
      <div className="lv2-cinema-grid" aria-hidden="true" />
      <div className="lv2-wrap lv2-cinema-content rv">
        <span className="lv2-cinema-act">{act}</span>
        <h2>{title}</h2>
        <p>{body}</p>
        <span className="lv2-cinema-line" aria-hidden="true" />
      </div>
    </section>
  );
}