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
};

export function CinematicChapter({ act, title, body, poster, video, align = 'left' }: CinematicChapterProps) {
  const rootRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    const constrainedNetwork = connection?.saveData || connection?.effectiveType === '2g';
    if (reducedMotion || constrainedNetwork || !video) return;

    const preloadObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShouldLoad(true);
        preloadObserver.disconnect();
      },
      { rootMargin: '500px 0px' },
    );
    const playbackObserver = new IntersectionObserver(
      ([entry]) => setIsVisible(Boolean(entry?.isIntersecting)),
      { threshold: 0.18 },
    );

    preloadObserver.observe(root);
    playbackObserver.observe(root);
    return () => {
      preloadObserver.disconnect();
      playbackObserver.disconnect();
    };
  }, [video]);

  useEffect(() => {
    const media = videoRef.current;
    if (!media || !shouldLoad) return;
    if (isVisible) media.play().catch(() => setHasFailed(true));
    else media.pause();
  }, [isVisible, shouldLoad]);

  return (
    <section ref={rootRef} className={`lv2-cinema-chapter lv2-cinema-${align}`} aria-label={`${act}: ${title}`}>
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
          preload="metadata"
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