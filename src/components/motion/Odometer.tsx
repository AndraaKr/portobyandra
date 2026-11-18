import React, { useState, useEffect } from 'react';
import { useInViewOnce } from '../../lib/useInViewOnce';
import { useReducedMotion } from '../../lib/useReducedMotion';

interface OdometerProps {
  value: string | number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export const Odometer: React.FC<OdometerProps> = ({ value, className = '', prefix = '', suffix = '' }) => {
  const [containerRef, isInView] = useInViewOnce<HTMLSpanElement>(0.15);
  const reducedMotion = useReducedMotion();
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [isInView, hasAnimated]);

  const rawStr = String(value);
  const fullText = `${prefix}${rawStr}${suffix}`;

  const chars = rawStr.split('');
  let animatedDigitCount = 0;

  return (
    <span ref={containerRef} className={`inline-flex items-baseline ${className}`} aria-label={fullText}>
      {prefix && <span aria-hidden="true">{prefix}</span>}
      <span className="sr-only">{fullText}</span>
      <span aria-hidden="true" className="inline-flex items-baseline">
        {chars.map((ch, idx) => {
          const isDigit = /\d/.test(ch);
          if (!isDigit || reducedMotion || animatedDigitCount >= 4) {
            return (
              <span key={idx} className="inline-block">
                {ch}
              </span>
            );
          }

          const digitVal = parseInt(ch, 10);
          const delayMs = Math.min(animatedDigitCount * 15, 60);
          animatedDigitCount++;

          const translateY = hasAnimated ? -(digitVal * 10) : 0;

          return (
            <span key={idx} className="odometer-digit">
              <span
                className={`odometer-reel ${hasAnimated ? 'rolling' : ''}`}
                style={{
                  transform: `translateY(${translateY}%)`,
                  transitionDelay: `${delayMs}ms`,
                }}
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <span key={n} className="inline-block text-center leading-[1.15]">
                    {n}
                  </span>
                ))}
              </span>
            </span>
          );
        })}
      </span>
      {suffix && <span aria-hidden="true">{suffix}</span>}
    </span>
  );
};
