'use client';
import { useEffect, useRef } from 'react';

// Layer 3: CSP inside the frame. No network at all; only inline styles.
const CSP = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'">`;
const BASE = `<style>body{font-family:Georgia,serif;line-height:1.6;max-width:720px;margin:0 auto;padding:24px;color:#1b1b1b;background:#fff}a{color:#2456c8}</style>`;

type Props = {
  html: string;
  scrollY: number;
  onLink: (href: string) => void;
  onScroll: (y: number) => void;
};

export function PageFrame({ html, scrollY, onLink, onScroll }: Props) {
  const ref = useRef<HTMLIFrameElement>(null);
  const initialScroll = useRef(scrollY); // the position this entry was left at
  const cb = useRef({ onLink, onScroll });
  const raf = useRef(0);

  useEffect(() => {
    cb.current = { onLink, onScroll };
  });
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  function handleLoad() {
    const frame = ref.current;
    const doc = frame?.contentDocument;
    const win = frame?.contentWindow;
    if (!doc || !win) return;

    // Restore on return: put the page back where it was left.
    win.scrollTo(0, initialScroll.current);

    // Every link click is intercepted and routed through our own navigation.
    doc.addEventListener('click', (e) => {
      const a = (e.target as Element).closest?.('a');
      if (!a) return;
      e.preventDefault();
      const href = a.getAttribute('href');
      if (href) cb.current.onLink(href);
    });

    // Remember scroll position (one update per animation frame).
    win.addEventListener(
      'scroll',
      () => {
        cancelAnimationFrame(raf.current);
        raf.current = requestAnimationFrame(() => cb.current.onScroll(win.scrollY));
      },
      { passive: true },
    );
  }

  const srcDoc = `<!doctype html><html><head><meta charset="utf-8">${CSP}${BASE}</head><body>${html}</body></html>`;

  return (
    <iframe
      ref={ref}
      title="page"
      className="frame"
      srcDoc={srcDoc}
      sandbox="allow-same-origin"
      referrerPolicy="no-referrer"
      onLoad={handleLoad}
    />
  );
}