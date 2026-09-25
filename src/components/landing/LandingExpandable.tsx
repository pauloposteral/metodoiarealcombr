import { useRef, useState, type ReactNode } from 'react';

interface ExpandableBlockProps {
  /** Text shown on the closed trigger, e.g. "Ver as 16 ferramentas" */
  label: string;
  /** Text shown when open */
  labelOpen?: string;
  /** Optional short line above the trigger, summarising what's inside */
  hint?: string;
  children: ReactNode;
}

/**
 * Keeps a full section in the page but collapsed by default, so the offer stays
 * close to the top. Nothing is removed — one click reveals the original block.
 */
export const ExpandableBlock = ({ label, labelOpen, hint, children }: ExpandableBlockProps) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    const before = rootRef.current?.getBoundingClientRect().top;
    setOpen((value) => {
      const nextOpen = !value;
      if (nextOpen) {
        window.requestAnimationFrame(() => {
          rootRef.current?.querySelectorAll('.rv').forEach((item) => item.classList.add('in'));
        });
      }
      return nextOpen;
    });
    window.requestAnimationFrame(() => {
      if (before === undefined || !rootRef.current) return;
      const delta = rootRef.current.getBoundingClientRect().top - before;
      if (Math.abs(delta) > 1) window.scrollBy(0, delta);
    });
  };

  return (
    <div ref={rootRef} className={`lv2-expand ${open ? 'open' : ''}`}>
      {hint && !open && <p className="lv2-expand-hint">{hint}</p>}
      <button type="button" className="lv2-expand-btn" onClick={toggle} aria-expanded={open}>
        {open ? labelOpen ?? 'Recolher' : label}
        <span className="lv2-expand-arr" aria-hidden>↓</span>
      </button>
      {open && <div className="lv2-expand-body">{children}</div>}
    </div>
  );
};
