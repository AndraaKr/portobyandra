import React, { useState, useEffect } from 'react';
import { useInViewOnce } from '../../lib/useInViewOnce';

interface TypewriterTextProps {
  text: string;
  speed?: number; // milidetik per karakter
  delay?: number; // milidetik jeda sebelum mulai mengetik
  className?: string;
  cursorChar?: string; // karakter kursor mesin tik (default: '▍' atau '_')
  showCursorWhileTyping?: boolean;
  blinkCountAfterFinish?: number; // kedipan kursor setelah pengetikan selesai (finite)
  as?: 'span' | 'p' | 'div' | 'h1' | 'h2' | 'h3';
  replayKey?: number | string;
  triggerOnInView?: boolean;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 30,
  delay = 150,
  className = '',
  cursorChar = '▍',
  showCursorWhileTyping = true,
  blinkCountAfterFinish = 3,
  as: Component = 'span',
  replayKey,
  triggerOnInView = false,
}) => {
  const [containerRef, isInView] = useInViewOnce<HTMLElement>(0.1, !triggerOnInView);
  const [displayedText, setDisplayedText] = useState('');
  const [cursorVisible, setCursorVisible] = useState(false);

  useEffect(() => {
    // Bila pengguna memilih prefers-reduced-motion, tampilkan langsung
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayedText(text);
      setCursorVisible(false);
      return;
    }

    // Jika triggerOnInView aktif tetapi belum masuk viewport, tunggu
    if (triggerOnInView && !isInView) {
      return;
    }

    setDisplayedText('');
    setCursorVisible(showCursorWhileTyping);

    let typingTimer: ReturnType<typeof setInterval> | null = null;
    let blinkTimer: ReturnType<typeof setInterval> | null = null;
    let index = 0;

    const startTimer = setTimeout(() => {
      setCursorVisible(true);

      typingTimer = setInterval(() => {
        index += 1;
        setDisplayedText(text.slice(0, index));

        if (index >= text.length) {
          if (typingTimer) clearInterval(typingTimer);

          // Kursor berkedip beberapa kali secara terukur setelah pengetikan selesai
          let blinks = 0;
          blinkTimer = setInterval(() => {
            blinks += 1;
            setCursorVisible((v) => !v);
            if (blinks >= blinkCountAfterFinish * 2) {
              if (blinkTimer) clearInterval(blinkTimer);
              setCursorVisible(false);
            }
          }, 320);
        }
      }, speed);
    }, delay);

    return () => {
      clearTimeout(startTimer);
      if (typingTimer) clearInterval(typingTimer);
      if (blinkTimer) clearInterval(blinkTimer);
    };
  }, [text, speed, delay, showCursorWhileTyping, blinkCountAfterFinish, replayKey, isInView, triggerOnInView]);

  return (
    <Component ref={containerRef as any} className={className} aria-label={text}>
      <span>{displayedText}</span>
      {cursorVisible && (
        <span
          className="inline-block font-mono select-none text-ink leading-none ml-0.5"
          style={{ opacity: 0.85 }}
          aria-hidden="true"
        >
          {cursorChar}
        </span>
      )}
    </Component>
  );
};
