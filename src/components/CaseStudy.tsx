"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { artworkById } from "@/data/gallery";
import { useGallery } from "@/store";

export default function CaseStudy() {
  const active = useGallery((s) => s.active);
  const setActive = useGallery((s) => s.setActive);
  const [shown, setShown] = useState<string | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const veil = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (active) {
      setShown(active);
    } else if (shown && panel.current) {
      gsap.to(panel.current, { x: "100%", duration: 0.5, ease: "power3.in", onComplete: () => setShown(null) });
      gsap.to(veil.current, { opacity: 0, duration: 0.4 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    if (shown && panel.current) {
      gsap.fromTo(panel.current, { x: "100%" }, { x: "0%", duration: 0.9, ease: "power3.out", delay: 0.35 });
      gsap.fromTo(veil.current, { opacity: 0 }, { opacity: 1, duration: 0.8, delay: 0.3 });
      gsap.fromTo(panel.current.querySelectorAll<HTMLElement>("[data-reveal]"), { y: 14, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.6, ease: "power2.out", delay: 0.7 });
    }
  }, [shown]);

  if (!shown) return null;
  const art = artworkById.get(shown);
  if (!art) return null;
  const c = art.study;

  return (
    <div className="case">
      <div className="veil" ref={veil} />
      <div className="panel" ref={panel} role="dialog" aria-label={c.title}>
        <div className="top" data-reveal>
          <span className="eyebrow">{c.eyebrow}</span>
          <button className="close" onClick={() => setActive(null)} aria-label="Close">×</button>
        </div>
        <h2 data-reveal>{c.title}</h2>
        {c.meta && (
          <div className="meta" data-reveal>
            {c.meta.map((m) => (<div key={m.label}><span>{m.label}</span>{m.value}</div>))}
          </div>
        )}
        {c.sections.map((s) => (
          <section key={s.heading} data-reveal>
            <h3>{s.heading}</h3>
            {s.body && <p>{s.body}</p>}
            {s.bullets && <ul className="list">{s.bullets.map((b) => <li key={b}>{b}</li>)}</ul>}
          </section>
        ))}
        {c.tags && <div className="tags" data-reveal>{c.tags.map((t) => <span key={t}>{t}</span>)}</div>}
        {c.links && (
          <div className="links" data-reveal>
            {c.links.map((l) => (<a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a>))}
          </div>
        )}
        <div className="foot">ESC or × to return to the room</div>
      </div>
    </div>
  );
}
