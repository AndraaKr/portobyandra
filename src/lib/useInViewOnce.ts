import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';

export function useInViewOnce<T extends HTMLElement = HTMLDivElement>(
  threshold = 0.05,
  initialInView = false
): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const reducedMotion = useReducedMotion();
  const [isInView, setIsInView] = useState(() => reducedMotion || initialInView);

  useEffect(() => {
    if (reducedMotion || isInView) {
      setIsInView(true);
      return;
    }

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, reducedMotion, isInView]);

  return [ref, isInView];
}
