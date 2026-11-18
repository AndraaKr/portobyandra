import React, { useState, useEffect } from 'react';

const SECTIONS = [
  { id: 'section-tentang', label: '01' },
  { id: 'section-pengalaman', label: '02' },
  { id: 'section-karya', label: '03' },
  { id: 'section-sertifikat', label: '04' },
  { id: 'section-kontak', label: '05' },
];

export const Ruler: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveIdx(i);
          return;
        }
      }
      setActiveIdx(0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'auto' });
    }
  };

  return (
    <nav
      aria-label="Penggaris indeks bagian"
      className="hidden lg:flex fixed left-4 top-1/2 -translate-y-1/2 flex-col gap-5 z-40 select-none"
    >
      <div className="relative flex flex-col gap-5 pl-3 border-l border-rule">
        <div
          className="ruler-indicator"
          style={{ transform: `translateY(${activeIdx * 36}px)` }}
          aria-hidden="true"
        />
        {SECTIONS.map((sec, i) => (
          <button
            key={sec.id}
            type="button"
            onClick={() => scrollTo(sec.id)}
            className={`label-mono text-xs text-left cursor-pointer transition-colors duration-120 bg-transparent border-none p-0 h-4 leading-4 ${
              activeIdx === i ? 'text-ink font-bold' : 'text-ink-2 opacity-50 hover:opacity-100'
            }`}
          >
            {sec.label}
          </button>
        ))}
      </div>
    </nav>
  );
};
