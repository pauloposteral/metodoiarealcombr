type Props = {
  index: number;
};

export function CinemaVectorOverlay({ index }: Props) {
  const suffix = `scene-${index}`;

  return (
    <div className="lcn-vector-layer" aria-hidden="true">
      <svg className="lcn-circuit-map" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id={`circuit-glow-${suffix}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g className="lcn-circuit-grid">
          <path d="M0 118H164L214 168H424L474 118H646" />
          <path d="M1440 166H1248L1196 218H1008L944 154H786" />
          <path d="M0 730H214L276 668H462L524 730H704" />
          <path d="M1440 756H1264L1198 690H1052L982 760H836" />
          <path d="M178 0V128L238 188V352L182 408V566" />
          <path d="M1260 0V130L1200 190V350L1258 408V586" />
        </g>

        <g className="lcn-circuit-flow" filter={`url(#circuit-glow-${suffix})`}>
          <path pathLength="1" d="M-40 118H164L214 168H424L474 118H686" />
          <path pathLength="1" d="M1480 756H1264L1198 690H1052L982 760H794" />
          <path pathLength="1" d="M178 -40V128L238 188V352L182 408V606" />
        </g>

        <g className="lcn-circuit-nodes">
          <circle cx="214" cy="168" r="4" />
          <circle cx="474" cy="118" r="4" />
          <circle cx="1196" cy="218" r="4" />
          <circle cx="276" cy="668" r="4" />
          <circle cx="1198" cy="690" r="4" />
          <circle cx="182" cy="408" r="4" />
        </g>

        <g className="lcn-vector-core" transform="translate(720 450)">
          <circle r="176" />
          <circle r="132" />
          <path d="M-208 0H-156M156 0H208M0-208V-156M0 156V208" />
          <path className="lcn-core-arc" d="M-94-94A133 133 0 0 1 94-94" />
          <path className="lcn-core-arc lcn-core-arc-alt" d="M94 94A133 133 0 0 1-94 94" />
        </g>

        <g className="lcn-frame-corners">
          <path d="M34 94V34H94M1346 34H1406V94M34 806V866H94M1346 866H1406V806" />
        </g>
      </svg>

      <div className="lcn-anamorphic-flare" />
      <div className="lcn-transition-shutter lcn-transition-shutter-top" />
      <div className="lcn-transition-shutter lcn-transition-shutter-bottom" />
      <span className="lcn-scan-beam" />
    </div>
  );
}