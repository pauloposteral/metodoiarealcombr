import { forwardRef, useEffect, useRef, useState, type ReactNode } from 'react';
import type { CinemaScene } from './cinemaScenes';
import { CinemaVectorOverlay } from './CinemaVectorOverlay';

type NetworkInformation = { saveData?: boolean; effectiveType?: string };

type Props = {
  scene: CinemaScene;
  index: number;
  total: number;
  children?: ReactNode;
};

export const LandingCinemaScene = forwardRef<HTMLElement, Props>(function LandingCinemaScene(
  { scene, index, total, children },
  forwardedRef,
) {
  const localRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(index === 0);
  const [isVisible, setIsVisible] = useState(index === 0);
  const [isReady, setIsReady] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const [canPlay, setCanPlay] = useState(false);

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setCanPlay(!reduced && !connection?.saveData && connection?.effectiveType !== '2g' && Boolean(scene.video));
  }, [scene.video]);

  useEffect(() => {
    const root = localRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = Boolean(entry?.isIntersecting);
        if (visible) setShouldLoad(true);
        setIsVisible(visible);
        root.classList.toggle('is-live', visible);
        root.style.setProperty('--lcn-visibility', `${entry?.intersectionRatio ?? 0}`);
      },
      { rootMargin: '250px 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const media = videoRef.current;
    if (!media) return;
    if (isVisible && canPlay) media.play().catch(() => setHasFailed(true));
    else media.pause();
  }, [isVisible, canPlay, shouldLoad]);

  return (
    <section
      ref={(node) => {
        localRef.current = node;
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLElement | null>).current = node;
      }}
      id={scene.id}
      className={`lcn-scene lcn-tone-${scene.tone}`}
      aria-label={`${scene.slate} — ${scene.chapter}`}
    >
      <div className="lcn-frame">
        <img className="lcn-poster" src={scene.poster} alt="" loading={index === 0 ? 'eager' : 'lazy'} />
        {shouldLoad && canPlay && !hasFailed && (
          <video
            ref={videoRef}
            className={`lcn-video ${isReady ? 'is-ready' : ''}`}
            src={scene.video}
            poster={scene.poster}
            muted
            loop
            playsInline
            preload="none"
            disablePictureInPicture
            onCanPlay={() => setIsReady(true)}
            onError={() => setHasFailed(true)}
          />
        )}
        <div className="lcn-grain" aria-hidden="true" />
        <div className="lcn-vignette" aria-hidden="true" />
      </div>

      <CinemaVectorOverlay index={index} />

      <div className="lcn-slate" aria-hidden="true">
        <span>{scene.slate}</span>
        <span className="lcn-slate-sep">//</span>
        <span>{scene.chapter}</span>
        <span className="lcn-slate-count">
          {String(index + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}
        </span>
      </div>

      <div className="lcn-content">
        <span className="lcn-kicker">{scene.kicker}</span>
        <h2 className="lcn-title">
          {scene.title.map((word, i) => (
            <span key={`${word}-${i}`} className="lcn-word" style={{ transitionDelay: `${90 + i * 65}ms` }}>
              {word}
            </span>
          ))}
        </h2>
        <p className="lcn-body">{scene.body}</p>
        {children}
      </div>
    </section>
  );
});
