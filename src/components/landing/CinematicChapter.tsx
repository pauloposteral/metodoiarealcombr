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
  const [canPlay] = useState(() => {
    if (typeof window === 'undefined') return false;
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      && !connection?.saveData
      && connection?.effectiveType !== '2g'
      && Boolean(video);
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (!canPlay) return;
    const playbackObserver = new IntersectionObserver(
      ([entry]) => setIsVisible(Boolean(entry?.isIntersecting)),
      { rootMargin: '180px 0px', threshold: 0.08 },
    );

    playbackObserver.observe(root);
    return () => playbackObserver.disconnect();
  }, [canPlay]);

  useEffect(() => {
    const media = videoRef.current;
    if (!media || !canPlay) return;
    if (isVisible) media.play().catch(() => setHasFailed(true));
    else media.pause();
  }, [canPlay, isVisible]);

  return (
    <section ref={rootRef} className={`lv2-cinema-chapter lv2-cinema-${align}`} aria-label={`${act}: ${title}`}>
      <img className="lv2-cinema-poster" src={poster} alt="" loading="lazy" width={1536} height={864} />
      {canPlay && !hasFailed && (
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